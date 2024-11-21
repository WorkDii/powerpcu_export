import "@std/dotenv/load";
import { configSchema } from "./schema.ts";

export const env = configSchema.safeParse(Deno.env.toObject());
