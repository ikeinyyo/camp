import "server-only";

import { randomUUID } from "node:crypto";
import { TableClient, type TableEntity } from "@azure/data-tables";
import { STORAGE_SETTINGS } from "@/config/storage";
import { addPointMovement } from "./points";
import { getUserById } from "./users";

const VOUCHER_PARTITION = "voucher";
const CLAIM_PARTITION = "claim";
const MIGRATION_PARTITION = "migration";
const EXTRA_VOUCHERS_MIGRATION = "extra-vouchers-2026-08";

export type Voucher = {
  id: string;
  title: string;
  description: string;
  points: number;
  active: boolean;
  sortOrder: number;
};

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

type VoucherEntity = TableEntity<{
  title: string;
  description: string;
  points: number;
  active: boolean;
  createdAt: string;
  sortOrder?: number;
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
  return { id: entity.rowKey, title: entity.title, description: entity.description, points: entity.points, active: entity.active, sortOrder: entity.sortOrder ?? getDefaultSortOrder(entity.title) };
}

function toClaim(entity: ClaimEntity): VoucherClaim {
  return { id: entity.rowKey, voucherId: entity.voucherId, voucherTitle: entity.voucherTitle, userId: entity.userId, username: entity.username, displayName: entity.displayName, points: entity.points, status: entity.status };
}

function validateVoucher(input: { title: string; description: string; points: number }) {
  if (input.title.trim().length < 3 || input.title.trim().length > 80) throw new Error("Título no válido.");
  if (input.description.trim().length < 5 || input.description.trim().length > 500) throw new Error("Descripción no válida.");
  if (!Number.isInteger(input.points) || input.points < 1 || input.points > 5) throw new Error("Los puntos deben estar entre 1 y 5.");
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
  const vouchers: Voucher[] = [];
  let storedVoucherCount = 0;
  const entities = client.listEntities<VoucherEntity>({ queryOptions: { filter: `PartitionKey eq '${VOUCHER_PARTITION}'` } });
  for await (const entity of entities) {
    storedVoucherCount += 1;
    const expectedSortOrder = entity.sortOrder ?? getDefaultSortOrder(entity.title);
    if (entity.sortOrder === undefined) {
      entity.sortOrder = expectedSortOrder;
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

export async function createVoucher(input: { title: string; description: string; points: number; active?: boolean; sortOrder?: number }) {
  validateVoucher(input);
  const entity: VoucherEntity = { partitionKey: VOUCHER_PARTITION, rowKey: randomUUID(), title: input.title.trim(), description: input.description.trim(), points: input.points, active: input.active ?? true, createdAt: new Date().toISOString(), sortOrder: input.sortOrder ?? getDefaultSortOrder(input.title.trim()) };
  await (await getTableClient()).createEntity(entity);
  return toVoucher(entity);
}

export async function updateVoucher(id: string, input: { title: string; description: string; points: number; active: boolean; sortOrder: number }) {
  validateVoucher(input);
  const client = await getTableClient();
  const current = await client.getEntity<VoucherEntity>(VOUCHER_PARTITION, id);
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 1) throw new Error("Orden no válido.");
  const entity = { ...current, title: input.title.trim(), description: input.description.trim(), points: input.points, active: input.active, sortOrder: input.sortOrder };
  await client.updateEntity(entity, "Merge");
  return toVoucher(entity);
}

export async function deleteVoucher(id: string) {
  await (await getTableClient()).deleteEntity(VOUCHER_PARTITION, id);
}

export async function createVoucherClaim(voucherId: string, userId: string) {
  const [voucher, user] = await Promise.all([getVoucher(voucherId), getUserById(userId)]);
  if (!voucher?.active || !user) throw new Error("El vale o el usuario no están disponibles.");
  const entity: ClaimEntity = { partitionKey: CLAIM_PARTITION, rowKey: randomUUID(), voucherId: voucher.id, voucherTitle: voucher.title, userId: user.id, username: user.username, displayName: user.displayName, points: voucher.points, status: "pending", createdAt: new Date().toISOString() };
  await (await getTableClient()).createEntity(entity);
  return toClaim(entity);
}

export async function redeemVoucherClaim(claimId: string) {
  const client = await getTableClient();
  const entity = await client.getEntity<ClaimEntity>(CLAIM_PARTITION, claimId);
  if (entity.status === "redeemed") return { claim: toClaim(entity), alreadyRedeemed: true };
  entity.status = "redeemed";
  entity.redeemedAt = new Date().toISOString();
  await client.updateEntity(entity, "Merge");
  try {
    await addPointMovement({ userId: entity.userId, points: entity.points, source: "voucher", sourceId: entity.voucherId, concept: entity.voucherTitle, detail: "Vale completado", method: "qr" });
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
  await addPointMovement({ userId, points: voucher.points, source: "voucher", sourceId: voucher.id, concept: voucher.title, detail: "Vale asignado manualmente", method: "manual" });
  return { voucher, user };
}
