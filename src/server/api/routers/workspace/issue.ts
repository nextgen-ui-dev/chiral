import { z } from "zod";
// Relational DB
import { ulid } from "ulid";
import { db } from "~/server/db";
import { documents } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { generatedIssues, generatedIssueDetail } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

// Vector DB
import { astra } from "~/server/astra";
import { cassandraStore } from "./generator/vectorstores";
import { embeddingModel } from "~/lib/document";

// AI services

import { ChatOpenAILangChain } from "~/server/openai";
import { OpenAIStream, streamToResponse } from "ai";
import { LLMChain, RetrievalQAChain } from "langchain/chains";
import {
  PromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { formatDocumentsAsString } from "langchain/util/document";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "langchain/schema/runnable";
import { StringOutputParser } from "langchain/schema/output_parser";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

// Others
import * as Questions from "~/server/api/routers/workspace/generator/generatorQuestions";


export const issueRouter = createTRPCRouter({
  generateIssueRecommendations: protectedProcedure
    .input(z.object({ providerDocumentId: z.string() }))
    .query(async ({ ctx, input: { providerDocumentId } }) => {
      const documentId = providerDocumentId;
      
      // Retrieve document based on id
      let documentRes = await db
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
        documentRes = await db
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

      // CONVERT LINEAR DOCUMENT INTO ISSUES
      // Initialize AI services
      const model = ChatOpenAILangChain;
      const vectorStore = cassandraStore;
      const vectorStoreRetriever = vectorStore.asRetriever();
    
      // A. RETRIEVAL
      // Since a document may be embedded multiple times, retrieve the embedding with the latest timestamp 
      const maxTimestampResult = await astra.execute(
        // Timestamps are alrdy sorted descending
        `
        SELECT created_at AS most_recent_created_at
        FROM document_embeddings
        WHERE document_id = ?
        LIMIT 1
        `, 
          [document.id],
          { prepare: true },
      );
    
      const maxTimestamp = maxTimestampResult.rows[0]?.get(
        "most_recent_created_at",
      ) as Date;
    
      // 1. Document Context Retrieval
      // Create message to initiate embedding retrieval
      
    
      // QA_1: Background
      const backgroundEmbedding = new Float32Array(
        await embeddingModel.embedQuery(Questions.backgroundQuestion),
      );
    
      const backgroundDocEmbedResult = await astra.execute(
        `
          SELECT document_id, id, text, created_at, similarity_cosine(embedding, ?) AS similarity
          FROM document_embeddings
          WHERE document_id = ? AND created_at = ?
          ORDER BY embedding ANN OF ? LIMIT 20
        `,
          [backgroundEmbedding, document.id, maxTimestamp, backgroundEmbedding],
          { prepare: true },
      );
    
      const backgroundContextDoc = backgroundDocEmbedResult.rows
        .map((doc) => doc.get("text") as string)
        .join("\n")
        .substring(0, 3000);

      // Create messageList
      const messages = [
        SystemMessagePromptTemplate.fromTemplate(Questions.condenseQuestionTemplate),
        HumanMessagePromptTemplate.fromTemplate(Questions.answerTemplate),
      ]

      const chatPrompt = ChatPromptTemplate.fromMessages(messages);

      const chain = new LLMChain({
        prompt: chatPrompt,
        llm: model
      });

      const response = await chain.call({
        context: backgroundContextDoc,
        question: Questions.backgroundQuestion
      });

    
      console.log("RESPONSE (trpc)\n", response);
      if (response) {
      }

      return response;
    }),
  
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
