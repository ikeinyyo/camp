import "server-only";

import { randomUUID } from "node:crypto";
import { TableClient, type TableEntity } from "@azure/data-tables";
import { STORAGE_SETTINGS } from "@/config/storage";
import { VOUCHER_CATEGORIES, type VoucherCategory } from "@/config/vouchers";
import { addPointMovement, listUserPointMovements } from "./points";
import { getUserById } from "./users";

const VOUCHER_PARTITION = "voucher";
const CLAIM_PARTITION = "claim";
const PROPOSAL_PARTITION = "proposal";
const CONFIG_PARTITION = "config";
const CONFIG_ROW = "voucher-state";
const MIGRATION_PARTITION = "migration";
const EXTRA_VOUCHERS_MIGRATION = "extra-vouchers-2026-08";
const PENALTY_VOUCHERS_MIGRATION = "penalty-vouchers-2026-08";

export type Voucher = {
  id: string;
  title: string;
  description: string;
  points: number;
  active: boolean;
  sortOrder: number;
  category: VoucherCategory;
  maxReservations: number | null;
  reservedUserIds: string[];
};

export type { VoucherCategory } from "@/config/vouchers";

export type VoucherClaim = {
  id: string;
  voucherId: string;
  voucherTitle: string;
  userId: string;
  username: string;
  displayName: string;
  points: number;
  status: "pending" | "redeemed";
};

export type VoucherState = "proposals" | "normal";

export type VoucherProposal = {
  id: string;
  text: string;
  userId: string;
  username: string;
  displayName: string;
  createdAt: string;
};

type VoucherEntity = TableEntity<{
  title: string;
  description: string;
  points: number;
  active: boolean;
  createdAt: string;
  sortOrder?: number;
  category?: VoucherCategory;
  maxReservations?: number;
  reservedUserIds?: string;
}>;

type ClaimEntity = TableEntity<{
  voucherId: string;
  voucherTitle: string;
  userId: string;
  username: string;
  displayName: string;
  points: number;
  status: "pending" | "redeemed";
  createdAt: string;
  redeemedAt?: string;
}>;

type ProposalEntity = TableEntity<{
  text: string;
  userId: string;
  username: string;
  displayName: string;
  createdAt: string;
}>;

type ConfigEntity = TableEntity<{ state: VoucherState }>;

let tableReady: Promise<TableClient> | undefined;

const DEFAULT_VOUCHERS = [
  { title: "Ayudar a poner la mesa", description: "Preparar la mesa antes de una comida y dejar todo listo para la familia.", points: 2 },
  { title: "Ayudar a cocinar", description: "Colaborar de forma activa en la preparación de una comida. No cuenta la elaboración del concurso de tapas.", points: 5 },
  { title: "Fregar", description: "Fregar los platos, vasos y utensilios después de una comida.", points: 5 },
  { title: "Barrer", description: "Barrer y dejar limpia una zona común del campo.", points: 3 },
  { title: "Ir a por los churros", description: "Ayudar con el encargo y la recogida de los churros del desayuno del domingo.", points: 4 },
] as const;

const EXTRA_VOUCHERS = [
  { id: "clear-table", title: "Recoger la mesa", description: "Retirar platos, vasos, cubiertos y demás cosas de la mesa después de una comida.", points: 4 },
  { id: "restock-drinks", title: "Reponer agua, refrescos y otras bebidas", description: "Comprobar las bebidas disponibles y reponer agua, refrescos u otras bebidas cuando sea necesario.", points: 2 },
  { id: "take-out-trash", title: "Sacar la basura", description: "Recoger las bolsas llenas y llevarlas al contenedor correspondiente, dejando bolsas nuevas preparadas.", points: 2 },
  { id: "entertain-children", title: "Entretener a los niños durante una tarea", description: "Cuidar y entretener a los niños mientras otras personas realizan una tarea necesaria para el evento.", points: 4 },
  { id: "activity-music", title: "Encargarse de la música durante una actividad", description: "Preparar y controlar la música necesaria durante una actividad de la Gallardo Camp.", points: 3 },
  { id: "take-out-table", title: "Sacar la mesa", description: "Sacar y colocar una mesa en el lugar donde vaya a utilizarse.", points: 1 },
  { id: "store-table", title: "Guardar la mesa", description: "Recoger, plegar si es necesario y guardar una mesa después de utilizarla.", points: 1 },
  { id: "feed-alberto", title: "Dar de comer a Alberto", description: "Encargarse de dar de comer a Alberto y dejar todo recogido al terminar.", points: 5 },
  { id: "put-alberto-to-sleep", title: "Dormir a Alberto", description: "Encargarse de acompañar y ayudar a Alberto a dormirse.", points: 5 },
] as const;

