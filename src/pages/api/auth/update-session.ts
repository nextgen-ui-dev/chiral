import { eq } from "drizzle-orm";
import { LuciaError } from "lucia";
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { sessions } from "~/server/db/schema";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).end();

  if (typeof req.body.sessionId !== "string" || req.body.sessionId === "")
    return res.status(401).end();

  if (typeof req.body.workspaceId !== "string" || req.body.workspaceId === "")
    return res.status(401).end();

  const sessionId = req.body.sessionId as string;
  const workspaceId = req.body.workspaceId as string;

  try {
    const authRequest = auth.handleRequest({ req, res });
    await auth.validateSession(sessionId);

    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.workspaceId, workspaceId))
      .limit(1);
    if (result.length < 1) return res.status(401).end();

    const newSession = await auth.validateSession(result[0]!.id);

    authRequest.setSession(newSession);

    return res.status(200).end();
  } catch (e) {
    if (e instanceof LuciaError && e.message === `AUTH_INVALID_SESSION_ID`) {
      // invalid session
      await auth.invalidateSession(sessionId);

      return res.status(302).setHeader("Location", "/").end();
    }

    console.log("Failed to process linear callback:", e);
    return res.status(500).end();
  }
};

export default handler;
