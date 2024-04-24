import type { Request, Response } from "express";
import type { Context } from "hono";
import jwt, { type JwtPayload } from "jsonwebtoken";

let CLIENT_ID = Bun.env.CLIENT_ID;
let CLIENT_SECRET = Bun.env.CLIENT_SECRET;
let REDIRECT_URI = Bun.env.REDIRECT_URI;

let JWT_SECRET = Bun.env.JWT_SECRET ?? '';
let REFRESH_SECRET = Bun.env.REFRESH_SECRET ?? '';

let BASE_ROUTE = Bun.env.BASE_ROUTE;

export async function Login(c: Context) {

  let code = c.req.query("code");

  let params = new URLSearchParams();
  params.append("client_id", CLIENT_ID ?? "");
  params.append("client_secret", CLIENT_SECRET ?? "");
  params.append("grant_type", "authorization_code");
  params.append("code", code?.toString() || "");
  params.append("redirect_uri", REDIRECT_URI ?? "");

  try {
    let response = await fetch(`https://discord.com/api/oauth2/token`, {
      method: "POST",
      body: params,
    });

    let responseJson = await response.json();
    if (response.ok) {
      return c.redirect(`${BASE_ROUTE}/auth/callback?token=${responseJson.access_token}&refresh_token=${responseJson.refresh_token}`);
    } else {
      return c.text('Error in discord response')
    }
  } catch (error) {
    return c.text('Error in auth callback')
  }
}

export async function AuthCallback(c: Context) {

  let token = c.req.query("token");
  let refreshToken = c.req.query("refresh_token");

  let jwtToken;
  let jwtRefreshToken;

  try {
    let resp = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    let respData = await resp.json();
    if (resp.ok) {
      console.log('respData', respData)
      let authObject = {
        user: respData,
        discord_token: token,
        discord_refresh_token: refreshToken,
      };

      jwtToken = jwt.sign(authObject, JWT_SECRET, {
        expiresIn: "1hr",
      });
      jwtRefreshToken = jwt.sign(authObject, REFRESH_SECRET, {
        expiresIn: "7d",
      });

      return c.redirect(
        `${Bun.env.AUTH_REDIRECT_BASE_URL}?token=${jwtToken ? encodeURIComponent(jwtToken) : ""}&refreshToken=${jwtRefreshToken ? encodeURIComponent(jwtRefreshToken) : ""}`,
      );
    } else {
      return c.json({ error: "Error in discord response" }, 400);
    }
  } catch (error) {
    return c.json({ error: "Error in auth callback" }, 400);
  }

}

export async function Logout(c: Context) {

  const authHeader = c.req.header.arguments("authorization");
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

export async function RefreshToken(c: Context) {
  const authHeader = c.req.header.arguments("authorization");
  let refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  jwt.verify(
    refreshToken ?? "",
    process.env.REFRESH_SECRET || "",
    (err: any) => {

      if (err) {
        c.json({ error: "Invalid refresh token" }, 403);
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

      return c.json({ token: newToken, refreshToken: newRefreshToken });
    },
  );
}

export default { Login, Logout, AuthCallback, RefreshToken };
