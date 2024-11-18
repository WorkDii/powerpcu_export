import { createTableData } from "./controller/creataTableData.ts";
import { createTableSync } from "./controller/creataTableSync.ts";
import { isShouldExecuteExport } from "./controller/isShouldExecuteExport.ts";
import { getOu } from "./controller/ou.ts";
import { uploadData } from "./controller/uploadData/index.ts";

// Deno.cron("export data every hour", "* * * * *", async () => {
try {
  const ou = await getOu();
  const { export_every_hours, query_map } = ou;
  if (await isShouldExecuteExport(export_every_hours)) {
    console.time("export data");
    for (const queryMap of query_map) {
      console.time(`export data ${queryMap.query_map_id.target_table}`);
      await createTableData(queryMap.query_map_id);
      await createTableSync(queryMap.query_map_id);
      await uploadData(queryMap.query_map_id);
    }
    console.timeEnd("export data");
  }
} catch (error) {
  console.error(error);
}
