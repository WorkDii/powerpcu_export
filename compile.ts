const output = `out/powerpcu_export.exe`;

const command = new Deno.Command("deno", {
  args: [
    "compile",
    "-A",
    "--icon",
    "assets/icon.ico",
    "--env-file=.env.private",
    "--no-check",
    "--output",
    output,
    "main.ts",
  ],
});
await command.output();