const PENALTY_VOUCHERS = [
  { id: "getting-angry", title: "Cabrearse durante una actividad", description: "Penalización por enfadarse, crear mal ambiente o tomarse demasiado en serio una actividad familiar.", points: -2, category: "activities" as const },
  { id: "arriving-late", title: "Llegar tarde a una actividad", description: "Penalización por llegar tarde y hacer esperar al resto de participantes sin una causa justificada.", points: -3, category: "activities" as const },
  { id: "not-doing-task", title: "No hacer la tarea asignada", description: "Penalización por comprometerse con una tarea y dejarla sin hacer ni avisar al organizador.", points: -5, category: "collaboration" as const },
] as const;

const LOGICAL_VOUCHER_ORDER = [
  "Sacar la mesa",
  "Ayudar a poner la mesa",
  "Reponer agua, refrescos y otras bebidas",
  "Ayudar a cocinar",
  "Dar de comer a Alberto",
  "Recoger la mesa",
  "Fregar",
  "Barrer",
  "Sacar la basura",
  "Guardar la mesa",
  "Ir a por los churros",
  "Entretener a los niños durante una tarea",
  "Dormir a Alberto",
  "Encargarse de la música durante una actividad",
] as const;

function getDefaultSortOrder(title: string) {
  const index = LOGICAL_VOUCHER_ORDER.indexOf(
    title as (typeof LOGICAL_VOUCHER_ORDER)[number],
  );
  return index === -1 ? 1000 : index + 1;
}

function getDefaultCategory(title: string): VoucherCategory {
  if (["Ayudar a cocinar", "Dar de comer a Alberto", "Entretener a los niños durante una tarea", "Dormir a Alberto"].includes(title)) return "collaboration";
  if (["Encargarse de la música durante una actividad"].includes(title)) return "activities";
  return "organization";
}

function isVoucherCategory(value: unknown): value is VoucherCategory {
  return VOUCHER_CATEGORIES.some((category) => category.id === value);
}

function parseUserIds(value?: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === "string" && id.length > 0))] : [];
  } catch {
    return [];
  }
}

async function getTableClient() {
  if (!tableReady) {
    tableReady = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const tableName = STORAGE_SETTINGS.tables.vouchers;
      if (!connectionString) throw new Error("Falta configurar AZURE_STORAGE_CONNECTION_STRING.");
      const client = TableClient.fromConnectionString(connectionString, tableName);
      await client.createTable();
      return client;
    })().catch((error) => {
      tableReady = undefined;
      throw error;
    });
  }
  return tableReady;
}

function toVoucher(entity: VoucherEntity): Voucher {
  return { id: entity.rowKey, title: entity.title, description: entity.description, points: entity.points, active: entity.active, sortOrder: entity.sortOrder ?? getDefaultSortOrder(entity.title), category: isVoucherCategory(entity.category) ? entity.category : getDefaultCategory(entity.title), maxReservations: Number.isInteger(entity.maxReservations) && Number(entity.maxReservations) > 0 ? Number(entity.maxReservations) : null, reservedUserIds: parseUserIds(entity.reservedUserIds) };
}

function toClaim(entity: ClaimEntity): VoucherClaim {
  return { id: entity.rowKey, voucherId: entity.voucherId, voucherTitle: entity.voucherTitle, userId: entity.userId, username: entity.username, displayName: entity.displayName, points: entity.points, status: entity.status };
}

function toProposal(entity: ProposalEntity): VoucherProposal {
  return { id: entity.rowKey, text: entity.text, userId: entity.userId, username: entity.username, displayName: entity.displayName, createdAt: entity.createdAt };
}

