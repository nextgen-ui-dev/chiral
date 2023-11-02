import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const markdownSplitter = RecursiveCharacterTextSplitter.fromLanguage(
  "markdown",
  {
    chunkSize: 250,
    chunkOverlap: 0,
  },
);

export const embeddingModel = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/bge-large-en-v1.5",
  maxConcurrency: 10,
});
