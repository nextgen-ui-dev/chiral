import { z } from "zod";
import md5 from "md5";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { documentMessages, documents } from "~/server/db/schema";
import { and, asc, eq, exists } from "drizzle-orm";
import { markdownSplitter, embeddingModel } from "~/lib/document";
import type { TypedArray } from "@xenova/transformers";
import { ulid } from "~/lib/ulid";
import type { Client } from "cassandra-driver";

export const documentRouter = createTRPCRouter({
  saveMarkdownEmbeddings: protectedProcedure
    .input(z.object({ markdown: z.string(), documentId: z.string() }))
    .mutation(async ({ ctx, input: { markdown, documentId } }) => {
      const preppedMarkdown = markdown
        .replaceAll("\r\n", " ")
        .replaceAll("\n", " ");
      const textDocuments = await markdownSplitter.createDocuments([
        preppedMarkdown,
      ]);

      let documentRes = await ctx.db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.providerDocumentId, documentId),
            eq(documents.workspaceId, ctx.session.workspace_id),
            eq(documents.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (documentRes.length < 1) {
        documentRes = await ctx.db
          .insert(documents)
          .values({
            id: ulid().toString(),
            providerDocumentId: documentId,
            workspaceId: ctx.session.workspace_id,
            userId: ctx.session.user.id,
          })
          .returning();
      }

      const document = documentRes[0]!;

      const embeddings = await Promise.all(
        textDocuments.flat().map(async (doc) => ({
          id: md5(doc.pageContent),
          metadata: {
            lineFrom: doc.metadata.loc.lines.from as number,
            lineTo: doc.metadata.loc.lines.to as number,
            text: doc.pageContent,
            documentId: document.id,
          },
          values: await embeddingModel.embedQuery(doc.pageContent),
        })),
      );

      const now = new Date();
      const queries: {
        query: string;
        params: (string | number | TypedArray | Date)[];
      }[] = [];

      for (const embedding of embeddings) {
        queries.push({
          query:
            "INSERT INTO document_embeddings (id, document_id, line_from, line_to, text, embedding, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          params: [
            embedding.id,
            embedding.metadata.documentId,
            embedding.metadata.lineFrom,
            embedding.metadata.lineTo,
            embedding.metadata.text,
            new Float32Array(embedding.values),
            now,
          ],
        });
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const astraClient: Client = ctx.astra as Client;
        await astraClient.batch(queries, { prepare: true });
      } catch (error) {
        console.log(error);
      }
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
