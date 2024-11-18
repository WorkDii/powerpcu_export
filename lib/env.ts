import { configSchema } from "./schema.ts";

export const env = configSchema.parse(Deno.env.toObject());
