// import type { NextApiRequest, NextApiResponse } from "next";

// import { auth } from "~/server/auth";

// // Relational DB
// import { ulid } from "ulid";
// import { db } from "~/server/db";
// import { documents } from "~/server/db/schema";
// import { and, eq } from "drizzle-orm";

// // Vector DB
// import { astra } from "~/server/astra";
// import { cassandraStore } from "../../../server/api/routers/workspace/generator/vectorstores";
// import { embeddingModel } from "~/lib/document";

// // AI services
// import { ChatOpenAILangChain } from "~/server/openai";
// import { OpenAIStream, streamToResponse } from "ai";
// import { RetrievalQAChain } from "langchain/chains";

// import { JsonOutputFunctionsParser } from "langchain/output_parsers";

// // Others
// import * as Questions from "~/server/api/routers/workspace/generator/generatorQuestions";
// import { PromptTemplate } from "langchain/prompts";

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   // Handle request and session
//   if (req.method !== "POST") return res.status(405).end();

//   const documentId = req.query.documentId! as string;

//   const authRequest = auth.handleRequest({ req, res });

//   const session = await authRequest.validate();

//   if (session === null) return res.status(401).end();

//   // Retrieve document based on id
//   let documentRes = await db
//     .select()
//     .from(documents)
//     .where(
//       and(
//         eq(documents.providerDocumentId, documentId),
//         eq(documents.workspaceId, session.workspace_id),
//         eq(documents.userId, session.user.id),
//       ),
//     )
//     .limit(1);

//   if (documentRes.length < 1) {
//     documentRes = await db
//       .insert(documents)
//       .values({
//         id: ulid().toString(),
//         providerDocumentId: documentId,
//         workspaceId: session.workspace_id,
//         userId: session.user.id,
//       })
//       .returning();
//   }

//   const document = documentRes[0]!;

//   try {
//     // CONVERT LINEAR DOCUMENT INTO ISSUES
    
//     // A. RETRIEVAL
//     // Since a document may be embedded multiple times, retrieve the embedding with the latest timestamp 
//     const maxTimestampResult = await astra.execute(
//       // Timestamps are alrdy sorted descending
//       `
//       SELECT created_at AS most_recent_created_at
//       FROM document_embeddings
//       WHERE document_id = ?
//       LIMIT 1
//       `, 
//         [document.id],
//         { prepare: true },
//     );
  
//     const maxTimestamp = maxTimestampResult.rows[0]?.get(
//       "most_recent_created_at",
//     ) as Date;
  
//     // 1. Document Context Retrieval
//     // Create message to initiate embedding retrieval
    
  
//     // QA_1: Background
//     const backgroundEmbedding = new Float32Array(
//       await embeddingModel.embedQuery(Questions.backgroundQuestion),
//     );
  
//     const backgroundDocEmbedResult = await astra.execute(
//       `
//         SELECT document_id, id, text, created_at, similarity_cosine(embedding, ?) AS similarity
//         FROM document_embeddings
//         WHERE document_id = ? AND created_at = ?
//         ORDER BY embedding ANN OF ? LIMIT 20
//       `,
//         [backgroundEmbedding, document.id, maxTimestamp, backgroundEmbedding],
//         { prepare: true },
//     );
  
//     const backgroundContext = backgroundDocEmbedResult.rows
//       .map((doc) => doc.get("text") as string)
//       .join("\n")
//       .substring(0, 3000);
  
//     const backgroundPrompt = Questions.generatePromptTemplate(backgroundContext);
  
//     // Initialize AI services
//     const model = ChatOpenAILangChain;
//     const chain = RetrievalQAChain.fromLLM(model, cassandraStore.asRetriever(), {
//       prompt: PromptTemplate.fromTemplate(Questions.promptTemplate),
//     });
  
//     const response = await chain.call({
//       query: Questions.backgroundQuestion,
//     });
  
//     console.log("response:", response);
  
//     if (response) {
//       console.log("RESPONSE\n", response);
//     //   res.status(200).send({
//     //     status: "success",
//     //     data: response,
//     //   });
//     }
  
//     res.send("error!");
  
//     return "HELLO_WORLD";
//   } catch (err) {
//     console.error(err);
//   }
// };

// export default handler;