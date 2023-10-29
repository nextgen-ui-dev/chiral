import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { sessions, userAccounts, users, workspaces } from "~/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { linearRouter } from "./linear";
import { documentRouter } from "./document";

export const workspaceRouter = createTRPCRouter({
  document: documentRouter,
  linear: linearRouter,
  getWorkspaceSessions: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(workspaces)
      .innerJoin(userAccounts, eq(userAccounts.id, workspaces.accountId))
      .innerJoin(users, eq(users.id, userAccounts.userId))
      .leftJoin(sessions, eq(sessions.accountId, userAccounts.id))
      .where(eq(users.id, ctx.session.user_id));
  }),
  getCurrentWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = ctx.session.workspace_id;
    const args = workspaceId.split(":");
    if (args.length !== 2) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });
    }

    const res = await ctx.db
      .select()
      .from(workspaces)
      .where(
        and(
          sql`${workspaces.providerId} = ${args[0]}`,
          eq(workspaces.providerWorkspaceId, args[1]!),
          eq(workspaces.accountId, ctx.session.account_id),
        ),
      )
      .limit(1);

    if (res.length < 1) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });
    }

    return res[0]!;
  }),
});
