import "server-only";

import { randomUUID } from "node:crypto";
import { TableClient, odata, type TableEntity } from "@azure/data-tables";
import { hashPassword, verifyPassword } from "./password";
import { UserValidationError, validateUserInput } from "./user-validation";

export { UserValidationError } from "./user-validation";

const USER_PARTITION = "user";

export type User = {
  id: string;
  username: string;
  displayName: string;
  points: number;
};

type UserEntity = TableEntity<{
  username: string;
  usernameNormalized: string;
  displayName: string;
  points: number;
  passwordHash: string;
  createdAt: string;
}>;

export class UsernameAlreadyExistsError extends Error {}

let tableReady: Promise<TableClient> | undefined;

function normalizeUsername(username: string) {
  return username.trim().toLocaleLowerCase("es");
}

async function getTableClient() {
  if (!tableReady) {
    tableReady = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const tableName = process.env.AZURE_STORAGE_USERS_TABLE_NAME ?? "Users";
      if (!connectionString) {
        throw new Error("Falta configurar AZURE_STORAGE_CONNECTION_STRING.");
      }

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

function toUser(entity: UserEntity): User {
  return {
    id: entity.rowKey,
    username: entity.username,
    displayName: entity.displayName,
    points: entity.points,
  };
}

async function findUserEntityByUsername(username: string) {
  const client = await getTableClient();
  const normalized = normalizeUsername(username);
  const entities = client.listEntities<UserEntity>({
    queryOptions: {
      filter: odata`PartitionKey eq ${USER_PARTITION} and usernameNormalized eq ${normalized}`,
    },
  });

  for await (const entity of entities) return entity;
  return undefined;
}

export async function listUsers() {
  const client = await getTableClient();
  const users: User[] = [];
  const entities = client.listEntities<UserEntity>({
    queryOptions: { filter: odata`PartitionKey eq ${USER_PARTITION}` },
  });

  for await (const entity of entities) users.push(toUser(entity));
  return users.sort((left, right) => left.displayName.localeCompare(right.displayName, "es"));
}

export async function getUsersByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const client = await getTableClient();
  const users = await Promise.all(
    ids.map(async (id) => {
      try {
        return toUser(await client.getEntity<UserEntity>(USER_PARTITION, id));
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          error.statusCode === 404
        ) {
          return null;
        }
        throw error;
      }
    }),
  );
  return users.filter((user): user is User => user !== null);
}

export async function getUserById(id: string) {
  const users = await getUsersByIds([id]);
  return users[0] ?? null;
}

export async function awardUserPoints(id: string, points: number) {
  if (!Number.isInteger(points) || points === 0) {
    throw new Error("La puntuación debe ser un entero distinto de cero.");
  }

  const client = await getTableClient();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const entity = await client.getEntity<UserEntity>(USER_PARTITION, id);
    entity.points = Math.max(0, (entity.points ?? 0) + points);
    try {
      await client.updateEntity(entity, "Replace");
      return toUser(entity);
    } catch (error) {
      if (
        attempt === 2 ||
        typeof error !== "object" ||
        error === null ||
        !("statusCode" in error) ||
        error.statusCode !== 412
      ) {
        throw error;
      }
    }
  }
  throw new Error("No se pudieron actualizar los puntos.");
}

export async function createUser(input: {
  username: string;
  displayName?: string;
  password: string;
}) {
  const username = input.username.trim();
  const displayName = input.displayName?.trim() || username;
  validateUserInput(username, displayName, input.password);
  if (await findUserEntityByUsername(username)) {
    throw new UsernameAlreadyExistsError("Ese nombre de usuario ya está registrado.");
  }

  const client = await getTableClient();
  const entity: UserEntity = {
    partitionKey: USER_PARTITION,
    rowKey: randomUUID(),
    username,
    usernameNormalized: normalizeUsername(username),
    displayName,
    points: 0,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  await client.createEntity(entity);
  return toUser(entity);
}

export async function authenticateUser(username: string, password: string) {
  const entity = await findUserEntityByUsername(username);
  if (!entity || !(await verifyPassword(password, entity.passwordHash))) return null;
  return toUser(entity);
}

export async function updateUser(
  id: string,
  input: { username: string; displayName: string; points: number; password?: string },
) {
  const username = input.username.trim();
  const displayName = input.displayName.trim();
  validateUserInput(username, displayName, input.password || undefined);
  if (!Number.isInteger(input.points) || input.points < 0) {
    throw new UserValidationError(
      "points",
      "Los puntos deben ser un número entero igual o mayor que cero.",
    );
  }

  const existingUsername = await findUserEntityByUsername(username);
  if (existingUsername && existingUsername.rowKey !== id) {
    throw new UsernameAlreadyExistsError("Ese nombre de usuario ya está en uso.");
  }

  const client = await getTableClient();
  const current = await client.getEntity<UserEntity>(USER_PARTITION, id);
  const entity: UserEntity = {
    ...current,
    username,
    usernameNormalized: normalizeUsername(username),
    displayName,
    points: input.points,
    ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
  };
  await client.updateEntity(entity, "Merge");
  return toUser(entity);
}
