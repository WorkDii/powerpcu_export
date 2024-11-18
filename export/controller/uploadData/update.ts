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
  sync_table: string
) => {
  // call rest
  console.log(item);

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
  for (const item of updateItems) {
    await updateItem(item, tableNames.sync);
  }
  console.log("finish uploadUpdateItems");
};
