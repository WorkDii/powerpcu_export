import { RowDataPacket } from "mysql2";
import { directusClient } from "../../../lib/api.ts";
import { pool as conn } from "../../../lib/db.ts";
import { logger } from "../../../lib/log.ts";
import { QueryMap } from "../../../lib/type.ts";
import { getTableName } from "../getTableName.ts";
import { createItems } from "@directus/sdk";

interface NewItem {
  ROW_HASH: string;
  PRIMARY_KEY_HASH: string;
}

export const listNewItem = async (
  tableNames: ReturnType<typeof getTableName>
): Promise<NewItem[]> => {
  try {
    const [rows] = await conn.query<(NewItem & RowDataPacket)[]>(`
      SELECT d.*
      FROM ${tableNames.data} d
      LEFT JOIN ${tableNames.sync} s ON d.PRIMARY_KEY_HASH = s.PRIMARY_KEY_HASH
      WHERE s.PRIMARY_KEY_HASH IS NULL
    `);

    return rows;
  } catch (error) {
    throw error;
  }
};

const uploadItems = async (
  items: NewItem[],
  sync_table: string,
  queryMap: QueryMap
) => {
  try {
    await directusClient?.request(createItems(queryMap.target_table, items));
    await conn.query(
      `
    INSERT INTO ${sync_table} (PRIMARY_KEY_HASH, ROW_HASH)
      VALUES ${items
        .map((item) => `("${item.PRIMARY_KEY_HASH}", "${item.ROW_HASH}")`)
        .join(", ")}
    `
    );
  } catch (error) {
    throw error;
  }
};
export const uploadNewItems = async (queryMap: QueryMap) => {
  const tableNames = getTableName(queryMap);
  const newItems = await listNewItem(tableNames);

  const batchSize = 100;
  for (let i = 0; i < newItems.length; i += batchSize) {
    const batch = newItems.slice(i, i + batchSize);
    logger.info(
      `uploading to ${queryMap.target_table} batch ${
        Math.floor(i / batchSize) + 1
      }/${Math.ceil(newItems.length / batchSize)} (${i + 1}-${Math.min(
        i + batchSize,
        newItems.length
      )}/${newItems.length} items)`
    );
    await uploadItems(batch, tableNames.sync, queryMap);
  }
  logger.info(`end uploadNewItems ${queryMap.target_table}`);
};
