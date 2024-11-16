import { Hono } from "@hono";
import { serveStatic } from "@hono/deno";
import { configSchema } from "./saveConfig/schema.ts";
import { saveConfig } from "./saveConfig/index.ts";
const app = new Hono();

// Serve static files
app.get("/assets/*", serveStatic({ root: "./" }));
// Main config page
app.get("/", async (c) => {
  return c.html(await Deno.readTextFile("./serve/pages/config.html"));
});

// Handle config submission
app.post("/save-config", async (c) => {
  try {
    const body = await c.req.formData();
    const config = await configSchema.parseAsync(Object.fromEntries(body));
    await saveConfig(config);
    return c.text("การตั้งค่าถูกบันทึกแล้ว");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.text(
      "การตั้งค่ามีปัญหา กรุณาลองใหม่อีกครั้ง " + errorMessage,
      500
    );
  }
});

app.get("/get_env", async (c) => {
  const env = await Deno.readTextFile("./.env");
  const envs = env.split("\n").map((line) => line.split("="));
  return c.json(Object.fromEntries(envs));
});

Deno.serve(app.fetch);
