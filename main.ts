import { Hono } from "@hono";
import { html } from "@hono/html";
import { serveStatic } from "@hono/deno";

const app = new Hono();

// Serve static files
app.use("/assets/*", serveStatic({ root: "./assets" }));

// Main config page
app.get("/", (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Configuration</title>
      </head>
      <body>
        <h1>Configuration Page</h1>
        <form action="/save-config" method="POST">
          <div>
            <label for="setting1">Setting 1:</label>
            <input type="text" id="setting1" name="setting1" />
          </div>
          <div>
            <label for="setting2">Setting 2:</label>
            <input type="text" id="setting2" name="setting2" />
          </div>
          <button type="submit">Save Configuration</button>
        </form>
      </body>
    </html>
  `);
});

// Handle config submission
app.post("/save-config", async (c) => {
  const body = await c.req.parseBody();
  // Here you would typically save the configuration
  console.log("Received config:", body);
  return c.redirect("/");
});

Deno.serve(app.fetch);
export default app;
