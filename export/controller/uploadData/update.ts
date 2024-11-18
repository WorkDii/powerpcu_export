import { mysqlClient } from "../../../lib/db.ts";
import { QueryMap } from "../../../lib/type.ts";
import { getTableName } from "../getTableName.ts";

export const listUpdateItem = async (
  tableNames: ReturnType<typeof getTableName>
) => {
  const conn = await mysqlClient.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT d.*
      FROM ${tableNames.data} d
      LEFT JOIN ${tableNames.sync} s ON d.primary_key_hash = s.primary_key_hash
      WHERE s.row_hash != d.row_hash
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
    row_hash,
    primary_key_hash,
    ...item
  }: { row_hash: string; primary_key_hash: string },
  sync_table: string
) => {
  // call rest
  console.log(item);

  const conn = await mysqlClient.getConnection();
  try {
    const [rows] = await conn.query(
      `
    UPDATE ${sync_table} SET row_hash = ?
      WHERE primary_key_hash = ?
    `,
      [row_hash, primary_key_hash]
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
  for (const item of updateItems) {
    await updateItem(item, tableNames.sync);
  }
  console.log("finish uploadUpdateItems");
};
