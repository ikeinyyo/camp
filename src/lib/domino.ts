import "server-only";

import { randomUUID } from "node:crypto";
import { TableClient, type TableEntity } from "@azure/data-tables";
import { STORAGE_SETTINGS } from "@/config/storage";
import { calculateDominoStandings } from "@/lib/domino-ranking";
import { getUsersByIds, type User } from "@/lib/users";

const CONFIG_PARTITION = "config";
const REGISTRATION_PARTITION = "registration";
const TEAM_PARTITION = "team";
const MATCH_PARTITION = "match";
const CONFIG_KEY = "tournament";
export const DOMINO_ROUNDS = 3;

export type DominoMode = "registration" | "tournament";
export type DominoRegistrationChoice = "joined" | "declined";
export type DominoRegistration = { userId: string; choice: DominoRegistrationChoice; updatedAt: string; user?: User };
export type DominoTeam = { id: string; player1Id: string; player2Id: string; players: User[] };
export type DominoMatch = { id: string; round: number; tableNumber: number; team1Id: string; team2Id?: string; winnerTeamId?: string; bye: boolean; team1?: DominoTeam; team2?: DominoTeam; winner?: DominoTeam };
export type DominoStanding = { position: number; teamId: string; team?: DominoTeam; wins: number; losses: number; buchholz: number; played: number };
export type DominoTournament = { mode: DominoMode; currentRound: number; registrations: DominoRegistration[]; teams: DominoTeam[]; matches: DominoMatch[]; standings: DominoStanding[] };

type ConfigEntity = TableEntity<{ mode: DominoMode; currentRound: number; updatedAt: string }>;
type RegistrationEntity = TableEntity<{ choice: DominoRegistrationChoice; updatedAt: string }>;
type TeamEntity = TableEntity<{ player1Id: string; player2Id: string; createdAt: string }>;
type MatchEntity = TableEntity<{ round: number; tableNumber: number; team1Id: string; team2Id?: string; winnerTeamId?: string; bye: boolean; createdAt: string }>;

let tableReady: Promise<TableClient> | undefined;

async function table() {
  if (!tableReady) tableReady = (async () => {
    const connection = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connection) throw new Error("Falta configurar AZURE_STORAGE_CONNECTION_STRING.");
    const client = TableClient.fromConnectionString(connection, STORAGE_SETTINGS.tables.domino);
    await client.createTable();
    return client;
  })().catch((error) => { tableReady = undefined; throw error; });
  return tableReady;
}

async function getConfig() {
  const client = await table();
  try {
    const entity = await client.getEntity<ConfigEntity>(CONFIG_PARTITION, CONFIG_KEY);
    return { mode: entity.mode, currentRound: Number(entity.currentRound ?? 0) };
  } catch (error) {
    if (typeof error !== "object" || !error || !("statusCode" in error) || error.statusCode !== 404) throw error;
    const entity: ConfigEntity = { partitionKey: CONFIG_PARTITION, rowKey: CONFIG_KEY, mode: "registration", currentRound: 0, updatedAt: new Date().toISOString() };
    try { await client.createEntity(entity); } catch (createError) {
      if (typeof createError !== "object" || !createError || !("statusCode" in createError) || createError.statusCode !== 409) throw createError;
      const current = await client.getEntity<ConfigEntity>(CONFIG_PARTITION, CONFIG_KEY);
      return { mode: current.mode, currentRound: Number(current.currentRound ?? 0) };
    }
    return { mode: "registration" as const, currentRound: 0 };
  }
}

async function listRegistrationEntities() {
  const result: RegistrationEntity[] = [];
  const entities = (await table()).listEntities<RegistrationEntity>({ queryOptions: { filter: `PartitionKey eq '${REGISTRATION_PARTITION}'` } });
  for await (const entity of entities) result.push(entity);
  return result;
}

async function listTeamEntities() {
  const result: TeamEntity[] = [];
  const entities = (await table()).listEntities<TeamEntity>({ queryOptions: { filter: `PartitionKey eq '${TEAM_PARTITION}'` } });
  for await (const entity of entities) result.push(entity);
  return result;
}

