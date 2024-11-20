import "@std/dotenv/load";
import { emptyDir, exists, copy } from "@std/fs";
if (await exists("./out")) {
  await emptyDir("./out");
}
await copy("./pages", "./out/pages");
await copy("./assets", "./out/assets");
await Deno.writeTextFile(
  "./out/version.txt",
  `
  Version: ${Deno.env.get("VERSION")}
  Build Time: ${new Date().toLocaleString()}
  Build By: ${JSON.stringify(Deno.build)}
  `
);
