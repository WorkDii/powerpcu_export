import "@std/dotenv/load";
import { emptyDir, exists, copy, walk } from "@std/fs";
import { parse } from "@std/path";

if (await exists("./out")) {
  await emptyDir("./out");
}
await copy("./pages", "./out/pages");
await copy("./assets", "./out/assets");
await copy("./License.md", "./out/License.md");

if (await exists("./build_program")) {
  for await (const entry of walk("./build_program")) {
    if (entry.isFile) {
      const p = parse(entry.path);
      await copy(entry.path, `./out/${p.base}`);
    }
  }
}

await Deno.writeTextFile(
  "./out/version.txt",
  `
  Version: ${Deno.env.get("VERSION")}
  Build Time: ${new Date().toLocaleString()}
  Build By: ${JSON.stringify(Deno.build)}
  `
);