function validateVoucher(input: { title: string; description: string; points: number }) {
  if (input.title.trim().length < 3 || input.title.trim().length > 80) throw new Error("Título no válido.");
  if (input.description.trim().length < 5 || input.description.trim().length > 500) throw new Error("Descripción no válida.");
  if (!Number.isInteger(input.points) || input.points === 0 || input.points < -100 || input.points > 100) throw new Error("Los puntos deben ser un entero entre -100 y 100, distinto de cero.");
}

async function ensurePenaltyVouchers(client: TableClient) {
  try {
    await client.getEntity(MIGRATION_PARTITION, PENALTY_VOUCHERS_MIGRATION);
    return;
  } catch (error) {
    if (typeof error !== "object" || error === null || !("statusCode" in error) || error.statusCode !== 404) throw error;
  }
  await Promise.all(PENALTY_VOUCHERS.map(async (voucher, index) => {
    try {
      await client.createEntity<VoucherEntity>({ partitionKey: VOUCHER_PARTITION, rowKey: voucher.id, title: voucher.title, description: voucher.description, points: voucher.points, active: true, createdAt: new Date().toISOString(), sortOrder: 900 + index, category: voucher.category, maxReservations: 0, reservedUserIds: "[]" });
    } catch (error) {
      if (typeof error !== "object" || error === null || !("statusCode" in error) || error.statusCode !== 409) throw error;
    }
  }));
  await client.upsertEntity({ partitionKey: MIGRATION_PARTITION, rowKey: PENALTY_VOUCHERS_MIGRATION, appliedAt: new Date().toISOString() });
}

async function ensureExtraVouchers(client: TableClient) {
  try {
    await client.getEntity(MIGRATION_PARTITION, EXTRA_VOUCHERS_MIGRATION);
    return false;
  } catch (error) {
    if (
      typeof error !== "object" ||
      error === null ||
      !("statusCode" in error) ||
      error.statusCode !== 404
    ) {
      throw error;
    }
  }

  await Promise.all(
    EXTRA_VOUCHERS.map(async (voucher) => {
      const entity: VoucherEntity = {
        partitionKey: VOUCHER_PARTITION,
        rowKey: voucher.id,
        title: voucher.title,
        description: voucher.description,
        points: voucher.points,
        active: true,
        createdAt: new Date().toISOString(),
        sortOrder: getDefaultSortOrder(voucher.title),
        category: getDefaultCategory(voucher.title),
      };
      try {
        await client.createEntity(entity);
      } catch (error) {
        if (
          typeof error !== "object" ||
          error === null ||
          !("statusCode" in error) ||
          error.statusCode !== 409
        ) {
          throw error;
        }
      }
    }),
  );
  await client.upsertEntity({
    partitionKey: MIGRATION_PARTITION,
    rowKey: EXTRA_VOUCHERS_MIGRATION,
    appliedAt: new Date().toISOString(),
  });
  return true;
}

export async function listVouchers(options?: { includeInactive?: boolean }) {
  const client = await getTableClient();
  const extraVouchersAdded = await ensureExtraVouchers(client);
  await ensurePenaltyVouchers(client);
  const vouchers: Voucher[] = [];
  let storedVoucherCount = 0;
  const entities = client.listEntities<VoucherEntity>({ queryOptions: { filter: `PartitionKey eq '${VOUCHER_PARTITION}'` } });
  for await (const entity of entities) {
    if (!PENALTY_VOUCHERS.some((voucher) => voucher.id === entity.rowKey)) storedVoucherCount += 1;
    const expectedSortOrder = entity.sortOrder ?? getDefaultSortOrder(entity.title);
    if (entity.sortOrder === undefined || !isVoucherCategory(entity.category)) {
      entity.sortOrder = expectedSortOrder;
      entity.category = isVoucherCategory(entity.category) ? entity.category : getDefaultCategory(entity.title);
      await client.updateEntity(entity, "Merge");
    }
    const voucher = toVoucher(entity);
    if (options?.includeInactive || voucher.active) vouchers.push(voucher);
  }
  if (extraVouchersAdded && storedVoucherCount === EXTRA_VOUCHERS.length) {
    const seeded = await Promise.all(
      DEFAULT_VOUCHERS.map((voucher) => createVoucher(voucher)),
    );
    vouchers.push(...seeded);
  }
  return vouchers.sort(
    (left, right) =>
      left.sortOrder - right.sortOrder ||
      left.title.localeCompare(right.title, "es"),
  );
}

