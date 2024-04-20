import "dotenv/config";
import express from "express";
import { Login, AuthCallback } from "./services/auth/login";
import authenticateToken from "./middlewear/auth-middlewear";
import bodyParser from "body-parser";
import cors from "cors";

require("dotenv").config();

let app = express();
let PORT = process.env.PORT || 3000;
let BASE_ROUTE = process.env.BASE_ROUTE || "/api/v1";
let OAUTH_URL = process.env.OAUTH_URL || "";

const corsOptions = { origin: "http://localhost:5173", credentials: true };

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.get(BASE_ROUTE + "/auth/discord", (req, res) => { res.redirect(OAUTH_URL); });
app.get(BASE_ROUTE + "/auth/discord/callback", Login);
app.get(BASE_ROUTE + "/auth/callback", AuthCallback);

app.get(BASE_ROUTE + "/test", authenticateToken, (req, res) => { res.send("Hello World"); });

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
