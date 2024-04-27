import { Hono } from "hono";
import { AuthCallback, Login } from "./login";
import RefreshToken from "./refresh-token";

const app = new Hono();
const OAUTH_URL = Bun.env.OAUTH_URL || "";

app.get(`/discord`, (c) => c.redirect(OAUTH_URL));
app.get(`/discord/callback`, Login);
app.get(`/callback`, AuthCallback);
app.get(`/refresh`, RefreshToken);

export default app;