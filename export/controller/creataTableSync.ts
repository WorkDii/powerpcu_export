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
        PRIMARY_KEY_HASH VARCHAR(32) NOT NULL,
        ROW_HASH VARCHAR(32) NOT NULL,
        DELETE_STATUS TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (PRIMARY_KEY_HASH),
        INDEX idx_ROW_HASH (ROW_HASH),
        INDEX idx_PRIMARY_KEY_HASH (PRIMARY_KEY_HASH),
        INDEX idx_DELETE_STATUS (DELETE_STATUS)
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
