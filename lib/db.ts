import { createPool, FieldPacket } from "mysql2/promise";
import { env } from "./env.ts";

export const mysqlClient = await createPool({
  host: env.db_host,
  user: env.db_user,
  password: env.db_password,
  database: env.db_name,
  port: Number(env.db_port),
});

// export const query = async (sql: string, values?: any[]) => {
//   const [rows, fields] = await mysqlClient.query(sql, values);
//   return rows;
// };

// export const queryTransaction = async (sql: string[], values?: any[]) => {
//   const cons = await mysqlClient.getConnection();
//   await cons.beginTransaction();
//   const result = await Promise.all(sql.map((sql) => cons.query(sql, values)));
//   await cons.commit();
//   return result;
// };
