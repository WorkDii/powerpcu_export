import { directusClient } from "../../lib/api.ts";
import { readItems } from "@directus/sdk";
import { Ou } from "../../lib/type.ts";

export const getOu = async () => {
  const data = await directusClient.request<Ou[]>(
    readItems("ou", {
      fields: ["*", "query_map.query_map_id.*"],
    })
  );
  return data[0];
};
