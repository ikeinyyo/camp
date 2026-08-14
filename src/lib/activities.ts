import "server-only";

import { randomUUID } from "node:crypto";
import { TableClient, type TableEntity } from "@azure/data-tables";
import { schedule as defaultSchedule, type ScheduleDay, type ScheduleEvent } from "@/config/schedule";
import { addPointMovement, DuplicatePointMovementError } from "./points";
import { getUserById } from "./users";

const ACTIVITY_PARTITION = "activity";
const CLAIM_PARTITION = "activityClaim";

type ActivityEntity = TableEntity<{
  dayId: string; date: string; shortDate: string; start: string; end: string;
  title: string; description: string; location: string; required: boolean;
  participationPoints: number; firstPoints: number; secondPoints: number; thirdPoints: number;
  active: boolean;
}>;

type ActivityClaimEntity = TableEntity<{
  activityId: string; activityTitle: string; userId: string; displayName: string;
  points: number; status: "pending" | "redeemed"; createdAt: string; redeemedAt?: string;
}>;

export type ActivityInput = Omit<ScheduleEvent, "id" | "podiumPoints"> & {
  dayId: string; date: string; shortDate: string; firstPoints: number;
  secondPoints: number; thirdPoints: number; active: boolean;
};

let tableReady: Promise<TableClient> | undefined;
async function getTableClient() {
  if (!tableReady) {
    tableReady = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const tableName = process.env.AZURE_STORAGE_ACTIVITIES_TABLE_NAME ?? "Activities";
      if (!connectionString) throw new Error("Falta configurar AZURE_STORAGE_CONNECTION_STRING.");
      const client = TableClient.fromConnectionString(connectionString, tableName);
      await client.createTable();
      return client;
    })().catch((error) => { tableReady = undefined; throw error; });
  }
  return tableReady;
}

function toEvent(entity: ActivityEntity): ScheduleEvent & { dayId: string; date: string; shortDate: string; active: boolean } {
  const hasPodium = entity.firstPoints > 0 || entity.secondPoints > 0 || entity.thirdPoints > 0;
  return { id: entity.rowKey, dayId: entity.dayId, date: entity.date, shortDate: entity.shortDate, start: entity.start, end: entity.end, title: entity.title, description: entity.description, location: entity.location, required: entity.required, participationPoints: entity.participationPoints, ...(hasPodium ? { podiumPoints: { first: entity.firstPoints, second: entity.secondPoints, third: entity.thirdPoints } } : {}), active: entity.active };
}

function validateActivity(input: ActivityInput) {
  if (!input.title.trim() || !input.description.trim() || !input.location.trim()) throw new Error("Faltan datos de la actividad.");
  if (!/^\d{2}:\d{2}$/.test(input.start) || !/^\d{2}:\d{2}$/.test(input.end)) throw new Error("Hora no válida.");
  for (const points of [input.participationPoints, input.firstPoints, input.secondPoints, input.thirdPoints]) if (!Number.isInteger(points) || points < 0) throw new Error("Puntos no válidos.");
}

async function seedActivities() {
  const client = await getTableClient();
  await Promise.all(defaultSchedule.flatMap((day) => day.events.map((event) => {
    const entity: ActivityEntity = { partitionKey: ACTIVITY_PARTITION, rowKey: event.id, dayId: day.id, date: day.date, shortDate: day.shortDate, start: event.start, end: event.end, title: event.title, description: event.description, location: event.location, required: event.required, participationPoints: event.participationPoints, firstPoints: event.podiumPoints?.first ?? 0, secondPoints: event.podiumPoints?.second ?? 0, thirdPoints: event.podiumPoints?.third ?? 0, active: true };
    return client.upsertEntity(entity, "Merge");
  })));
}

export async function listActivities(options?: { includeInactive?: boolean }) {
  const client = await getTableClient();
  const entities = client.listEntities<ActivityEntity>({ queryOptions: { filter: `PartitionKey eq '${ACTIVITY_PARTITION}'` } });
  const activities: ReturnType<typeof toEvent>[] = [];
  for await (const entity of entities) activities.push(toEvent(entity));
  if (activities.length === 0) { await seedActivities(); return listActivities(options); }
  return activities.filter((activity) => options?.includeInactive || activity.active).sort((a, b) => `${a.dayId}-${a.start}`.localeCompare(`${b.dayId}-${b.start}`));
}

