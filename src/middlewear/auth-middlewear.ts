import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export default function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET ?? "", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function RefreshToken(refreshToken: string) {
  let params = new URLSearchParams();
  params.append("client_id", process.env.CLIENT_ID ?? "");
  params.append("client_secret", process.env.CLIENT_SECRET ?? "");
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken || "");
  // params.append("redirect_uri", process.env.REDIRECT_URI ?? "");

  fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((res) => res.json())
    .then((json) => {
      console.log("refresh token resp", json);
      // token = json.access_token;
      // response.redirect(
      //   BASE_ROUTE +
      //     "/auth/callback?token=" +
      //     json.access_token +
      //     "&refresh_token=" +
      //     json.refresh_token,
      // );
    });
}
