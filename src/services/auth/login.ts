import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

let CLIENT_ID = process.env.CLIENT_ID;
let CLIENT_SECRET = process.env.CLIENT_SECRET;
let REDIRECT_URI = process.env.REDIRECT_URI;

let BASE_ROUTE = process.env.BASE_ROUTE;

let token: string;

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
      token = json.access_token;
      response.redirect(BASE_ROUTE + "/auth/callback");
    });
}

export async function AuthCallback(request: Request, response: Response) {
  let jwtToken;
  let resp = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((user) => {
      let authObject = {
        user: user,
        token: token,
      };

      jwtToken = jwt.sign(authObject, process.env.JWT_SECRET || "", {
        expiresIn: "1hr",
      });
    })
    .catch((error) => console.error(error));

  response.redirect(
    `${process.env.AUTH_REDIRECT_BASE_URL}?token=${
      jwtToken ? encodeURIComponent(jwtToken) : ""
    }`
  );
}

export async function Logout(req: Request, res: Response) {
  let params = new URLSearchParams();
  params.append("token", token);

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

export default { Login, Logout, AuthCallback };
