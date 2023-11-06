import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { generatedIssues, generatedIssueDetail } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const issueRouter = createTRPCRouter({
  exportGeneratedIssue: protectedProcedure
    .input(
      z.object({
        providerIssueId: z.string(),
        issueId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        const issueMetadataRes = await tx
          .select()
          .from(generatedIssues)
          .where(eq(generatedIssues.id, input.issueId))
          .limit(1);

        if (issueMetadataRes.length < 1) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Issue Metadata not found",
          });
        }

        const issueMetadata = issueMetadataRes[0];

        const issueDetailRes = await tx
          .select()
          .from(generatedIssueDetail)
          .where(eq(generatedIssueDetail.issueId, input.issueId))
          .limit(1);

        if (issueDetailRes.length < 1) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Issue not found",
          });
        }

        const issueDetail = issueDetailRes[0];

        await ctx.linearClient?.createIssue({
          teamId: issueMetadata?.teamId ?? "",
          title: issueDetail?.title,
          description: issueDetail?.description,
          priority: issueDetail?.priority,
        });
      });
    }),
});

// let genIssueMetadataResult = await ctx.db
//   .select()
//   .from(generatedIssues)
//   .where(
//     and(
//       eq(generatedIssues.providerIssueId, input.providerIssueId),
//       eq(generatedIssues.workspaceId, ctx.session.workspace_id),
//       eq(generatedIssues.userId, ctx.session.user.id),
//       eq(generatedIssues.teamId, input.teamId)
//     ),
//   )
//   .limit(1);

// if (genIssueMetadataResult.length < 1) {
//   genIssueMetadataResult = await tx
//     .insert(generatedIssues)
//     .values({
//       id: ulid().toString(),
//       providerIssueId: input.providerIssueId,
//       workspaceId: ctx.session.workspace_id,
//       userId: ctx.session.user.id,
//       teamId: input.teamId
//     })
//     .returning();

//   const issueMeta = genIssueMetadataResult[0]!;
