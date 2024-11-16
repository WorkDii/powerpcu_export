import { configSchema } from "./schema.ts";
import { z } from "zod";

export const saveConfig = async (config: z.infer<typeof configSchema>) => {
  const env = Object.entries(config).map(([key, value]) => `${key}=${value}`);
  await Deno.writeTextFile("./.env", env.join("\n"));
};
