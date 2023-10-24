import { parseCookie } from "lucia/utils";
import {
  validateOAuth2AuthorizationCode,
  OAuthRequestError,
} from "@lucia-auth/oauth";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";

interface LinearAccessTokenRes {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return res.status(405);

  const cookies = parseCookie(req.headers.cookie ?? "");
  const storedState = cookies.linear_oauth_state;
  const state = req.query.state;
  const code = req.query.code;

  // validate state
  if (
    typeof storedState !== "string" ||
    storedState.trim() === "" ||
    typeof state !== "string" ||
    state.trim() === "" ||
    storedState !== state ||
    typeof code !== "string"
  ) {
    return res.status(400).end();
  }

  try {
    const tokenRes =
      await validateOAuth2AuthorizationCode<LinearAccessTokenRes>(
        code,
        "https://api.linear.app/oauth/token",
        {
          clientId: env.LINEAR_CLIENT_ID,
          clientPassword: {
            clientSecret: env.LINEAR_CLIENT_SECRET,
            authenticateWith: "client_secret",
          },
          redirectUri: env.SERVER_URL + "/api/auth/callback/linear", // optional
        },
      );

    console.log(tokenRes);

    return res.status(302).setHeader("Location", "/").end();
  } catch (e) {
    if (e instanceof OAuthRequestError) {
      // invalid code
      return res.status(400).end();
    }

    console.log("Failed to process linear callback:", e);
    return res.status(500).end();
  }
};

export default handler;
