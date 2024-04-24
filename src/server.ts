import { Hono } from "hono";
import { AuthCallback, Login } from "./services/auth/login";

import { jwt } from "hono/jwt";
import { cors } from "hono/cors";
import GetDBConnection from "./services/database/db";
import RefreshToken from "./services/auth/refresh-token";

let PORT = Bun.env.PORT || 3000;
let BASE_ROUTE = Bun.env.BASE_ROUTE;
let OAUTH_URL = Bun.env.OAUTH_URL || "";

let app = new Hono().basePath(BASE_ROUTE ?? "/api/v1");

app.use('*', async (c, next) => {
  await cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })(c, await next)
})

app.get(`/auth/discord`, (c) => c.redirect(OAUTH_URL));
app.get(`/auth/discord/callback`, Login);
app.get(`/auth/callback`, AuthCallback);
app.get(`/auth/refresh`, RefreshToken);

app.get(`/test`, jwt({ secret: Bun.env.JWT_SECRET ?? '' }), (c) => c.text("Hello World"));

app.notFound((c) => {
  return c.text(`Not Found: ${c.req.url}`);
});

// GetDBConnection().then((db) => {
//   if (db) {
//     console.log('got db')
//   }
// });

console.log("Server listening on http://localhost:" + PORT);

export default {
  port: PORT,
  fetch: app.fetch,
};