export async function getSchedule(): Promise<ScheduleDay[]> {
  const activities = await listActivities();
  return defaultSchedule.map((day) => ({ ...day, events: activities.filter((activity) => activity.dayId === day.id) }));
}

export async function getActivity(id: string) {
  try { return toEvent(await (await getTableClient()).getEntity<ActivityEntity>(ACTIVITY_PARTITION, id)); }
  catch (error) { if (typeof error === "object" && error && "statusCode" in error && error.statusCode === 404) return null; throw error; }
}

export async function createActivity(input: ActivityInput) {
  validateActivity(input);
  const entity: ActivityEntity = { partitionKey: ACTIVITY_PARTITION, rowKey: randomUUID(), ...input, title: input.title.trim(), description: input.description.trim(), location: input.location.trim() };
  await (await getTableClient()).createEntity(entity);
}

export async function updateActivity(id: string, input: ActivityInput) {
  validateActivity(input);
  const client = await getTableClient();
  const current = await client.getEntity<ActivityEntity>(ACTIVITY_PARTITION, id);
  await client.updateEntity({ ...current, ...input, title: input.title.trim(), description: input.description.trim(), location: input.location.trim() }, "Merge");
}

export async function deleteActivity(id: string) { await (await getTableClient()).deleteEntity(ACTIVITY_PARTITION, id); }

export async function createActivityClaim(activityId: string, userId: string) {
  const [activity, user] = await Promise.all([getActivity(activityId), getUserById(userId)]);
  if (!activity?.active || activity.participationPoints < 1 || !user) throw new Error("Actividad no disponible.");
  const entity: ActivityClaimEntity = { partitionKey: CLAIM_PARTITION, rowKey: randomUUID(), activityId, activityTitle: activity.title, userId, displayName: user.displayName, points: activity.participationPoints, status: "pending", createdAt: new Date().toISOString() };
  await (await getTableClient()).createEntity(entity);
  return { id: entity.rowKey, ...entity };
}

export async function redeemActivityClaim(claimId: string) {
  const client = await getTableClient();
  const entity = await client.getEntity<ActivityClaimEntity>(CLAIM_PARTITION, claimId);
  if (entity.status === "redeemed") return { claim: entity, alreadyRedeemed: true };
  entity.status = "redeemed"; entity.redeemedAt = new Date().toISOString();
  await client.updateEntity(entity, "Merge");
  try {
    await addPointMovement(
      { userId: entity.userId, points: entity.points, source: "activity", sourceId: entity.activityId, concept: entity.activityTitle, detail: "Puntos por participar", method: "qr" },
      { uniqueKey: `activity_${entity.activityId}_participation` },
    );
  }
  catch (error) {
    if (error instanceof DuplicatePointMovementError) return { claim: entity, alreadyRedeemed: true };
    entity.status = "pending"; entity.redeemedAt = undefined; await client.updateEntity(entity, "Merge"); throw error;
  }
  return { claim: entity, alreadyRedeemed: false };
}

export async function applyActivityPoints(activityId: string, userId: string, reward: "participation" | "first" | "second" | "third") {
  const [activity, user] = await Promise.all([getActivity(activityId), getUserById(userId)]);
  if (!activity || !user) throw new Error("Actividad o usuario no disponible.");
  const points = reward === "participation" ? activity.participationPoints : activity.podiumPoints?.[reward] ?? 0;
  if (points < 1) throw new Error("La recompensa seleccionada no tiene puntos.");
  const labels = { participation: "Puntos por participar", first: "Primer puesto", second: "Segundo puesto", third: "Tercer puesto" };
  await addPointMovement(
    { userId, points, source: "activity", sourceId: activity.id, concept: activity.title, detail: labels[reward], method: "manual" },
    reward === "participation"
      ? { uniqueKey: `activity_${activity.id}_participation` }
      : undefined,
  );
}
