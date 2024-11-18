import { createPool } from "mysql2/promise";
import { env } from "./env.ts";

export const pool = await createPool({
  host: env.data?.db_host,
  user: env.data?.db_user,
  password: env.data?.db_password,
  database: env.data?.db_name,
  port: Number(env.data?.db_port),
  connectionLimit: 5,
});
