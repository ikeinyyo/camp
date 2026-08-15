import "server-only";

import { randomUUID } from "node:crypto";
import { BlobServiceClient } from "@azure/storage-blob";
import { TableClient, odata, type TableEntity } from "@azure/data-tables";
import { hashPassword, verifyPassword } from "./password";
import { UserValidationError, validateUserInput } from "./user-validation";
import { STORAGE_SETTINGS } from "@/config/storage";

export { UserValidationError } from "./user-validation";

const USER_PARTITION = "user";

export type User = {
  id: string;
  username: string;
  displayName: string;
  points: number;
  status: string;
  approved: boolean;
  avatarUrl?: string;
};

type UserEntity = TableEntity<{
  username: string;
  usernameNormalized: string;
  displayName: string;
  points: number;
  passwordHash: string;
  createdAt: string;
  status?: string;
  avatarBlobName?: string;
  avatarUpdatedAt?: string;
  approved?: boolean;
}>;

export class UsernameAlreadyExistsError extends Error {}
export class UserPendingApprovalError extends Error {}

let tableReady: Promise<TableClient> | undefined;

function normalizeUsername(username: string) {
  return username.trim().toLocaleLowerCase("es");
}

async function getTableClient() {
  if (!tableReady) {
    tableReady = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const tableName = STORAGE_SETTINGS.tables.users;
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
    status: entity.status ?? "",
    approved: entity.approved ?? true,
    avatarUrl: entity.avatarBlobName ? `/api/users/${entity.rowKey}/avatar?v=${encodeURIComponent(entity.avatarUpdatedAt ?? "1")}` : undefined,
  };
}

async function getAvatarContainer() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) throw new Error("Falta configurar AZURE_STORAGE_CONNECTION_STRING.");
  const container = BlobServiceClient.fromConnectionString(connectionString).getContainerClient(STORAGE_SETTINGS.containers.userAvatars);
  await container.createIfNotExists();
  return container;
}

async function uploadAvatar(blobName: string, image: File) {
  if (!image.type.startsWith("image/") || image.size > 8 * 1024 * 1024) throw new UserValidationError("avatar", "La imagen no es válida.");
  await (await getAvatarContainer()).getBlockBlobClient(blobName).uploadData(await image.arrayBuffer(), { blobHTTPHeaders: { blobContentType: image.type, blobCacheControl: "public, max-age=3600" } });
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

export async function getUserByUsername(username: string) {
  const entity = await findUserEntityByUsername(username);
  return entity ? toUser(entity) : null;
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

export async function getUserAvatar(id: string) {
  const entity = await (await getTableClient()).getEntity<UserEntity>(USER_PARTITION, id);
  if (!entity.avatarBlobName) throw new Error("El usuario no tiene avatar.");
  return (await getAvatarContainer()).getBlobClient(entity.avatarBlobName).download();
}

export async function updateUserProfile(id: string, input: { displayName: string; status: string; avatar?: File }) {
  const displayName = input.displayName.trim();
  const status = input.status.trim();
  if (displayName.length < 2 || displayName.length > 80) throw new UserValidationError("displayName", "Nombre no válido.");
  if (status.length > 120) throw new UserValidationError("status", "El estado no puede superar 120 caracteres.");
  const client = await getTableClient();
  const current = await client.getEntity<UserEntity>(USER_PARTITION, id);
  const avatarBlobName = input.avatar?.size ? (current.avatarBlobName ?? `${id}.jpg`) : current.avatarBlobName;
  if (input.avatar?.size && avatarBlobName) await uploadAvatar(avatarBlobName, input.avatar);
  await client.updateEntity({ ...current, displayName, status, ...(avatarBlobName ? { avatarBlobName } : {}), ...(input.avatar?.size ? { avatarUpdatedAt: new Date().toISOString() } : {}) }, "Merge");
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
  approved?: boolean;
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
    approved: input.approved ?? false,
  };
  await client.createEntity(entity);
  return toUser(entity);
}

export async function authenticateUser(username: string, password: string) {
  const entity = await findUserEntityByUsername(username);
  if (!entity || !(await verifyPassword(password, entity.passwordHash))) return null;
  if (entity.approved === false) throw new UserPendingApprovalError("El usuario está pendiente de validación.");
  return toUser(entity);
}

export async function updateUser(
  id: string,
  input: { username: string; displayName: string; points: number; approved: boolean; password?: string },
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
    approved: input.approved,
    ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
  };
  await client.updateEntity(entity, "Merge");
  return toUser(entity);
}