export async function getVoucher(id: string) {
  try {
    return toVoucher(await (await getTableClient()).getEntity<VoucherEntity>(VOUCHER_PARTITION, id));
  } catch (error) {
    if (typeof error === "object" && error && "statusCode" in error && error.statusCode === 404) return null;
    throw error;
  }
}

export async function createVoucher(input: { title: string; description: string; points: number; active?: boolean; sortOrder?: number; category?: VoucherCategory; maxReservations?: number | null }) {
  validateVoucher(input);
  const category = input.category ?? getDefaultCategory(input.title.trim());
  if (!isVoucherCategory(category)) throw new Error("Categoría no válida.");
  if (input.maxReservations !== null && input.maxReservations !== undefined && (!Number.isInteger(input.maxReservations) || input.maxReservations < 1)) throw new Error("El máximo de plazas no es válido.");
  const entity: VoucherEntity = { partitionKey: VOUCHER_PARTITION, rowKey: randomUUID(), title: input.title.trim(), description: input.description.trim(), points: input.points, active: input.active ?? true, createdAt: new Date().toISOString(), sortOrder: input.sortOrder ?? getDefaultSortOrder(input.title.trim()), category, maxReservations: input.maxReservations ?? 0, reservedUserIds: "[]" };
  await (await getTableClient()).createEntity(entity);
  return toVoucher(entity);
}

export async function updateVoucher(id: string, input: { title: string; description: string; points: number; active: boolean; sortOrder: number; category: VoucherCategory; maxReservations: number | null; reservedUserIds: string[] }) {
  validateVoucher(input);
  const client = await getTableClient();
  const current = await client.getEntity<VoucherEntity>(VOUCHER_PARTITION, id);
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 1) throw new Error("Orden no válido.");
  if (!isVoucherCategory(input.category)) throw new Error("Categoría no válida.");
  if (input.maxReservations !== null && (!Number.isInteger(input.maxReservations) || input.maxReservations < 1)) throw new Error("El máximo de plazas no es válido.");
  const reservedUserIds = [...new Set(input.reservedUserIds.filter(Boolean))];
  if (input.maxReservations !== null && reservedUserIds.length > input.maxReservations) throw new Error("Hay más personas seleccionadas que plazas disponibles.");
  const entity = { ...current, title: input.title.trim(), description: input.description.trim(), points: input.points, active: input.active, sortOrder: input.sortOrder, category: input.category, maxReservations: input.maxReservations ?? 0, reservedUserIds: JSON.stringify(input.maxReservations === null ? [] : reservedUserIds) };
  await client.updateEntity(entity, "Merge");
  return toVoucher(entity);
}

export class VoucherFullError extends Error {}
export class VoucherAlreadyReservedError extends Error {}
export class VoucherAlreadyClaimedError extends Error {}

async function listClaimsForVoucherAndUser(voucherId: string, userId: string) {
  const claims: VoucherClaim[] = [];
  const entities = (await getTableClient()).listEntities<ClaimEntity>({ queryOptions: { filter: `PartitionKey eq '${CLAIM_PARTITION}' and voucherId eq '${voucherId.replaceAll("'", "''")}' and userId eq '${userId.replaceAll("'", "''")}'` } });
  for await (const entity of entities) claims.push(toClaim(entity));
  return claims;
}

async function hasVoucherPointMovement(voucherId: string, userId: string) {
  return (await listUserPointMovements(userId)).some((movement) => movement.source === "voucher" && movement.sourceId === voucherId);
}

export async function listVoucherClaimsForUser(userId: string) {
  const claims: VoucherClaim[] = [];
  const entities = (await getTableClient()).listEntities<ClaimEntity>({ queryOptions: { filter: `PartitionKey eq '${CLAIM_PARTITION}' and userId eq '${userId.replaceAll("'", "''")}'` } });
  for await (const entity of entities) claims.push(toClaim(entity));
  return claims;
}

