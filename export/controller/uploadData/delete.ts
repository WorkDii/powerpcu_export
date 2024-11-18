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
      LEFT JOIN ${tableNames.data} d ON d.primary_key_hash = s.primary_key_hash
      WHERE d.primary_key_hash IS NULL and s.delete_status = 0
    `);

    return rows;
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

const deleteItem = async (
  { primary_key_hash, ...item }: { primary_key_hash: string },
  sync_table: string
) => {
  // call rest
  console.log(item);

  const conn = await mysqlClient.getConnection();
  try {
    const [rows] = await conn.query(
      `
    UPDATE ${sync_table} SET delete_status = ?
      WHERE primary_key_hash = ?
    `,
      [1, primary_key_hash]
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
