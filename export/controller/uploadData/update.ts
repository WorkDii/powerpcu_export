import { directusClient } from "../../../lib/api.ts";
import { mysqlClient } from "../../../lib/db.ts";
import { logger } from "../../../lib/log.ts";
import { QueryMap } from "../../../lib/type.ts";
import { getTableName } from "../getTableName.ts";
import { updateItem as directusUpdateItem } from "@directus/sdk";

export const listUpdateItem = async (
  tableNames: ReturnType<typeof getTableName>
) => {
  const conn = await mysqlClient.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT d.*
      FROM ${tableNames.data} d
      LEFT JOIN ${tableNames.sync} s ON d.PRIMARY_KEY_HASH = s.PRIMARY_KEY_HASH
      WHERE s.ROW_HASH != d.ROW_HASH 
    `);

    return rows;
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

const updateItem = async (
  {
    ROW_HASH,
    PRIMARY_KEY_HASH,
    ...item
  }: { ROW_HASH: string; PRIMARY_KEY_HASH: string },
  sync_table: string,
  queryMap: QueryMap
) => {
  await directusClient.request(
    directusUpdateItem(queryMap.target_table, PRIMARY_KEY_HASH, {
      ROW_HASH,
      ...item,
    })
  );
  const conn = await mysqlClient.getConnection();
  try {
    const [rows] = await conn.query(
      `
    UPDATE ${sync_table} SET ROW_HASH = ?
      WHERE PRIMARY_KEY_HASH = ?
    `,
      [ROW_HASH, PRIMARY_KEY_HASH]
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

export const uploadUpdateItems = async (queryMap: QueryMap) => {
  const tableNames = getTableName(queryMap);
  const updateItems = (await listUpdateItem(tableNames)) as any[];
  for (let index = 0; index < updateItems.length; index++) {
    const item = updateItems[index];
    logger.info(
      `update item ${item.PRIMARY_KEY_HASH} to directus ${index + 1} / ${
        updateItems.length
      }`
    );
    await updateItem(item, tableNames.sync, queryMap);
  }
  logger.info(`end uploadUpdateItems ${queryMap.target_table}`);
};
