import type { NextApiRequest, NextApiResponse } from "next";

import { auth } from "~/server/auth";

// Relational DB
import { ulid } from "ulid";
import { db } from "~/server/db";
import { documents } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

// Vector DB
import { astra } from "~/server/astra";
import { embeddingModel } from "~/lib/document";

// AI services
import { ChatOpenAILangChain } from "~/server/openai";
import { OpenAIStream, streamToResponse } from "ai";
import type { Message } from "ai/react";
import type { ChatCompletionMessageParam } from "openai/resources";

import { RetrievalQAChain } from "langchain/chains";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Handle request and session
  if (req.method !== "POST") return res.status(405).end();

  const documentId = req.query.documentId! as string;

  const authRequest = auth.handleRequest({ req, res });

  const session = await authRequest.validate();

  if (session === null) return res.status(401).end();

  // Retrieve document based on id
  let documentRes = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.providerDocumentId, documentId),
        eq(documents.workspaceId, session.workspace_id),
        eq(documents.userId, session.user.id),
      ),
    )
    .limit(1);

  if (documentRes.length < 1) {
    documentRes = await db
      .insert(documents)
      .values({
        id: ulid().toString(),
        providerDocumentId: documentId,
        workspaceId: session.workspace_id,
        userId: session.user.id,
      })
      .returning();
  }

  const document = documentRes[0]!;

  // CONVERT LINEAR DOCUMENT INTO ISSUES

  // Initialize AI services
  const model = ChatOpenAILangChain;
  const chain = RetrievalQAChain.fromLLM(model)
  
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
  const backgroundQuestion = "This is a product requirement document. From the document, please retrieve the problem background of the product? The problem background explains why the product should be built.";

  const solutionQuestion = "This is a product requirement document. From the document, please retrieve the solution overview. The solution overview explains how the product should be built and how the user journey is going to be"; 

  const PM_SYSTEM_MESSAGE = "You are an analytical and business-minded product manager";

  const generateIssuesQuestion =  `Based on your answers from A1 and A2, please create a list of product backlog items in the form Issues. Issues are the smallest unit of task that a project team member could pick up. Issues should contain at least 3 fields: Title, Description, and Priority (high/medium/low).`;

  const promptTemplate = (context: string): ChatCompletionMessageParam => {
    return {
      role: "system",
      content: `Your name is Chiral. You are an analytical and business-minded product manager.
      Chiral is a brand new, powerful artificial intelligence helper built to help product and business people in understanding their product documents.
      Chiral is a well-behaved and well-mannered individual.
      Chiral is always friendly, kind, inspiring, and eager to provide clear and analytical responses in understanding the user's product documents.
      Chiral is able to accurately analyze the user's product requirement document and break it down into actionable tasks called Issues.
      Relevant information used to answer the user's question about their documents can be found inside of the CONTEXT BLOCK.
      Chiral will only take into account any information inside the CONTEXT BLOCK below and questions about Chiral.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      Chiral will take into account any CONTEXT BLOCK that is provided in a conversation.
      If what the user is asking is not in the CONTEXT BLOCK, Chiral will say, "I'm sorry, but it seems what you're looking for isn't in the document.".
      If the contents of the CONTEXT BLOCK or context does not provide the answer to the user's question, Chiral will say, "I'm sorry, but it seems what you're looking for isn't in the document." and give the best fit response to the question.
      Chiral will not apologize for previous responses, but instead will indicate new information was gained.
      Chiral will not invent anything that is not drawn directly from the  CONTEXT BLOCK.`,
    }
  }

  // QA_1: Background
  const backgroundEmbedding = new Float32Array(
    await embeddingModel.embedQuery(backgroundQuestion),
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

  const backgroundContext = backgroundDocEmbedResult.rows
    .map((doc) => doc.get("text") as string)
    .join("\n")
    .substring(0, 3000);

  const backgroundPrompt = promptTemplate(backgroundContext);

  // const backgroundResponse = await openai.chat.completions.create({
  //   model: "gpt-3.5-turbo",
  //   temperature: 0.7,
  //   stream: true, 
  //   messages: [
  //     backgroundPrompt
  //   ]
  // });

  // QA_2


  // 2. GENERATION
  
};

export default handler;