import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { cors } from "hono/cors";

import authRoutes from "./services/auth/auth-routes";

let PORT = Bun.env.PORT || 3000;
let BASE_ROUTE = Bun.env.BASE_ROUTE;
let OAUTH_URL = Bun.env.OAUTH_URL || "";

let app = new Hono().basePath(BASE_ROUTE ?? "/api/v1");

/* Middleware to prevent cors errors*/
app.use("*", async (c, next) => {
  await cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    allowMethods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
    credentials: true,
  })(c, next);
});

app.use("*", async (c, next) => {
});

/* Routes */
app.route('/auth', authRoutes);

/* Test Route for jwt middleware */
app.get(`/test`, jwt({ secret: Bun.env.JWT_SECRET ?? "" }), (c) =>
  c.text("Hello World"),
);

app.notFound((c) => {
  return c.text(`Not Found: ${c.req.url}`);
});

console.log("Server listening on http://localhost:" + PORT);

export default {
  port: PORT,
  fetch: app.fetch,
};
