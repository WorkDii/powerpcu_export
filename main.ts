import { Hono } from "@hono";
import { serveStatic } from "@hono/deno";
const app = new Hono();

// Serve static files
app.get("/assets/*", serveStatic({ root: "." }));
// Main config page
app.get("/", async (c) => {
  return c.html(await Deno.readTextFile("./pages/config.html"));
});

// Handle config submission
app.post("/save-config", async (c) => {
  const body = await c.req.formData();
  console.log(body);
  return c.text("ok");
  // Here you would typically save the configuration
  // console.log("Received config:", body);
  // return c.redirect("/");
});

Deno.serve(app.fetch);
export default app;
