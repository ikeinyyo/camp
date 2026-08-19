import "server-only";

import { TableClient, type TableEntity } from "@azure/data-tables";
import { DAILY_GAMES, getDailyGames, getMadridDate, type DailyGameKind, type DailyGames } from "@/config/daily-games";
import { STORAGE_SETTINGS } from "@/config/storage";
import { addPointMovement, deletePointMovement } from "@/lib/points";

const CHALLENGE_PARTITION = "challenge";

export type DailyGameAttempt = {
  userId: string;
  date: string;
  kind: DailyGameKind;
  correct: boolean;
  answer: string;
  createdAt: string;
};

type AttemptEntity = TableEntity<{
  date: string;
  kind: DailyGameKind;
  correct: boolean;
  answer: string;
  createdAt: string;
}>;

type ChallengeEntity = TableEntity<{ data: string; updatedAt: string }>;

export class DailyGameAlreadyAttemptedError extends Error {}
export class DailyGameUnavailableError extends Error {}

let tableReady: Promise<TableClient> | undefined;

async function table() {
  if (!tableReady) {
    tableReady = (async () => {
      const connection = process.env.AZURE_STORAGE_CONNECTION_STRING;
      if (!connection) throw new Error("Falta configurar AZURE_STORAGE_CONNECTION_STRING.");
      const client = TableClient.fromConnectionString(connection, STORAGE_SETTINGS.tables.games);
      await client.createTable();
      return client;
    })().catch((error) => { tableReady = undefined; throw error; });
  }
  return tableReady;
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9ñ]/g, "");
}

function rowKey(date: string, kind: DailyGameKind) {
  return `${date}-${kind}`;
}

function toAttempt(entity: AttemptEntity): DailyGameAttempt {
  return { userId: entity.partitionKey, date: entity.date, kind: entity.kind, correct: entity.correct, answer: entity.answer, createdAt: entity.createdAt };
}

function validateGames(games: DailyGames) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(games.date)) throw new Error("Fecha no válida.");
  const challenge = games.trivia;
  if (challenge.prompt.trim().length < 5 || challenge.options.length < 2 || challenge.options.some((option) => !option.trim()) || !Number.isInteger(challenge.correctOption) || challenge.correctOption < 0 || challenge.correctOption >= challenge.options.length) throw new Error("Trivia no válida.");
  if (games.word.prompt.trim().length < 5 || games.word.answer.trim().length < 2) throw new Error("Palabra no válida.");
  if (games.poll.prompt.trim().length < 5 || games.poll.options.length < 2 || games.poll.options.some((option) => !option.trim())) throw new Error("Encuesta no válida.");
}

function parseStoredGames(data: string): DailyGames {
  const stored = JSON.parse(data) as DailyGames & { quote?: { prompt: string; options: string[] } };
  if (!stored.poll && stored.quote) stored.poll = { prompt: stored.quote.prompt, options: stored.quote.options };
  validateGames(stored);
  return stored;
}

export async function getConfiguredDailyGames(date: string) {
  try {
    const entity = await (await table()).getEntity<ChallengeEntity>(CHALLENGE_PARTITION, date);
    return parseStoredGames(entity.data);
  } catch (error) {
    if (typeof error === "object" && error && "statusCode" in error && error.statusCode === 404) return getDailyGames(date);
    throw error;
  }
}

export async function listConfiguredDailyGames() {
  const stored = new Map<string, DailyGames>();
  const entities = (await table()).listEntities<ChallengeEntity>({ queryOptions: { filter: `PartitionKey eq '${CHALLENGE_PARTITION}'` } });
  for await (const entity of entities) stored.set(entity.rowKey, parseStoredGames(entity.data));
  return [...new Map([...DAILY_GAMES.map((games) => [games.date, games] as const), ...stored]).values()].sort((left, right) => left.date.localeCompare(right.date));
}

export async function saveConfiguredDailyGames(games: DailyGames) {
  validateGames(games);
  await (await table()).upsertEntity<ChallengeEntity>({ partitionKey: CHALLENGE_PARTITION, rowKey: games.date, data: JSON.stringify(games), updatedAt: new Date().toISOString() }, "Replace");
}

export async function deleteConfiguredDailyGames(date: string) {
  await (await table()).deleteEntity(CHALLENGE_PARTITION, date);
}

export async function listDailyGameAttempts(userId: string) {
  const entities = (await table()).listEntities<AttemptEntity>({ queryOptions: { filter: `PartitionKey eq '${userId.replaceAll("'", "''")}'` } });
  const attempts: DailyGameAttempt[] = [];
  for await (const entity of entities) attempts.push(toAttempt(entity));
  return attempts.sort((left, right) => right.date.localeCompare(left.date));
}