async function listMatchEntities() {
  const result: MatchEntity[] = [];
  const entities = (await table()).listEntities<MatchEntity>({ queryOptions: { filter: `PartitionKey eq '${MATCH_PARTITION}'` } });
  for await (const entity of entities) result.push(entity);
  return result;
}

function shuffled<T>(values: T[]) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function pairTeams(teamIds: string[], previousMatches: DominoMatch[]) {
  const ordered = previousMatches.length === 0 ? shuffled(teamIds) : calculateDominoStandings(teamIds, previousMatches).map((standing) => standing.teamId);
  const previousPairs = new Set(previousMatches.filter((match) => match.team2Id).map((match) => [match.team1Id, match.team2Id!].sort().join(":")));
  const hadBye = new Set(previousMatches.filter((match) => match.bye).map((match) => match.team1Id));
  let bye: string | undefined;
  if (ordered.length % 2 === 1) {
    const reverseIndex = [...ordered].reverse().findIndex((id) => !hadBye.has(id));
    const index = reverseIndex < 0 ? ordered.length - 1 : ordered.length - 1 - reverseIndex;
    bye = ordered.splice(index, 1)[0];
  }
  function findPairs(remaining: string[], avoidRematches: boolean): Array<[string, string]> | null {
    if (remaining.length === 0) return [];
    const [first, ...rest] = remaining;
    for (let index = 0; index < rest.length; index += 1) {
      const second = rest[index];
      if (avoidRematches && previousPairs.has([first, second].sort().join(":"))) continue;
      const tail = findPairs(rest.filter((_, candidate) => candidate !== index), avoidRematches);
      if (tail) return [[first, second], ...tail];
    }
    return null;
  }
  return { pairs: findPairs(ordered, true) ?? findPairs(ordered, false) ?? [], bye };
}

export async function getDominoTournament(): Promise<DominoTournament> {
  const [config, registrationEntities, teamEntities, matchEntities] = await Promise.all([getConfig(), listRegistrationEntities(), listTeamEntities(), listMatchEntities()]);
  const userIds = [...new Set([...registrationEntities.map((entity) => entity.rowKey), ...teamEntities.flatMap((entity) => [entity.player1Id, entity.player2Id])])];
  const userMap = new Map((await getUsersByIds(userIds)).map((user) => [user.id, user]));
  const registrations = registrationEntities.map((entity) => ({ userId: entity.rowKey, choice: entity.choice, updatedAt: entity.updatedAt, user: userMap.get(entity.rowKey) })).sort((a, b) => (a.user?.displayName ?? "").localeCompare(b.user?.displayName ?? "", "es"));
  const teams = teamEntities.map((entity) => ({ id: entity.rowKey, player1Id: entity.player1Id, player2Id: entity.player2Id, players: [userMap.get(entity.player1Id), userMap.get(entity.player2Id)].filter((user): user is User => Boolean(user)) }));
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const matches = matchEntities.map((entity) => ({ id: entity.rowKey, round: entity.round, tableNumber: entity.tableNumber, team1Id: entity.team1Id, team2Id: entity.team2Id, winnerTeamId: entity.winnerTeamId, bye: entity.bye, team1: teamMap.get(entity.team1Id), team2: entity.team2Id ? teamMap.get(entity.team2Id) : undefined, winner: entity.winnerTeamId ? teamMap.get(entity.winnerTeamId) : undefined })).sort((a, b) => a.round - b.round || a.tableNumber - b.tableNumber);
  const standings = calculateDominoStandings(teams.map((team) => team.id), matches).map((standing) => ({ ...standing, team: teamMap.get(standing.teamId) }));
  return { ...config, registrations, teams, matches, standings };
}

export async function setDominoRegistration(userId: string, choice: DominoRegistrationChoice) {
  if ((await getConfig()).mode !== "registration") throw new Error("La inscripción ya está cerrada.");
  await (await table()).upsertEntity<RegistrationEntity>({ partitionKey: REGISTRATION_PARTITION, rowKey: userId, choice, updatedAt: new Date().toISOString() }, "Replace");
}

