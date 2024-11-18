import { directusClient } from "../../../lib/api.ts";
import { mysqlClient } from "../../../lib/db.ts";
import { QueryMap } from "../../../lib/type.ts";
import { getTableName } from "../getTableName.ts";
import { createItem } from "@directus/sdk";

export const listNewItem = async (
  tableNames: ReturnType<typeof getTableName>
) => {
  const conn = await mysqlClient.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT d.*
      FROM ${tableNames.data} d
      LEFT JOIN ${tableNames.sync} s ON d.PRIMARY_KEY_HASH = s.PRIMARY_KEY_HASH
      WHERE s.PRIMARY_KEY_HASH IS NULL
    `);

    return rows;
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

const uploadItem = async (
  item: { ROW_HASH: string; PRIMARY_KEY_HASH: string; DELETE_STATUS: number },
  sync_table: string,
  queryMap: QueryMap
) => {
  const conn = await mysqlClient.getConnection();
  try {
    await directusClient.request(createItem(queryMap.target_table, item));
    await conn.query(
      `
    INSERT INTO ${sync_table} (PRIMARY_KEY_HASH, ROW_HASH)
      VALUES (?, ?)
    `,
      [item.PRIMARY_KEY_HASH, item.ROW_HASH]
    );
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};
export const uploadNewItems = async (queryMap: QueryMap) => {
  const tableNames = getTableName(queryMap);
  const newItems = (await listNewItem(tableNames)) as any[];
  for (let index = 0; index < newItems.length; index++) {
    const item = newItems[index];
    console.log(
      `add item ${item.PRIMARY_KEY_HASH} to directus ${index + 1} / ${
        newItems.length
      }`
    );
    await uploadItem(item, tableNames.sync, queryMap);
  }
  console.log("finish uploadNewItems");
};
