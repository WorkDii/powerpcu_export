import { pool } from "../../lib/db.ts";
import { QueryMap } from "../../lib/type.ts";
import { RowDataPacket } from "mysql2";
import { getTableName } from "./getTableName.ts";
import { logger } from "../../lib/log.ts";

interface Column extends RowDataPacket {
  COLUMN_NAME: string;
}

export const createTableData = async (queryMap: QueryMap) => {
  logger.info(`createTableData ${queryMap.target_table}`);
  const primary_column = queryMap.field_primary_key;
  const tableNames = getTableName(queryMap);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // drop table
    await conn.query(`DROP TABLE IF EXISTS ${tableNames.temp};`);
    await conn.query(`DROP TABLE IF EXISTS ${tableNames.data};`);

    // create temp table
    await conn.query(
      `CREATE TABLE IF NOT EXISTS ${tableNames.temp} 
      DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
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
      DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
      SELECT t.*, md5(CONCAT_WS('|', ${columnsStr})) as ROW_HASH, md5(CONCAT_WS('|', ${primary_column})) as PRIMARY_KEY_HASH
      FROM ${tableNames.temp} as t;
    `;
    await conn.query(sqlCreateTable);
    await conn.query(`
      ALTER TABLE ${tableNames.data} ADD INDEX idx_ROW_HASH (ROW_HASH);
    `);
    await conn.query(`
      ALTER TABLE ${tableNames.data} ADD INDEX idx_PRIMARY_KEY_HASH (PRIMARY_KEY_HASH);
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
