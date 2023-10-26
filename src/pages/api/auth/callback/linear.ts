import { type User, type Key, LuciaError } from "lucia";
import { parseCookie } from "lucia/utils";
import {
  validateOAuth2AuthorizationCode,
  OAuthRequestError,
} from "@lucia-auth/oauth";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { LinearClient } from "@linear/sdk";
import { ValidAuthProviders, auth } from "~/server/auth";
import { ulid } from "~/lib/ulid";

interface LinearAccessTokenRes {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return res.status(405).end();

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

    const linearClient = new LinearClient({
      accessToken: tokenRes.access_token,
    });

    const viewer = await linearClient.viewer;
    console.log(await linearClient.organization);

    let user: User;
    let linearKey: Key;

    checkKey: try {
      linearKey = await auth.getKey(ValidAuthProviders.LINEAR, viewer.id);
      user = await auth.getUser(linearKey.userId);
    } catch (e: any) {
      if (e instanceof LuciaError) {
        if (e.message === "AUTH_INVALID_KEY_ID") {
          user = await auth.createUser({
            userId: ulid().toString(),
            key: {
              providerId: "linear",
              providerUserId: viewer.id,
              password: null,
            },
            attributes: {
              email: viewer.email,
              name: viewer.name,
              avatar_url: viewer.avatarUrl ?? null,
            },
          });

          break checkKey;
        }
      }

      console.log("Failed to process linear callback:", e);
      return res.status(500).end();
    }

    await auth.invalidateAllUserSessions(user.id);
    const session = await auth.createSession({
      sessionId: ulid(),
      userId: user.id,
      attributes: {
        access_token: tokenRes.access_token,
      },
    });

    const authRequest = auth.handleRequest({ req, res });
    authRequest.setSession(session);

    return res.status(302).setHeader("Location", "/").end();
  } catch (e: any) {
    if (e instanceof OAuthRequestError) {
      // invalid authorization code
      return res.status(400).end();
    }

    console.log("Failed to process linear callback:", e);
    return res.status(500).end();
  }
};

export default handler;
