import { updateItem } from "@directus/sdk";
import { directusClient } from "../../../lib/api.ts";
import { pool as conn } from "../../../lib/db.ts";
import { QueryMap } from "../../../lib/type.ts";
import { getTableName } from "../getTableName.ts";
import { logger } from "../../../lib/log.ts";

export const listDeleteItem = async (
  tableNames: ReturnType<typeof getTableName>
) => {
  try {
    const [rows] = await conn.query(`
      SELECT s.*
      FROM ${tableNames.sync} s
      LEFT JOIN ${tableNames.data} d ON d.PRIMARY_KEY_HASH = s.PRIMARY_KEY_HASH
      WHERE d.PRIMARY_KEY_HASH IS NULL and s.DELETE_FLAG = 0
    `);

    return rows;
  } catch (error) {
    throw error;
  }
};

const deleteItem = async (
  { PRIMARY_KEY_HASH, ...item }: { PRIMARY_KEY_HASH: string },
  sync_table: string,
  queryMap: QueryMap
) => {
  await directusClient?.request(
    updateItem(queryMap.target_table, PRIMARY_KEY_HASH, {
      DELETE_FLAG: 1,
    })
  );
  try {
    const [rows] = await conn.query(
      `
    UPDATE ${sync_table} SET DELETE_FLAG = ?
      WHERE PRIMARY_KEY_HASH = ?
    `,
      [1, PRIMARY_KEY_HASH]
    );

    return rows;
  } catch (error) {
    throw error;
  }
};

export const uploadDeleteItems = async (queryMap: QueryMap) => {
  const tableNames = getTableName(queryMap);
  const deleteItems = (await listDeleteItem(tableNames)) as any[];
  for (let index = 0; index < deleteItems.length; index++) {
    const item = deleteItems[index];
    logger.info(
      `delete item ${item.PRIMARY_KEY_HASH} from directus ${index + 1} / ${
        deleteItems.length
      }`
    );
    await deleteItem(item, tableNames.sync, queryMap);
  }
  logger.info(`finish uploadDeleteItems ${queryMap.target_table}`);
};
