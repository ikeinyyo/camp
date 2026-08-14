import "server-only";

import { randomUUID } from "node:crypto";
import { TableClient, type TableEntity } from "@azure/data-tables";
import { awardUserPoints } from "./users";

export type PointSource = "voucher" | "activity";
export type PointMethod = "qr" | "manual";

export type PointMovement = {
  id: string;
  userId: string;
  points: number;
  source: PointSource;
  sourceId: string;
  concept: string;
  detail: string;
  method: PointMethod;
  createdAt: string;
};

type PointEntity = TableEntity<Omit<PointMovement, "id" | "userId"> & { userId: string }>;

export class DuplicatePointMovementError extends Error {
  constructor() {
    super("Estos puntos ya se habían asignado anteriormente.");
    this.name = "DuplicatePointMovementError";
  }
}

let tableReady: Promise<TableClient> | undefined;

async function getTableClient() {
  if (!tableReady) {
    tableReady = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const tableName = process.env.AZURE_STORAGE_POINTS_TABLE_NAME ?? "Points";
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

export async function addPointMovement(
  input: Omit<PointMovement, "id" | "createdAt">,
  options?: { uniqueKey?: string },
) {
  if (!Number.isInteger(input.points) || input.points < 1) throw new Error("Puntos no válidos.");
  const movement: PointEntity = {
    partitionKey: input.userId,
    rowKey: options?.uniqueKey ?? randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  };
  try {
    await (await getTableClient()).createEntity(movement);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      error.statusCode === 409 &&
      options?.uniqueKey
    ) {
      throw new DuplicatePointMovementError();
    }
    throw error;
  }
  try {
    await awardUserPoints(input.userId, input.points);
  } catch (error) {
    await (await getTableClient()).deleteEntity(input.userId, movement.rowKey);
    throw error;
  }
  return { id: movement.rowKey, ...input, createdAt: movement.createdAt };
}

export async function listUserPointMovements(userId: string) {
  const client = await getTableClient();
  const movements: PointMovement[] = [];
  const entities = client.listEntities<PointEntity>({ queryOptions: { filter: `PartitionKey eq '${userId.replaceAll("'", "''")}'` } });
  for await (const entity of entities) {
    movements.push({ id: entity.rowKey, userId: entity.userId, points: entity.points, source: entity.source, sourceId: entity.sourceId, concept: entity.concept, detail: entity.detail, method: entity.method, createdAt: entity.createdAt });
  }
  return movements.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
