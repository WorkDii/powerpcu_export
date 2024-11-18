import { mysqlClient } from "../../../lib/db.ts";
import { QueryMap } from "../../../lib/type.ts";
import { getTableName } from "../getTableName.ts";

export const listNewItem = async (
  tableNames: ReturnType<typeof getTableName>
) => {
  const conn = await mysqlClient.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(`
      SELECT d.*
      FROM ${tableNames.data} d
      LEFT JOIN ${tableNames.sync} s ON d.primary_key_hash = s.primary_key_hash
      WHERE s.primary_key_hash IS NULL
    `);

    await conn.commit();
    return rows;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const uploadItem = async (
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
    INSERT INTO ${sync_table} (primary_key_hash, row_hash)
      VALUES (?, ?)
    `,
      [primary_key_hash, row_hash]
    );

    return rows;
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};
export const uploadNewItem = async (queryMap: QueryMap) => {
  const tableNames = getTableName(queryMap);

  const newItems = (await listNewItem(tableNames)) as any[];
  for (const item of newItems) {
    await uploadItem(item, tableNames.sync);
  }
  console.log("finish");
};
