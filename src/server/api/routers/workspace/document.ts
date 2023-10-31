import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { documentMessages, documents } from "~/server/db/schema";
import { and, asc, eq, exists } from "drizzle-orm";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ulid } from "~/lib/ulid";

const markdownSplitter =
  RecursiveCharacterTextSplitter.fromLanguage("markdown");

export const documentRouter = createTRPCRouter({
  saveMarkdownEmbeddings: protectedProcedure
    .input(z.object({ markdown: z.string() }))
    .mutation(async ({ ctx, input: { markdown } }) => {
      const documents = await markdownSplitter.createDocuments([markdown]);
    }),

  getDocumentMessages: protectedProcedure
    .input(z.object({ providerDocumentId: z.string() }))
    .query(async ({ ctx, input: { providerDocumentId } }) => {
      return await ctx.db
        .select()
        .from(documentMessages)
        .where(
          and(
            exists(
              ctx.db
                .select({ id: documents.id })
                .from(documents)
                .where(
                  and(
                    eq(documents.providerDocumentId, providerDocumentId),
                    eq(documents.workspaceId, ctx.session.workspace_id),
                    eq(documents.userId, ctx.session.user.id),
                    eq(documents.id, documentMessages.documentId),
                  ),
                ),
            ),
          ),
        )
        .orderBy(asc(documentMessages.createdAt));
    }),

  createDocumentMessage: protectedProcedure
    .input(
      z.object({
        providerDocumentId: z.string(),
        text: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { providerDocumentId, text } }) => {
      await ctx.db.transaction(async (tx) => {
        let documentRes = await ctx.db
          .select()
          .from(documents)
          .where(
            and(
              eq(documents.providerDocumentId, providerDocumentId),
              eq(documents.workspaceId, ctx.session.workspace_id),
              eq(documents.userId, ctx.session.user.id),
            ),
          )
          .limit(1);

        if (documentRes.length < 1) {
          documentRes = await tx
            .insert(documents)
            .values({
              id: ulid().toString(),
              providerDocumentId,
              workspaceId: ctx.session.workspace_id,
              userId: ctx.session.user.id,
            })
            .returning();
        }

        const document = documentRes[0]!;

        await tx.insert(documentMessages).values({
          id: ulid().toString(),
          documentId: document.id,
          sender: "user",
          text,
          createdAt: new Date(Date.now()),
        });
      });
    }),
});
