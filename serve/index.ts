import { Hono } from "@hono";
import { serveStatic } from "@hono/deno";
import { configSchema } from "../lib/schema.ts";
import { saveConfig } from "./saveConfig/index.ts";
import { logger } from "../lib/log.ts";
const app = new Hono();
const configPage = await Deno.readTextFile("./pages/config.html");
import { env } from "../lib/env.ts";

// Serve static files
app.get("/assets/*", serveStatic({ root: "./" }));
// Main config page
app.get("/", async (c) => {
  return c.html(configPage);
});

// Handle config submission
app.post("/save-config", async (c) => {
  try {
    const body = await c.req.formData();
    const config = await configSchema.parseAsync(Object.fromEntries(body));
    await saveConfig(config);
    setTimeout(async () => {
      logger.info("restart powerpcu_export service");
      // call restart poweerpcu_export service
      const process = new Deno.Command("sc", {
        args: ["restart", "powerpcu_export"],
      });
      await process.output();
    }, 1000);
    return c.text(
      "การตั้งค่าถูกบันทึกแล้ว ระบบกำลังรีสตาร์โปรแกรมเพื่ออัปเดตการตั้งค่าใหม่"
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.text(
      "การตั้งค่ามีปัญหา กรุณาลองใหม่อีกครั้ง " + errorMessage,
      500
    );
  }
});

app.get("/get_env", async (c) => {
  return c.json(env);
});

app.get("/logs", async (c) => {
  const logs = await Deno.readTextFile("./logs/combined.log");
  return c.text(logs.split("\n").reverse().join("\n"));
});

Deno.serve({ port: Number(Deno.env.get("PORT")) || 8765 }, app.fetch);
