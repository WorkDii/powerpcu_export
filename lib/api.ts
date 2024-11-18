import { createDirectus, rest, staticToken } from "@directus/sdk";
import { env } from "./env.ts";

export const directusClient = createDirectus(env.api_url)
  .with(staticToken(env.api_token))
  .with(rest());
