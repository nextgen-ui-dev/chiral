import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { documentMessages, documents } from "~/server/db/schema";
import { and, asc, eq, exists } from "drizzle-orm";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { ulid } from "~/lib/ulid";

const markdownSplitter = RecursiveCharacterTextSplitter.fromLanguage(
  "markdown",
  {
    chunkSize: 250,
    chunkOverlap: 0,
  },
);

const embeddingModel = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/bge-large-en-v1.5",
  maxConcurrency: 10,
});

export const documentRouter = createTRPCRouter({
  saveMarkdownEmbeddings: protectedProcedure
    .input(z.object({ markdown: z.string() }))
    .mutation(async ({ ctx, input: { markdown } }) => {
      const documents = await markdownSplitter.createDocuments([markdown]);
      const embeddings = await embeddingModel.embedDocuments(
        documents.map((doc) => doc.pageContent),
      );

      console.log(embeddings[0]);
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
