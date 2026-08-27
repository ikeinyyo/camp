import "server-only";

import { randomInt } from "node:crypto";
import { TableClient, type TableEntity } from "@azure/data-tables";
import { STORAGE_SETTINGS } from "@/config/storage";
import { addPointMovement } from "@/lib/points";
import { getUserById } from "@/lib/users";

const CONFIG_PARTITION = "config";
const CONFIG_ROW = "game";

type BingoEntity = TableEntity<{ drawnNumbers: string; updatedAt: string }>;
export type BingoState = { drawnNumbers: number[]; currentNumber?: number; complete: boolean };
export type BingoPrize = "line" | "bingo";

let tableReady: Promise<TableClient> | undefined;

async function table() {
  if (!tableReady) tableReady = (async () => {
    const connection = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connection) throw new Error("Falta configurar AZURE_STORAGE_CONNECTION_STRING.");
    const client = TableClient.fromConnectionString(connection, STORAGE_SETTINGS.tables.bingo);
    await client.createTable();
    return client;
  })().catch((error) => { tableReady = undefined; throw error; });
  return tableReady;
}

function parseNumbers(value: string) {
  try {
    const numbers = JSON.parse(value);
    return Array.isArray(numbers) ? [...new Set(numbers.filter((number): number is number => Number.isInteger(number) && number >= 1 && number <= 90))] : [];
  } catch { return []; }
}

async function getEntity(): Promise<BingoEntity> {
  const client = await table();
  try { return await client.getEntity<BingoEntity>(CONFIG_PARTITION, CONFIG_ROW); }
  catch (error) {
    if (typeof error !== "object" || !error || !("statusCode" in error) || error.statusCode !== 404) throw error;
    const entity: BingoEntity = { partitionKey: CONFIG_PARTITION, rowKey: CONFIG_ROW, drawnNumbers: "[]", updatedAt: new Date().toISOString() };
    try { await client.createEntity(entity); return entity; }
    catch (createError) {
      if (typeof createError !== "object" || !createError || !("statusCode" in createError) || createError.statusCode !== 409) throw createError;
      return client.getEntity<BingoEntity>(CONFIG_PARTITION, CONFIG_ROW);
    }
  }
}

function toState(entity: BingoEntity): BingoState {
  const drawnNumbers = parseNumbers(entity.drawnNumbers);
  return { drawnNumbers, currentNumber: drawnNumbers.at(-1), complete: drawnNumbers.length === 90 };
}

export async function getBingoState() {
  return toState(await getEntity());
}

export async function drawBingoNumber() {
  const client = await table();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const entity = await getEntity();
    const drawnNumbers = parseNumbers(entity.drawnNumbers);
    const drawn = new Set(drawnNumbers);
    const available = Array.from({ length: 90 }, (_, index) => index + 1).filter((number) => !drawn.has(number));
    if (available.length === 0) throw new Error("Ya han salido las 90 bolas.");
    const number = available[randomInt(available.length)];
    entity.drawnNumbers = JSON.stringify([...drawnNumbers, number]);
    entity.updatedAt = new Date().toISOString();
    try {
      await client.updateEntity(entity, "Replace");
      return { number, state: toState(entity) };
    } catch (error) {
      if (typeof error !== "object" || !error || !("statusCode" in error) || error.statusCode !== 412) throw error;
    }
  }
  throw new Error("No se pudo extraer la bola. Inténtalo de nuevo.");
}

export async function resetBingo() {
  await (await table()).upsertEntity<BingoEntity>({ partitionKey: CONFIG_PARTITION, rowKey: CONFIG_ROW, drawnNumbers: "[]", updatedAt: new Date().toISOString() }, "Replace");
}

export async function awardBingoPrize(userId: string, prize: BingoPrize) {
  if (prize !== "line" && prize !== "bingo") throw new Error("Premio no válido.");
  const user = await getUserById(userId);
  if (!user?.approved) throw new Error("Selecciona un participante válido.");
  const points = prize === "line" ? 3 : 5;
  await addPointMovement({
    userId: user.id,
    points,
    source: "activity",
    sourceId: "bingo",
    concept: "Bingo",
    detail: prize === "line" ? "Premio por línea" : "Premio por bingo",
    method: "manual",
  }, { uniqueKey: `bingo_${prize}` });
  return { user, points };
}
