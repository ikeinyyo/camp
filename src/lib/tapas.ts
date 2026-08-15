import "server-only";

import { randomUUID } from "node:crypto";
import { BlobServiceClient } from "@azure/storage-blob";
import { TableClient, type TableEntity } from "@azure/data-tables";
import { getUsersByIds } from "./users";
import { STORAGE_SETTINGS } from "@/config/storage";
export { rankTapas } from "./tapas-ranking";

const TAPA_PARTITION = "tapa";
const VOTE_PARTITION = "vote";
const CONFIG_PARTITION = "config";
const CONFIG_ROW = "contest";

export type ContestState = "catalog" | "voting" | "ranking";
export type Tapa = { id: string; name: string; description: string; participantIds: string[]; participantNames: string[]; imageUrl: string; active: boolean };
export type TapaVote = { userId: string; displayName: string; firstId: string; secondId: string; thirdId: string; createdAt: string };
export class OwnTapaVoteError extends Error {}

type TapaEntity = TableEntity<{ name: string; description: string; participantIds: string; blobName?: string; active: boolean; createdAt: string }>;
type VoteEntity = TableEntity<{ displayName: string; firstId: string; secondId: string; thirdId: string; createdAt: string }>;
type ConfigEntity = TableEntity<{ state: ContestState }>;

let tableReady: Promise<TableClient> | undefined;
async function getTableClient() {
  if (!tableReady) tableReady = (async () => {
    const connection = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connection) throw new Error("Falta configurar AZURE_STORAGE_CONNECTION_STRING.");
    const client = TableClient.fromConnectionString(connection, STORAGE_SETTINGS.tables.tapas);
    await client.createTable();
    return client;
  })().catch((error) => { tableReady = undefined; throw error; });
  return tableReady;
}

async function getContainer() {
  const connection = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connection) throw new Error("Falta configurar AZURE_STORAGE_CONNECTION_STRING.");
  const container = BlobServiceClient.fromConnectionString(connection).getContainerClient(STORAGE_SETTINGS.containers.tapas);
  await container.createIfNotExists();
  return container;
}

function parseIds(value: string) { try { const ids = JSON.parse(value); return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : []; } catch { return []; } }

async function toTapa(entity: TapaEntity): Promise<Tapa> {
  const participantIds = parseIds(entity.participantIds);
  const users = await getUsersByIds(participantIds);
  return { id: entity.rowKey, name: entity.name, description: entity.description, participantIds, participantNames: users.map((user) => user.displayName), imageUrl: entity.blobName ? `/api/tapas/${entity.rowKey}/image` : "/images/tapa-placeholder.svg", active: entity.active };
}

