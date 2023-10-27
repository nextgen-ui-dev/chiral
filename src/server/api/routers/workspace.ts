import { createTRPCRouter, protectedProcedure } from "../trpc";
import { workspaces } from "~/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const workspaceRouter = createTRPCRouter({
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
