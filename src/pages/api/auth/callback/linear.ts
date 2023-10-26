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
import { db } from "~/server/db";
import { users, workspaceProviders, workspaces } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

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
    const linearWorkspace = await linearClient.organization;

    let user: User;
    let linearKey: Key;

    checkKey: try {
      linearKey = await auth.getKey(ValidAuthProviders.LINEAR, viewer.id);
      user = await auth.getUser(linearKey.userId);
    } catch (e: any) {
      if (e instanceof LuciaError) {
        if (e.message === "AUTH_INVALID_KEY_ID") {
          createUserKey: try {
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

            linearKey = await auth.getKey(ValidAuthProviders.LINEAR, viewer.id);
          } catch (e: any) {
            if (typeof e.code === "string" && e.code === "23505") {
              const existingUser = (
                await db
                  .select()
                  .from(users)
                  .where(eq(users.email, viewer.email))
              )[0]!;

              user = await auth.getUser(existingUser.id);

              linearKey = await auth.createKey({
                userId: existingUser.id,
                providerId: ValidAuthProviders.LINEAR,
                providerUserId: viewer.id,
                password: null,
              });

              break createUserKey;
            }

            console.log("Failed to process linear callback:", e);
            return res.status(500).end();
          }

          break checkKey;
        }
      }

      console.log("Failed to process linear callback:", e);
      return res.status(500).end();
    }

    try {
      const res = await db
        .select()
        .from(workspaces)
        .where(
          and(
            eq(workspaces.userId, user.id),
            eq(workspaces.providerId, "linear"),
            eq(workspaces.providerWorkspaceId, linearWorkspace.id),
          ),
        )
        .limit(1);

      if (res.length < 1) {
        await db.insert(workspaces).values({
          providerId: "linear",
          providerWorkspaceId: linearWorkspace.id,
          userId: user.id,
          name: linearWorkspace.name,
        });
      } else {
        await db
          .update(workspaces)
          .set({
            name: linearWorkspace.name,
          })
          .where(
            and(
              eq(workspaces.userId, user.id),
              eq(workspaces.providerId, "linear"),
              eq(workspaces.providerWorkspaceId, linearWorkspace.id),
            ),
          );
      }
    } catch (e: any) {
      console.log("Failed to process linear callback:", e);
      return res.status(500).end();
    }

    await auth.deleteDeadUserSessions(user.id);
    const session = await auth.createSession({
      sessionId: ulid(),
      userId: user.id,
      attributes: {
        access_token: tokenRes.access_token,
        account_id: linearKey.providerId + ":" + linearKey.providerUserId,
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
