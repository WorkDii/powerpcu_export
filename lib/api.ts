import { createDirectus, rest, staticToken } from "@directus/sdk";
import { env } from "./env.ts";

export const directusClient =
  env.data?.api_url && env.data?.api_token
    ? createDirectus(env.data?.api_url || "")
        .with(staticToken(env.data?.api_token || ""))
        .with(rest())
    : null;