export async function reserveVoucher(voucherId: string, userId: string) {
  if (!(await getUserById(userId))) throw new Error("El usuario no está disponible.");
  const client = await getTableClient();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const entity = await client.getEntity<VoucherEntity>(VOUCHER_PARTITION, voucherId);
    const voucher = toVoucher(entity);
    if (!voucher.active || voucher.maxReservations === null) throw new Error("Este vale no admite reservas.");
    if (voucher.reservedUserIds.includes(userId)) throw new VoucherAlreadyReservedError("Ya tienes una plaza reservada.");
    if (voucher.reservedUserIds.length >= voucher.maxReservations) throw new VoucherFullError("No quedan plazas disponibles.");
    const reservedUserIds = [...voucher.reservedUserIds, userId];
    try {
      await client.updateEntity({ ...entity, reservedUserIds: JSON.stringify(reservedUserIds) }, "Replace");
      return { ...voucher, reservedUserIds };
    } catch (error) {
      if (attempt === 3 || typeof error !== "object" || error === null || !("statusCode" in error) || error.statusCode !== 412) throw error;
    }
  }
  throw new Error("No se pudo reservar la plaza.");
}

export async function reorderVouchers(items: Array<{ id: string; category: VoucherCategory }>) {
  const ids = new Set<string>();
  const categoryPositions = new Map<VoucherCategory, number>();
  const client = await getTableClient();
  for (const item of items) {
    if (!item.id || ids.has(item.id) || !isVoucherCategory(item.category)) throw new Error("Orden no válido.");
    ids.add(item.id);
    const sortOrder = (categoryPositions.get(item.category) ?? 0) + 1;
    categoryPositions.set(item.category, sortOrder);
    const current = await client.getEntity<VoucherEntity>(VOUCHER_PARTITION, item.id);
    await client.updateEntity({ ...current, category: item.category, sortOrder }, "Merge");
  }
}

export async function deleteVoucher(id: string) {
  await (await getTableClient()).deleteEntity(VOUCHER_PARTITION, id);
}

export async function getVoucherState(): Promise<VoucherState> {
  try {
    return (await (await getTableClient()).getEntity<ConfigEntity>(CONFIG_PARTITION, CONFIG_ROW)).state;
  } catch (error) {
    if (typeof error === "object" && error && "statusCode" in error && error.statusCode === 404) {
      await setVoucherState("normal");
      return "normal";
    }
    throw error;
  }
}

export async function setVoucherState(state: VoucherState) {
  await (await getTableClient()).upsertEntity<ConfigEntity>({ partitionKey: CONFIG_PARTITION, rowKey: CONFIG_ROW, state }, "Merge");
}

export async function createVoucherProposal(text: string, userId: string) {
  const value = text.trim();
  if (value.length < 10 || value.length > 500) throw new Error("La propuesta debe tener entre 10 y 500 caracteres.");
  if (await getVoucherState() !== "proposals") throw new Error("Las propuestas no están abiertas.");
  const user = await getUserById(userId);
  if (!user) throw new Error("El usuario no está disponible.");
  const entity: ProposalEntity = { partitionKey: PROPOSAL_PARTITION, rowKey: randomUUID(), text: value, userId: user.id, username: user.username, displayName: user.displayName, createdAt: new Date().toISOString() };
  await (await getTableClient()).createEntity(entity);
  return toProposal(entity);
}

