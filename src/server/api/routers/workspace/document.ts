import { z } from "zod";
import md5 from "md5";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { documentMessages, documents } from "~/server/db/schema";
import { and, asc, eq, exists } from "drizzle-orm";
import { markdownSplitter, embeddingModel } from "~/lib/document";

export const documentRouter = createTRPCRouter({
  saveMarkdownEmbeddings: protectedProcedure
    .input(z.object({ markdown: z.string(), documentId: z.string() }))
    .mutation(async ({ ctx, input: { markdown, documentId } }) => {
      const preppedMarkdown = markdown
        .replaceAll("\r\n", " ")
        .replaceAll("\n", " ");
      const documents = await markdownSplitter.createDocuments([
        preppedMarkdown,
      ]);
      const embeddings = await Promise.all(
        documents.flat().map(async (doc) => ({
          id: md5(doc.pageContent),
          metadata: {
            lineFrom: doc.metadata.loc.lines.from as number,
            lineTo: doc.metadata.loc.lines.to as number,
            text: doc.pageContent,
            documentId,
          },
          values: await embeddingModel.embedQuery(doc.pageContent),
        })),
      );

      const documentIndex = ctx.pinecone.Index("documents");
      await documentIndex.upsert(embeddings);
    }),

  getDocumentMessages: protectedProcedure
    .input(z.object({ providerDocumentId: z.string() }))
    .query(async ({ ctx, input: { providerDocumentId } }) => {
      return await ctx.db
        .select()
        .from(documentMessages)
        .where(
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
        )
        .orderBy(asc(documentMessages.createdAt));
    }),
});
