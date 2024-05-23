import type { Context } from "hono";
import jwt, { type JwtPayload } from "jsonwebtoken";

async function RefreshToken(c: Context) {

  console.log('refresh token', c.req.header("Refresh"));

  const authHeader = c.req.header("Refresh");
  let refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  try {
    jwt.verify(
      refreshToken ?? "",
      process.env.REFRESH_SECRET || "",
      (err: any) => {
        if (err) {
          return c.json({ error: "Invalid refresh token" }, 403);
        }

        let decodedToken = jwt.decode(refreshToken ?? "", { complete: true });

        let decodedUser = (decodedToken?.payload as JwtPayload)?.user;
        let discordToken = (decodedToken?.payload as JwtPayload)?.discord_token;
        let discordRefreshToken = (decodedToken?.payload as JwtPayload)
          ?.discord_refresh_token;

        let authObject = {
          user: decodedUser,
          discord_token: discordToken, // Don't really need to worry about discord token because the ttl is 7 days
          discord_refresh_token: discordRefreshToken,
        };

        let newToken = jwt.sign(authObject, process.env.JWT_SECRET || "", {
          expiresIn: "1hr",
        });
        let newRefreshToken = jwt.sign(
          authObject,
          process.env.REFRESH_SECRET || "",
          {
            expiresIn: "7d",
          },
        );

        // return c.json({ token: newToken, refreshToken: newRefreshToken });
        return c.json({ token: newToken, refreshToken: newRefreshToken });
      },
    );
  } catch (error) {
    return c.json({ error: "Error token verification" }, 400);
  }
}

export default RefreshToken;
