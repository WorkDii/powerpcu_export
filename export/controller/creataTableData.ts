import { mysqlClient } from "../../lib/db.ts";
import { QueryMap } from "../../lib/type.ts";
import { RowDataPacket } from "mysql2";
import { getTableName } from "./getTableName.ts";

const TARGET_DB = "data_hinfo";

interface Column extends RowDataPacket {
  COLUMN_NAME: string;
}

export const createTableData = async (queryMap: QueryMap) => {
  const targetTable = `${queryMap.target_table}_data`;
  const targetTableTemp = `${queryMap.target_table}_data_temp`;
  const primary_column = queryMap.field_primary_key;
  const conn = await mysqlClient.getConnection();
  const tableNames = getTableName(queryMap);

  try {
    await conn.beginTransaction();

    // drop table
    await conn.query(`DROP TABLE IF EXISTS ${tableNames.temp};`);
    await conn.query(`DROP TABLE IF EXISTS ${tableNames.data};`);

    // create temp table
    await conn.query(
      `CREATE TABLE IF NOT EXISTS ${tableNames.temp} 
      ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
      AS (${queryMap.query}) `
    );

    // get columns from temp table
    const [columns] = await conn.query<[Column[], any]>(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA  = '${tableNames.target_db}'
       AND TABLE_NAME = '${tableNames.temp.replace(
         tableNames.target_db + ".",
         ""
       )}'
    `);
    const columnsStr = columns.map((column) => column.COLUMN_NAME).join(", ");

    // create table
    const sqlCreateTable = `
      CREATE TABLE IF NOT EXISTS ${tableNames.data}
      ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
      SELECT t.*, md5(CONCAT_WS('', ${columnsStr})) as row_hash, md5(CONCAT_WS('', ${primary_column})) as primary_key_hash
      FROM ${tableNames.temp} as t;
    `;
    await conn.query(sqlCreateTable);
    await conn.query(`
      ALTER TABLE ${tableNames.data} ADD INDEX idx_row_hash (row_hash);
    `);
    await conn.query(`
      ALTER TABLE ${tableNames.data} ADD INDEX idx_primary_key_hash (primary_key_hash);
    `);

    // drop temp table
    await conn.query(`DROP TABLE IF EXISTS ${tableNames.temp};`);

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
