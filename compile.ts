const output = `out/powerpcu_export.exe`;

const command = new Deno.Command("deno", {
  args: [
    "compile",
    "-A",
    "--icon",
    "assets/icon.ico",
    "--no-check",
    "--output",
    output,
    "main.ts",
  ],
});
await command.output();
