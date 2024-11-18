import { mysqlClient } from "../../../lib/db.ts";
import { QueryMap } from "../../../lib/type.ts";
import { getTableName } from "../getTableName.ts";

export const listDeleteItem = async (
  tableNames: ReturnType<typeof getTableName>
) => {
  const conn = await mysqlClient.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT s.*
      FROM ${tableNames.sync} s
      LEFT JOIN ${tableNames.data} d ON d.PRIMARY_KEY_HASH = s.PRIMARY_KEY_HASH
      WHERE d.PRIMARY_KEY_HASH IS NULL and s.DELETE_STATUS = 0
    `);

    return rows;
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

const deleteItem = async (
  { PRIMARY_KEY_HASH, ...item }: { PRIMARY_KEY_HASH: string },
  sync_table: string
) => {
  // call rest
  console.log(item);

  const conn = await mysqlClient.getConnection();
  try {
    const [rows] = await conn.query(
      `
    UPDATE ${sync_table} SET DELETE_STATUS = ?
      WHERE PRIMARY_KEY_HASH = ?
    `,
      [1, PRIMARY_KEY_HASH]
    );

    return rows;
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

export const uploadDeleteItems = async (queryMap: QueryMap) => {
  const tableNames = getTableName(queryMap);
  const deleteItems = (await listDeleteItem(tableNames)) as any[];
  for (const item of deleteItems) {
    await deleteItem(item, tableNames.sync);
  }
  console.log("finish uploadDeleteItems");
};
