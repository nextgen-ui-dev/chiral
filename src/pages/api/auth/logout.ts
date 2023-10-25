import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "~/server/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).end();

  const authRequest = auth.handleRequest({ req, res });
  const session = await authRequest.validate();
  if (session === null) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  // make sure to invalidate the current session!
  await auth.invalidateSession(session.sessionId);
  // delete session cookie
  authRequest.setSession(null);
  return res.status(302).setHeader("Location", "/").end();
};

export default handler;
