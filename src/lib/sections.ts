import "server-only";

import { TableClient, type TableEntity } from "@azure/data-tables";
import {
  SECTION_DEFINITIONS,
  getDefaultSectionAvailability,
  type SectionAvailability,
  type SectionId,
} from "@/config/sections";

const SECTION_PARTITION = "section";

type SectionEntity = TableEntity<{
  enabled: boolean;
  updatedAt: string;
}>;

export type AppSection = (typeof SECTION_DEFINITIONS)[number] & {
  enabled: boolean;
};

let tableReady: Promise<TableClient> | undefined;

async function getTableClient() {
  if (!tableReady) {
    tableReady = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const tableName = process.env.AZURE_STORAGE_SECTIONS_TABLE_NAME ?? "Sections";
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
      return { ...definition, enabled: entity.enabled };
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

export async function isSectionEnabled(id: SectionId) {
  return (await getSafeSectionAvailability())[id];
}

export async function updateSection(id: SectionId, enabled: boolean) {
  if (!SECTION_DEFINITIONS.some((section) => section.id === id)) {
    throw new Error("La sección indicada no existe.");
  }
  const client = await getTableClient();
  await client.upsertEntity<SectionEntity>(
    {
      partitionKey: SECTION_PARTITION,
      rowKey: id,
      enabled,
      updatedAt: new Date().toISOString(),
    },
    "Merge",
  );
}
