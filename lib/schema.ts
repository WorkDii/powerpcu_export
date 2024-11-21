import { z } from "zod";

export const configSchema = z.object({
  api_url: z.string().url(),
  api_token: z.string().min(1),
  api_admin_token: z.string().optional(),
  db_type: z.enum(["MySQL", "PostgreSQL"]),
  db_host: z.string().min(1),
  db_port: z.string().min(1),
  db_name: z.string().min(1),
  db_user: z.string().min(1),
  db_password: z.string().min(1),
});
