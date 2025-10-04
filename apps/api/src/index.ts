import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./routes/auth.js";
import { corsMiddleware } from "./middleware.js";
import { userRoutes } from "./routes/users.js";
import { fileRoutes } from "./routes/files.js";
import folderRoutes from "./routes/folders.js";

const app = new Hono();

app.use("*", corsMiddleware);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/auth", auth);
app.route("/users", userRoutes);
app.route("/files", fileRoutes);
app.route("/folders", folderRoutes);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
