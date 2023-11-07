/* eslint-disable prefer-const */
import { z } from "zod";
// Relational DB
import { ulid } from "ulid";
import { db } from "~/server/db";
import { documents } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
// import { 
//   sessions, users, workspaces,

//   generatedIssues, generatedIssueDetail 
// } from "~/server/db/schema";

// import { TRPCError } from "@trpc/server";

// Vector DB
import { astra } from "~/server/astra";
import { embeddingModel } from "~/lib/document";

// AI services

import { ChatOpenAILangChain } from "~/server/openai";
import { 
  LLMChain, 
  // RetrievalQAChain 
} from "langchain/chains";
import {
  // PromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import type { ChainValues } from "langchain/dist/schema";

// Others
import * as Questions from "~/server/api/routers/workspace/generator/generatorQuestions";
// import { api } from "~/utils/api";
import { getIssuePriorityLevel } from "~/modules/workspace/issue-generator/IssuesList";


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
      // const vectorStore = cassandraStore;
      // const vectorStoreRetriever = vectorStore.asRetriever();

      const memory: { background: string, solutionOverview: string } = {
        background: "",
        solutionOverview: ""
      };
    
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
      
      console.log(document.id);
      console.log("maxTimestampResult", maxTimestampResult);
      console.log("maxTimestamp", maxTimestamp);
    
      // 1. Document Context Retrieval
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

      // Init response var
      let response: ChainValues;

      // Store `background` answer in memory
      response = await chain.call({
        context: backgroundContextDoc,
        question: Questions.backgroundQuestion
      });

      memory.background = response.text as string;

      // Store `solution overview` answer in memory
      response = await chain.call({
        context: `
          ${backgroundContextDoc}\n
          Problem background: ${memory.background}\n
          Solution overview: ${memory.solutionOverview}`,
        question: Questions.solutionQuestion
      }); 

      memory.solutionOverview = response.text as string;

      // Get the final Issues recommendations
      const finalResponse: ChainValues = await chain.call({
        context: `
          ${backgroundContextDoc}\n
          Problem background: ${memory.background}\n
          Solution overview: ${memory.solutionOverview}`,
        question: Questions.condenseQuestionTemplate
      }); 

      // Store to db
      // TODO

      let result;
      result = finalResponse.text as string;
      result = JSON.parse(result) as JSON;

      return result;
    }),
  
  exportGeneratedIssue: protectedProcedure
    .input(
      z.object({
        // providerIssueId: z.string(),
        
        teamId: z.string(),
        // TODO for now add issue to speed up dev
        issue: z.object({
          title: z.string(),
          description: z.string(),
          priority: z.string()
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.linearClient?.createIssue({
        teamId: input.teamId,
        title: input.issue.title,
        description: input.issue.description,
        priority: getIssuePriorityLevel(input.issue.priority),
      });

      // NOTE - DONT DELETE - for now gausah query dari db dulu. Lgsg terima suggestions dari LLM
      // await ctx.db.transaction(async (tx) => {
      //   const issueMetadataRes = await tx
      //     .select()
      //     .from(generatedIssues)
      //     .where(eq(generatedIssues.id, input.issueId))
      //     .limit(1);

      //   if (issueMetadataRes.length < 1) {
      //     throw new TRPCError({
      //       code: "NOT_FOUND",
      //       message: "Issue Metadata not found",
      //     });
      //   }

      //   const issueMetadata = issueMetadataRes[0];

      //   const issueDetailRes = await tx
      //     .select()
      //     .from(generatedIssueDetail)
      //     .where(eq(generatedIssueDetail.issueId, input.issueId))
      //     .limit(1);

      //   if (issueDetailRes.length < 1) {
      //     throw new TRPCError({
      //       code: "NOT_FOUND",
      //       message: "Issue not found",
      //     });
      //   }

      //   const issueDetail = issueDetailRes[0];

        // await ctx.linearClient?.createIssue({
        //   teamId: issueMetadata?.teamId ?? "",
        //   title: issueDetail?.title,
        //   description: issueDetail?.description,
        //   priority: issueDetail?.priority,
        // });
      // });
    }),
});
