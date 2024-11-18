import { createPool } from "mysql2/promise";
import { env } from "./env.ts";

export const pool = await createPool({
  host: env.db_host,
  user: env.db_user,
  password: env.db_password,
  database: env.db_name,
  port: Number(env.db_port),
  connectionLimit: 5,
});