export async function listTapas(options?: { includeInactive?: boolean }) {
  const entities = (await getTableClient()).listEntities<TapaEntity>({ queryOptions: { filter: `PartitionKey eq '${TAPA_PARTITION}'` } });
  const tapas: Tapa[] = [];
  for await (const entity of entities) if (options?.includeInactive || entity.active) tapas.push(await toTapa(entity));
  return tapas.sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getTapa(id: string) {
  try { return await toTapa(await (await getTableClient()).getEntity<TapaEntity>(TAPA_PARTITION, id)); }
  catch (error) { if (typeof error === "object" && error && "statusCode" in error && error.statusCode === 404) return null; throw error; }
}

function validate(input: { name: string; description: string; participantIds: string[] }) {
  if (input.name.trim().length < 2 || input.name.trim().length > 100) throw new Error("Nombre no válido.");
  if (input.description.trim().length < 5 || input.description.trim().length > 1000) throw new Error("Descripción no válida.");
  if (input.participantIds.length < 1) throw new Error("Selecciona al menos un responsable.");
}

async function uploadImage(blobName: string, image: File) {
  if (!image.type.startsWith("image/") || image.size > 8 * 1024 * 1024) throw new Error("Imagen no válida.");
  await (await getContainer()).getBlockBlobClient(blobName).uploadData(await image.arrayBuffer(), { blobHTTPHeaders: { blobContentType: image.type, blobCacheControl: "public, max-age=86400" } });
}

export async function createTapa(input: { name: string; description: string; participantIds: string[]; image?: File }) {
  validate(input);
  const id = randomUUID(); const blobName = input.image?.size ? `${id}.jpg` : undefined;
  if (blobName && input.image) await uploadImage(blobName, input.image);
  const entity: TapaEntity = { partitionKey: TAPA_PARTITION, rowKey: id, name: input.name.trim(), description: input.description.trim(), participantIds: JSON.stringify([...new Set(input.participantIds)]), ...(blobName ? { blobName } : {}), active: true, createdAt: new Date().toISOString() };
  try { await (await getTableClient()).createEntity(entity); } catch (error) { if (blobName) await (await getContainer()).deleteBlob(blobName).catch(() => undefined); throw error; }
  return toTapa(entity);
}

export async function updateTapa(id: string, input: { name: string; description: string; participantIds: string[]; active: boolean; image?: File }) {
  validate(input); const client = await getTableClient(); const current = await client.getEntity<TapaEntity>(TAPA_PARTITION, id);
  const blobName = input.image?.size ? (current.blobName ?? `${id}.jpg`) : current.blobName;
  if (input.image?.size && blobName) await uploadImage(blobName, input.image);
  await client.updateEntity({ ...current, name: input.name.trim(), description: input.description.trim(), participantIds: JSON.stringify([...new Set(input.participantIds)]), ...(blobName ? { blobName } : {}), active: input.active }, "Merge");
}

export async function deleteTapa(id: string) {
  const client = await getTableClient(); const entity = await client.getEntity<TapaEntity>(TAPA_PARTITION, id);
  await client.deleteEntity(TAPA_PARTITION, id); if (entity.blobName) await (await getContainer()).deleteBlob(entity.blobName).catch(() => undefined);
}

export async function getTapaImage(id: string) {
  const entity = await (await getTableClient()).getEntity<TapaEntity>(TAPA_PARTITION, id);
  if (!entity.blobName) throw new Error("La tapa no tiene imagen.");
  return (await getContainer()).getBlobClient(entity.blobName).download();
}

export async function getContestState(): Promise<ContestState> {
  try { return (await (await getTableClient()).getEntity<ConfigEntity>(CONFIG_PARTITION, CONFIG_ROW)).state; }
  catch (error) { if (typeof error === "object" && error && "statusCode" in error && error.statusCode === 404) { await setContestState("catalog"); return "catalog"; } throw error; }
}
export async function setContestState(state: ContestState) { await (await getTableClient()).upsertEntity<ConfigEntity>({ partitionKey: CONFIG_PARTITION, rowKey: CONFIG_ROW, state }, "Merge"); }

export async function submitTapaVote(input: { userId: string; displayName: string; firstId: string; secondId: string; thirdId: string }) {
  if (await getContestState() !== "voting") throw new Error("La votación no está activa.");
  if (new Set([input.firstId, input.secondId, input.thirdId]).size !== 3) throw new Error("Selecciona tres tapas diferentes.");
  const tapas = await listTapas();
  const activeIds = new Set(tapas.map((tapa) => tapa.id));
  if (![input.firstId, input.secondId, input.thirdId].every((id) => activeIds.has(id))) throw new Error("Alguna tapa no está disponible.");
  const selectedIds = new Set([input.firstId, input.secondId, input.thirdId]);
  if (tapas.some((tapa) => selectedIds.has(tapa.id) && tapa.participantIds.includes(input.userId))) {
    throw new OwnTapaVoteError("No puedes votar una tapa en la que participas.");
  }
  const entity: VoteEntity = { partitionKey: VOTE_PARTITION, rowKey: input.userId, displayName: input.displayName, firstId: input.firstId, secondId: input.secondId, thirdId: input.thirdId, createdAt: new Date().toISOString() };
  await (await getTableClient()).createEntity(entity);
}

export async function listTapaVotes(): Promise<TapaVote[]> {
  const entities = (await getTableClient()).listEntities<VoteEntity>({ queryOptions: { filter: `PartitionKey eq '${VOTE_PARTITION}'` } }); const votes: TapaVote[] = [];
  for await (const entity of entities) votes.push({ userId: entity.rowKey, displayName: entity.displayName, firstId: entity.firstId, secondId: entity.secondId, thirdId: entity.thirdId, createdAt: entity.createdAt });
  return votes.sort((a, b) => a.displayName.localeCompare(b.displayName, "es"));
}

export async function deleteTapaVote(userId: string) {
  if (!userId) throw new Error("Falta el participante.");
  await (await getTableClient()).deleteEntity(VOTE_PARTITION, userId);
}