export async function setDominoMode(mode: DominoMode) {
  const config = await getConfig();
  if (mode === "registration" && config.currentRound > 0) throw new Error("No se puede reabrir la inscripción con el torneo empezado.");
  if (mode === "tournament") {
    const joined = (await listRegistrationEntities()).filter((entity) => entity.choice === "joined").length;
    if (joined < 4 || joined % 2 !== 0) throw new Error("Se necesita un número par de participantes y al menos cuatro inscritos.");
  }
  await (await table()).upsertEntity<ConfigEntity>({ partitionKey: CONFIG_PARTITION, rowKey: CONFIG_KEY, mode, currentRound: config.currentRound, updatedAt: new Date().toISOString() }, "Replace");
}

export async function startNextDominoRound() {
  const tournament = await getDominoTournament();
  if (tournament.mode !== "tournament") throw new Error("Primero debes activar el modo torneo.");
  if (tournament.currentRound >= DOMINO_ROUNDS) throw new Error("Las tres rondas ya están creadas.");
  const currentMatches = tournament.matches.filter((match) => match.round === tournament.currentRound && !match.bye);
  if (currentMatches.some((match) => !match.winnerTeamId)) throw new Error("Completa todos los resultados de la ronda actual.");
  const client = await table();
  const createdAt = new Date().toISOString();
  let teams = tournament.teams;
  if (tournament.currentRound === 0) {
    const participants = shuffled(tournament.registrations.filter((item) => item.choice === "joined" && item.user).map((item) => item.userId));
    if (participants.length < 4 || participants.length % 2 !== 0) throw new Error("Se necesita un número par de participantes y al menos cuatro inscritos.");
    teams = [];
    for (let index = 0; index < participants.length; index += 2) {
      const team: DominoTeam = { id: randomUUID(), player1Id: participants[index], player2Id: participants[index + 1], players: [] };
      await client.createEntity<TeamEntity>({ partitionKey: TEAM_PARTITION, rowKey: team.id, player1Id: team.player1Id, player2Id: team.player2Id, createdAt });
      teams.push(team);
    }
  }
  const nextRound = tournament.currentRound + 1;
  const { pairs, bye } = pairTeams(teams.map((team) => team.id), tournament.matches);
  let tableNumber = 1;
  for (const [team1Id, team2Id] of pairs) await client.createEntity<MatchEntity>({ partitionKey: MATCH_PARTITION, rowKey: randomUUID(), round: nextRound, tableNumber: tableNumber++, team1Id, team2Id, bye: false, createdAt });
  if (bye) await client.createEntity<MatchEntity>({ partitionKey: MATCH_PARTITION, rowKey: randomUUID(), round: nextRound, tableNumber, team1Id: bye, winnerTeamId: bye, bye: true, createdAt });
  await client.upsertEntity<ConfigEntity>({ partitionKey: CONFIG_PARTITION, rowKey: CONFIG_KEY, mode: "tournament", currentRound: nextRound, updatedAt: createdAt }, "Replace");
  return nextRound;
}

export async function setDominoMatchWinner(matchId: string, winnerTeamId: string) {
  const client = await table();
  const match = await client.getEntity<MatchEntity>(MATCH_PARTITION, matchId);
  if (match.bye || (winnerTeamId !== match.team1Id && winnerTeamId !== match.team2Id)) throw new Error("Pareja ganadora no válida.");
  await client.updateEntity({ ...match, winnerTeamId }, "Replace");
}

export async function resetDominoTournament() {
  const client = await table();
  const [teams, matches] = await Promise.all([listTeamEntities(), listMatchEntities()]);
  await Promise.all([
    ...teams.map((entity) => client.deleteEntity(TEAM_PARTITION, entity.rowKey)),
    ...matches.map((entity) => client.deleteEntity(MATCH_PARTITION, entity.rowKey)),
  ]);
  await client.upsertEntity<ConfigEntity>({ partitionKey: CONFIG_PARTITION, rowKey: CONFIG_KEY, mode: "registration", currentRound: 0, updatedAt: new Date().toISOString() }, "Replace");
}
