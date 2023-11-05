import { OpenAIStream, streamToResponse } from "ai";
import type { Message } from "ai/react";
import { and, eq } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";
import { embeddingModel } from "~/lib/document";
import { ulid } from "~/lib/ulid";
import { astra } from "~/server/astra";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { documentMessages, documents } from "~/server/db/schema";
import { openai } from "~/server/openai";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).end();

  const documentId = req.query.documentId! as string;

  const authRequest = auth.handleRequest({ req, res });
  const session = await authRequest.validate();
  if (session === null) return res.status(401).end();

  const { messages } = JSON.parse(req.body as string) as {
    messages: Message[] | undefined;
  };

  if (typeof messages === "undefined") return res.status(400).end();

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

  const lastMessage = messages[messages.length - 1]!;

  // Get document context
  const questionEmbedding = new Float32Array(
    await embeddingModel.embedQuery(lastMessage.content),
  );

  const maxTimestampRes = await astra.execute(
    `
  SELECT created_at AS most_recent_created_at
  FROM document_embeddings
  WHERE document_id = ?
  LIMIT 1
  `,
    [document.id],
    { prepare: true },
  );

  const maxTimestamp = maxTimestampRes.rows[0]?.get(
    "most_recent_created_at",
  ) as Date;

  const docEmbeddingRes = await astra.execute(
    `
  SELECT document_id, id, text, created_at, similarity_cosine(embedding, ?) AS similarity
  FROM document_embeddings
  WHERE document_id = ? AND created_at = ?
  ORDER BY embedding ANN OF ? LIMIT 20
  `,
    [questionEmbedding, document.id, maxTimestamp, questionEmbedding],
    { prepare: true },
  );

  const context = docEmbeddingRes.rows
    .map((doc) => doc.get("text") as string)
    .join("\n")
    .substring(0, 3000);

  const prompt = {
    role: "system",
    content: `Your name is Chiral.
Chiral is a brand new, powerful artificial intelligence that will help users in understanding their product documents.
Chiral is a well-behaved and well-mannered individual.
Chiral is always friendly, kind, inspiring, and eager to provide vivid and thoughtful responses to the user about their product documents.
Chiral is able to accurately answer nearly any question the users will ask about their product documents in conversation.
Relevant information used to answer the user's question about their documents can be found inside of the CONTEXT BLOCK.
Chiral will only take into account any information inside the CONTEXT BLOCK below and questions about Chiral.
START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK
Chiral will take into account any CONTEXT BLOCK that is provided in a conversation.
If what the user is asking is not in the CONTEXT BLOCK, Chiral will say, "I'm sorry, but it seems what you're looking for isn't in the document.".
If the contents of the CONTEXT BLOCK or context does not provide the answer to the user's question, Chiral will say, "I'm sorry, but it seems what you're looking for isn't in the document.".
Chiral will not apologize for previous responses, but instead will indicate new information was gained.
Chiral will not invent anything that is not drawn directly from the context AKA CONTEXT BLOCK.`,
  };

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.3,
    stream: true,
    messages: [
      prompt as Message,
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ],
  });

  const stream = OpenAIStream(response, {
    onStart: async () => {
      await db.insert(documentMessages).values({
        id: ulid().toString(),
        documentId: document.id,
        sender: "user",
        text: lastMessage.content,
        createdAt: new Date(Date.now()),
      });
    },
    onCompletion: async (completion: string) => {
      await db
        .insert(documentMessages)
        .values({
          id: ulid().toString(),
          documentId: document.id,
          sender: "system",
          text: completion,
          createdAt: new Date(Date.now()),
        })
        .returning();
    },
  });

  return streamToResponse(stream, res);
};

export default handler;
