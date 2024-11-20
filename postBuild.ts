import JSZip from "npm:jszip";
import { walk } from "@std/fs";

const zip = new JSZip();

for await (const entry of walk("out")) {
  if (entry.isFile) {
    const content = await Deno.readFile(entry.path);
    zip.file(entry.path.replace(/out[\/\\]/, ""), content);
  }
}

// Generate zip file
const zipContent = await zip.generateAsync({ type: "uint8array" });
await Deno.writeFile("out/powerpcu_export.zip", zipContent);