export async function submitDailyGameAttempt(userId: string, date: string, kind: DailyGameKind, rawAnswer: string) {
  if (date !== getMadridDate()) throw new DailyGameUnavailableError("Este reto ya no está disponible.");
  const games = await getConfiguredDailyGames(date);
  if (!games || !(["trivia", "word", "poll"] as const).includes(kind)) throw new DailyGameUnavailableError("No hay reto disponible.");

  let correct = false;
  if (kind === "poll") {
    const selected = Number(rawAnswer);
    correct = Number.isInteger(selected) && selected >= 0 && selected < games.poll.options.length;
    if (!correct) throw new Error("Opción de encuesta no válida.");
  } else if (kind === "word") {
    correct = normalize(rawAnswer) === normalize(games.word.answer);
  } else {
    const selected = Number(rawAnswer);
    correct = Number.isInteger(selected) && selected === games[kind].correctOption;
  }

  const entity: AttemptEntity = { partitionKey: userId, rowKey: rowKey(date, kind), date, kind, correct, answer: rawAnswer, createdAt: new Date().toISOString() };
  try {
    await (await table()).createEntity(entity);
  } catch (error) {
    if (typeof error === "object" && error && "statusCode" in error && error.statusCode === 409) throw new DailyGameAlreadyAttemptedError("Este reto ya está completado.");
    throw error;
  }

  if (correct) {
    try {
      const labels: Record<DailyGameKind, string> = { trivia: "Trivia diaria", word: "Palabra diaria", poll: "Encuesta diaria" };
      await addPointMovement({ userId, points: 1, source: "game", sourceId: `${date}-${kind}`, concept: labels[kind], detail: `Reto del ${date}`, method: "game" }, { uniqueKey: `game-${date}-${kind}` });
    } catch (error) {
      await (await table()).deleteEntity(userId, entity.rowKey).catch(() => undefined);
      throw error;
    }
  }
  return toAttempt(entity);
}

export async function listAllDailyGameAttempts() {
  const entities = (await table()).listEntities<AttemptEntity>();
  const attempts: DailyGameAttempt[] = [];
  for await (const entity of entities) if (entity.partitionKey !== CHALLENGE_PARTITION && entity.kind) attempts.push(toAttempt(entity));
  return attempts.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function deleteDailyGameAttempt(userId: string, date: string, kind: DailyGameKind) {
  const client = await table();
  const entity = await client.getEntity<AttemptEntity>(userId, rowKey(date, kind));
  if (entity.correct) await deletePointMovement(userId, `game-${date}-${kind}`);
  try {
    await client.deleteEntity(userId, entity.rowKey);
  } catch (error) {
    if (entity.correct) {
      const labels: Record<DailyGameKind, string> = { trivia: "Trivia diaria", word: "Palabra diaria", poll: "Encuesta diaria" };
      await addPointMovement({ userId, points: 1, source: "game", sourceId: `${date}-${kind}`, concept: labels[kind], detail: `Reto del ${date}`, method: "game" }, { uniqueKey: `game-${date}-${kind}` }).catch(() => undefined);
    }
    throw error;
  }
}

export type DailyPollResults = { counts: number[]; total: number };

export async function getDailyPollResults(date: string, optionCount: number): Promise<DailyPollResults> {
  const counts = Array.from({ length: optionCount }, () => 0);
  const entities = (await table()).listEntities<AttemptEntity>({ queryOptions: { filter: `date eq '${date.replaceAll("'", "''")}' and kind eq 'poll'` } });
  for await (const entity of entities) {
    const selected = Number(entity.answer);
    if (Number.isInteger(selected) && selected >= 0 && selected < counts.length) counts[selected] += 1;
  }
  return { counts, total: counts.reduce((sum, count) => sum + count, 0) };
}

export function calculateDailyGameStreak(attempts: DailyGameAttempt[], today: string) {
  const completedDates = new Set<string>();
  const kindsByDate = new Map<string, Set<DailyGameKind>>();
  for (const attempt of attempts) {
    const kinds = kindsByDate.get(attempt.date) ?? new Set<DailyGameKind>();
    kinds.add(attempt.kind);
    kindsByDate.set(attempt.date, kinds);
    if (kinds.size === 3) completedDates.add(attempt.date);
  }
  const cursor = new Date(`${today}T12:00:00Z`);
  if (!completedDates.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (completedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
