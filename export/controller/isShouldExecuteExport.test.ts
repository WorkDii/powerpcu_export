import { assertEquals } from "@std/assert";
import { isShouldExecuteExport } from "./isShouldExecuteExport.ts";
import { addHours } from "date-fns";

Deno.test("isExport returns true when no latest execute time", async () => {
  const result = await isShouldExecuteExport(1);
  assertEquals(result, true);
});

Deno.test(
  "isExport returns true when data in file is not a valid date",
  async () => {
    // Write invalid date data
    await Deno.writeTextFile(
      "./export/latest_execute_time.txt",
      "date not valid"
    );

    const result = await isShouldExecuteExport(1);
    assertEquals(result, true);

    // Cleanup
    await Deno.remove("./export/latest_execute_time.txt");
  }
);

Deno.test(
  "isExport returns false when latest execute time more than x hours ago",
  async () => {
    // Mock current time
    const now = new Date();
    await Deno.writeTextFile(
      "./export/latest_execute_time1.txt",
      now.toISOString()
    );

    const result = await isShouldExecuteExport(1);
    assertEquals(result, true);

    // Cleanup
    await Deno.remove("./export/latest_execute_time1.txt");
  }
);

Deno.test(
  "isExport returns true when latest execute time less than x hours ago",
  async () => {
    // Mock old time
    const oldTime = addHours(new Date(), -10);
    await Deno.writeTextFile(
      "./export/latest_execute_time2.txt",
      oldTime.toISOString()
    );

    const result = await isShouldExecuteExport(1);
    assertEquals(result, true);

    // Cleanup
    await Deno.remove("./export/latest_execute_time2.txt");
  }
);
