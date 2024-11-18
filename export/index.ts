import { createTableData } from "./controller/creataTableData.ts";
import { createTableSync } from "./controller/creataTableSync.ts";
import { isShouldExecuteExport } from "./controller/isShouldExecuteExport.ts";
import { getOu } from "./controller/ou.ts";
import { uploadData } from "./controller/uploadData/index.ts";

// Deno.cron("export data every hour", "* * * * *", async () => {
const ou = await getOu();
const { export_every_hours, query_map } = ou;
if (await isShouldExecuteExport(export_every_hours)) {
  await createTableData(query_map[0].query_map_id);
  await createTableSync(query_map[0].query_map_id);
  await uploadData(query_map[0].query_map_id);
}
