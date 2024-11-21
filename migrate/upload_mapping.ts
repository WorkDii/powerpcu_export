/**
 * this is helper function to upload data mapping (data_hinfo.ranod_mapp_chk) to directus
 */

import "@std/dotenv/load";
import { pool as conn } from "../lib/db.ts";
import { RowDataPacket } from "mysql2";
import { directusClientAdmin } from "../lib/api.ts";
import { createItem, readItems } from "@directus/sdk";

const uploadMapping = async () => {
  const [rows] = await conn.query<
    (RowDataPacket & {
      MAIN_TABLE: string;
      MAPP_QUERY: string;
      MAPP_TABLE_VER: string;
      FIELD_CHECK: string;
    })[]
  >(
    "SELECT * FROM data_hinfo.ranod_mapp_chk where PROGRAM_ID = 1 and MAIN_TABLE LIKE 'f43_%'"
  );
  for (const row of rows) {
    const exitMap = await directusClientAdmin?.request(
      readItems("query_map", {
        filter: {
          target_table: {
            _eq: row.MAIN_TABLE,
          },
        },
      })
    );
    if (exitMap && exitMap.length === 0) {
      await directusClientAdmin?.request(
        createItem("query_map", {
          target_table: row.MAIN_TABLE,
          ou: [
            {
              ou_code5: "09570",
            },
          ],
          query: row.MAPP_QUERY,
          version: row.MAPP_TABLE_VER,
          field_primary_key: row.FIELD_CHECK,
        })
      );
      console.log(exitMap);
    }
  }
  console.log("finish");
};

await uploadMapping();
