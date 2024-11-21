import "@std/dotenv/load";
import { envPrivateSchema } from "./schema.ts";

export const envPrivate = envPrivateSchema.safeParse(Deno.env.toObject());
