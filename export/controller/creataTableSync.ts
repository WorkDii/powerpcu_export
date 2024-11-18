import { mysqlClient } from "../../lib/db.ts";
import { QueryMap } from "../../lib/type.ts";
import { RowDataPacket } from "mysql2";
import { getTableName } from "./getTableName.ts";

const TARGET_DB = "data_hinfo";

interface Column extends RowDataPacket {
  COLUMN_NAME: string;
}

export const createTableSync = async (queryMap: QueryMap) => {
  const tableNames = getTableName(queryMap);
  const conn = await mysqlClient.getConnection();
  try {
    await conn.beginTransaction();

    // create sync table if not exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ${tableNames.sync} (
        primary_key_hash VARCHAR(32) NOT NULL,
        row_hash VARCHAR(32) NOT NULL,
        delete_status TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (primary_key_hash),
        INDEX idx_row_hash (row_hash),
        INDEX idx_primary_key_hash (primary_key_hash),
        INDEX idx_delete_status (delete_status)
      ) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci; 
    `);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
