import { logger } from "../lib/log.ts";
import { createTableData } from "./controller/createTableData.ts";
import { createTableSync } from "./controller/createTableSync.ts";
import { isShouldExecuteExport } from "./controller/isShouldExecuteExport.ts";
import { getOu } from "./controller/ou.ts";
import { uploadData } from "./controller/uploadData/index.ts";

// Deno.cron("export data every hour", "*/1 * * * *", async () => {
try {
  const ou = await getOu();
  if (!ou) {
    logger.error("ou not found");
  } else {
    const { export_every_hours, query_map } = ou;
    if (await isShouldExecuteExport(export_every_hours)) {
      logger.info("start export data");
      for (const [index, queryMap] of query_map.entries()) {
        if (!queryMap.query_map_id) continue;
        logger.info(
          `[${index + 1}/${query_map.length}] start export table ${
            queryMap.query_map_id.target_table
          }`
        );
        await createTableData(queryMap.query_map_id);
        await createTableSync(queryMap.query_map_id);
        await uploadData(queryMap.query_map_id);
      }
    }
  }
} catch (error) {
  logger.error(error);
} finally {
  logger.info("end export all tables");
}
// });
