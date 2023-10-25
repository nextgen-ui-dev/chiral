import { createOAuth2AuthorizationUrl } from "@lucia-auth/oauth";
import { serializeCookie } from "lucia/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return res.status(405);

  const [url, state] = await createOAuth2AuthorizationUrl(
    "https://linear.app/oauth/authorize",
    {
      clientId: env.LINEAR_CLIENT_ID,
      scope: ["read", "issues:create"],
      redirectUri: env.SERVER_URL + "/api/auth/callback/linear",
    },
  );

  const stateCookie = serializeCookie("linear_oauth_state", state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return res
    .status(302)
    .setHeader("Set-Cookie", stateCookie)
    .setHeader("Location", url.toString())
    .end();
};

export default handler;
