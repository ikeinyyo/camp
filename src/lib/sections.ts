import "server-only";

import { TableClient, type TableEntity } from "@azure/data-tables";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SECTION_DEFINITIONS,
  getDefaultSectionAvailability,
  getDefaultSectionAuthentication,
  type SectionAvailability,
  type SectionAuthentication,
  type SectionId,
} from "@/config/sections";
import { STORAGE_SETTINGS } from "@/config/storage";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

const SECTION_PARTITION = "section";

type SectionEntity = TableEntity<{
  enabled: boolean;
  requiresAuth?: boolean;
  updatedAt: string;
}>;

export type AppSection = (typeof SECTION_DEFINITIONS)[number] & {
  enabled: boolean;
  requiresAuth: boolean;
};

let tableReady: Promise<TableClient> | undefined;

async function getTableClient() {
  if (!tableReady) {
    tableReady = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const tableName = STORAGE_SETTINGS.tables.sections;
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

export async function listSections(): Promise<AppSection[]> {
  const client = await getTableClient();
  const storedSections = new Map<string, SectionEntity>();
  const entities = client.listEntities<SectionEntity>({
    queryOptions: { filter: `PartitionKey eq '${SECTION_PARTITION}'` },
  });

  for await (const entity of entities) storedSections.set(entity.rowKey, entity);

  return Promise.all(
    SECTION_DEFINITIONS.map(async (definition) => {
      let entity = storedSections.get(definition.id);
      if (!entity) {
        const newEntity: SectionEntity = {
          partitionKey: SECTION_PARTITION,
          rowKey: definition.id,
          enabled: definition.defaultEnabled,
          requiresAuth: definition.defaultRequiresAuth,
          updatedAt: new Date().toISOString(),
        };
        try {
          await client.createEntity(newEntity);
          entity = newEntity;
        } catch (error) {
          if (
            typeof error !== "object" ||
            error === null ||
            !("statusCode" in error) ||
            error.statusCode !== 409
          ) {
            throw error;
          }
          entity = await client.getEntity<SectionEntity>(
            SECTION_PARTITION,
            definition.id,
          );
        }
      }
      return { ...definition, enabled: entity.enabled, requiresAuth: definition.id === "access" ? false : (entity.requiresAuth ?? definition.defaultRequiresAuth) };
    }),
  );
}

export async function getSectionAvailability(): Promise<SectionAvailability> {
  return Object.fromEntries(
    (await listSections()).map((section) => [section.id, section.enabled]),
  ) as SectionAvailability;
}

export async function getSafeSectionAvailability() {
  try {
    return await getSectionAvailability();
  } catch {
    return getDefaultSectionAvailability();
  }
}

export async function getSectionAuthentication(): Promise<SectionAuthentication> {
  return Object.fromEntries(
    (await listSections()).map((section) => [section.id, section.requiresAuth]),
  ) as SectionAuthentication;
}

export async function getSafeSectionAuthentication() {
  try {
    return await getSectionAuthentication();
  } catch {
    return getDefaultSectionAuthentication();
  }
}

export async function getSectionAccess(id: SectionId) {
  const section = (await listSections()).find((item) => item.id === id);
  return section ?? { ...SECTION_DEFINITIONS.find((item) => item.id === id)!, enabled: false, requiresAuth: false };
}

export async function enforceSectionAccess(id: SectionId) {
  const section = await getSectionAccess(id);
  if (!section.enabled) redirect("/");
  if (section.requiresAuth) {
    const cookieStore = await cookies();
    const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
    if (!session) redirect("/login");
  }
}

export async function isSectionEnabled(id: SectionId) {
  return (await getSafeSectionAvailability())[id];
}

export async function updateSection(id: SectionId, enabled: boolean, requiresAuth: boolean) {
  if (!SECTION_DEFINITIONS.some((section) => section.id === id)) {
    throw new Error("La sección indicada no existe.");
  }
  const client = await getTableClient();
  await client.upsertEntity<SectionEntity>(
    {
      partitionKey: SECTION_PARTITION,
      rowKey: id,
      enabled,
      requiresAuth: id === "access" ? false : requiresAuth,
      updatedAt: new Date().toISOString(),
    },
    "Merge",
  );
}
