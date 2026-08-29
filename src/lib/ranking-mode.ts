import "server-only";

import { TableClient, type TableEntity } from "@azure/data-tables";
import { STORAGE_SETTINGS } from "@/config/storage";

const PARTITION = "config";
const ROW = "mode";

export type RankingMode = "live" | "hidden" | "final";
export type RankingConfig = { mode: RankingMode; showPrizes: boolean };
type RankingConfigEntity = TableEntity<{ mode: RankingMode; showPrizes?: boolean; updatedAt: string }>;

let tableReady: Promise<TableClient> | undefined;

async function table() {
  if (!tableReady) {
    tableReady = (async () => {
      const connection = process.env.AZURE_STORAGE_CONNECTION_STRING;
      if (!connection) throw new Error("Falta configurar AZURE_STORAGE_CONNECTION_STRING.");
      const client = TableClient.fromConnectionString(connection, STORAGE_SETTINGS.tables.ranking);
      await client.createTable();
      return client;
    })().catch((error) => { tableReady = undefined; throw error; });
  }
  return tableReady;
}

export async function getRankingConfig(): Promise<RankingConfig> {
  try {
    const entity = await (await table()).getEntity<RankingConfigEntity>(PARTITION, ROW);
    return { mode: entity.mode, showPrizes: entity.showPrizes ?? true };
  } catch (error) {
    if (typeof error === "object" && error && "statusCode" in error && error.statusCode === 404) {
      await (await table()).upsertEntity<RankingConfigEntity>({ partitionKey: PARTITION, rowKey: ROW, mode: "live", showPrizes: true, updatedAt: new Date().toISOString() }, "Merge");
      return { mode: "live", showPrizes: true };
    }
    throw error;
  }
}

export async function getRankingMode(): Promise<RankingMode> {
  return (await getRankingConfig()).mode;
}

export async function setRankingMode(mode: RankingMode) {
  if (mode !== "live" && mode !== "hidden" && mode !== "final") throw new Error("Modo de ranking no válido.");
  await (await table()).upsertEntity<RankingConfigEntity>({ partitionKey: PARTITION, rowKey: ROW, mode, updatedAt: new Date().toISOString() }, "Merge");
}

export async function setRankingPrizesVisibility(showPrizes: boolean) {
  const mode = await getRankingMode();
  await (await table()).upsertEntity<RankingConfigEntity>({ partitionKey: PARTITION, rowKey: ROW, mode, showPrizes, updatedAt: new Date().toISOString() }, "Merge");
}
