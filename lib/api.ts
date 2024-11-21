import { createDirectus, rest, staticToken } from "@directus/sdk";
import { env } from "./env.ts";
import { envPrivate } from "./env.private.ts";

export const directusClient =
  env.data?.api_url && env.data?.api_token
    ? createDirectus(env.data?.api_url || "")
        .with(staticToken(env.data?.api_token || ""))
        .with(rest())
    : null;

export const directusClientAdmin =
  env.data?.api_url && envPrivate.data?.api_admin_token
    ? createDirectus(env.data?.api_url || "")
        .with(staticToken(envPrivate.data?.api_admin_token || ""))
        .with(rest())
    : null;
