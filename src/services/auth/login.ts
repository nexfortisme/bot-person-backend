import type { Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

let CLIENT_ID = process.env.CLIENT_ID;
let CLIENT_SECRET = process.env.CLIENT_SECRET;
let REDIRECT_URI = process.env.REDIRECT_URI;

let BASE_ROUTE = process.env.BASE_ROUTE;

export function Login(request: Request, response: Response) {
  let code = request.query["code"];

  let params = new URLSearchParams();
  params.append("client_id", CLIENT_ID ?? "");
  params.append("client_secret", CLIENT_SECRET ?? "");
  params.append("grant_type", "authorization_code");
  params.append("code", code?.toString() || "");
  params.append("redirect_uri", REDIRECT_URI ?? "");

  fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    body: params,
  })
    .then((res) => res.json())
    .then((json) => {
      // token = json.access_token;
      response.redirect(
        BASE_ROUTE +
        "/auth/callback?token=" +
        json.access_token +
        "&refresh_token=" +
        json.refresh_token,
      );
    });
}

export async function AuthCallback(request: Request, response: Response) {
  let token = request.query["token"];
  let refreshToken = request.query["refresh_token"];

  let jwtToken;
  let jwtRefreshToken;

  let resp = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((user) => {
      let authObject = {
        user: user,
        discord_token: token,
        discord_refresh_token: refreshToken,
      };

      jwtToken = jwt.sign(authObject, process.env.JWT_SECRET || "", {
        expiresIn: "1hr",
      });
      jwtRefreshToken = jwt.sign(authObject, process.env.REFRESH_SECRET || "", {
        expiresIn: "7d",
      });
    })
    .catch((error) => console.error(error));

  response.redirect(
    `${process.env.AUTH_REDIRECT_BASE_URL}?token=${jwtToken ? encodeURIComponent(jwtToken) : ""}&refreshToken=${jwtRefreshToken ? encodeURIComponent(jwtRefreshToken) : ""}`,
  );
}

export async function Logout(req: Request, res: Response) {

  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  let params = new URLSearchParams();
  params.append("token", token ?? "");

  fetch(`https://discord.com/api/oauth2/token/revoke`, {
    method: "POST",
    body: params,
  })
    .then((res) => res.json())
    .then((json) => {
      console.log("revoke response", json);
      // token = json.access_token;
      // response.redirect(BASE_ROUTE + "/auth/callback");
    });
}

export function RefreshToken(request: Request, response: Response) {
  const authHeader = request.headers["authorization"];
  let refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  jwt.verify(
    refreshToken ?? "",
    process.env.REFRESH_SECRET || "",
    (err, user) => {

      if (err) {
        response.sendStatus(403);
        return;
      }

      let decodedToken = jwt.decode(refreshToken ?? "", { complete: true });

      let decodedUser = (decodedToken?.payload as JwtPayload)?.user;
      let discordToken = (decodedToken?.payload as JwtPayload)?.discord_token;
      let discordRefreshToken = (decodedToken?.payload as JwtPayload)?.discord_refresh_token;

      let authObject = {
        user: decodedUser,
        discord_token: discordToken,
        discord_refresh_token: discordRefreshToken,
      };

      let newToken = jwt.sign(authObject, process.env.JWT_SECRET || "", {
        expiresIn: "1hr",
      });
      let newRefreshToken = jwt.sign(authObject, process.env.REFRESH_SECRET || "", {
        expiresIn: "7d",
      });

      response.json({ token: newToken, refreshToken: newRefreshToken });
    },
  );
}

export default { Login, Logout, AuthCallback, RefreshToken };