export async function listVoucherProposals() {
  const entities = (await getTableClient()).listEntities<ProposalEntity>({ queryOptions: { filter: `PartitionKey eq '${PROPOSAL_PARTITION}'` } });
  const proposals: VoucherProposal[] = [];
  for await (const entity of entities) proposals.push(toProposal(entity));
  return proposals.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function deleteVoucherProposal(id: string) {
  if (!id) throw new Error("Falta la propuesta.");
  await (await getTableClient()).deleteEntity(PROPOSAL_PARTITION, id);
}

export async function createVoucherClaim(voucherId: string, userId: string) {
  if (await getVoucherState() !== "normal") throw new Error("El catálogo de vales todavía no está disponible.");
  const [voucher, user] = await Promise.all([getVoucher(voucherId), getUserById(userId)]);
  if (!voucher?.active || !user) throw new Error("El vale o el usuario no están disponibles.");
  if (voucher.maxReservations !== null && !voucher.reservedUserIds.includes(userId)) throw new Error("Este vale está reservado para las personas apuntadas.");
  if (voucher.maxReservations !== null) {
    if (await hasVoucherPointMovement(voucher.id, user.id)) throw new VoucherAlreadyClaimedError("Este vale ya se ha reclamado.");
    const existing = await listClaimsForVoucherAndUser(voucher.id, user.id);
    if (existing.some((claim) => claim.status === "redeemed")) throw new VoucherAlreadyClaimedError("Este vale ya se ha reclamado.");
    const pending = existing.find((claim) => claim.status === "pending");
    if (pending) return pending;
  }
  const entity: ClaimEntity = { partitionKey: CLAIM_PARTITION, rowKey: voucher.maxReservations === null ? randomUUID() : `reserved-${voucher.id}-${user.id}`, voucherId: voucher.id, voucherTitle: voucher.title, userId: user.id, username: user.username, displayName: user.displayName, points: voucher.points, status: "pending", createdAt: new Date().toISOString() };
  try {
    await (await getTableClient()).createEntity(entity);
  } catch (error) {
    if (voucher.maxReservations === null || typeof error !== "object" || !error || !("statusCode" in error) || error.statusCode !== 409) throw error;
    const existing = await (await getTableClient()).getEntity<ClaimEntity>(CLAIM_PARTITION, entity.rowKey);
    if (existing.status === "redeemed") throw new VoucherAlreadyClaimedError("Este vale ya se ha reclamado.");
    return toClaim(existing);
  }
  return toClaim(entity);
}

export async function redeemVoucherClaim(claimId: string) {
  const client = await getTableClient();
  const entity = await client.getEntity<ClaimEntity>(CLAIM_PARTITION, claimId);
  if (entity.status === "redeemed") return { claim: toClaim(entity), alreadyRedeemed: true };
  const voucher = await getVoucher(entity.voucherId);
  if (!voucher?.active || (voucher.maxReservations !== null && !voucher.reservedUserIds.includes(entity.userId))) throw new Error("El usuario ya no tiene una plaza reservada para este vale.");
  if (voucher.maxReservations !== null) {
    if (await hasVoucherPointMovement(voucher.id, entity.userId)) {
      entity.status = "redeemed";
      entity.redeemedAt = new Date().toISOString();
      await client.updateEntity(entity, "Merge");
      return { claim: toClaim(entity), alreadyRedeemed: true };
    }
    const previous = (await listClaimsForVoucherAndUser(voucher.id, entity.userId)).find((claim) => claim.id !== entity.rowKey && claim.status === "redeemed");
    if (previous) return { claim: previous, alreadyRedeemed: true };
  }
  entity.status = "redeemed";
  entity.redeemedAt = new Date().toISOString();
  await client.updateEntity(entity, "Merge");
  try {
    await addPointMovement({ userId: entity.userId, points: entity.points, source: "voucher", sourceId: entity.voucherId, concept: entity.voucherTitle, detail: "Vale completado", method: "qr" }, voucher.maxReservations !== null ? { uniqueKey: `voucher-${voucher.id}` } : undefined);
  } catch (error) {
    entity.status = "pending";
    entity.redeemedAt = undefined;
    await client.updateEntity(entity, "Merge");
    throw error;
  }
  return { claim: toClaim(entity), alreadyRedeemed: false };
}

export async function applyVoucherManually(voucherId: string, userId: string) {
  const [voucher, user] = await Promise.all([getVoucher(voucherId), getUserById(userId)]);
  if (!voucher?.active || !user) throw new Error("El vale o el usuario no están disponibles.");
  if (voucher.maxReservations !== null && !voucher.reservedUserIds.includes(userId)) throw new Error("El usuario no tiene una plaza reservada para este vale.");
  if (voucher.maxReservations !== null && await hasVoucherPointMovement(voucher.id, userId)) throw new VoucherAlreadyClaimedError("Este vale ya se ha reclamado.");
  await addPointMovement({ userId, points: voucher.points, source: "voucher", sourceId: voucher.id, concept: voucher.title, detail: "Vale asignado manualmente", method: "manual" }, voucher.maxReservations !== null ? { uniqueKey: `voucher-${voucher.id}` } : undefined);
  return { voucher, user };
}
