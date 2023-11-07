import { OpenAI } from "openai";
import { OpenAI as LangChainOpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { env } from "~/env.mjs";

export const openai = new OpenAI({
  organization: env.OPENAI_ORGANIZATION_ID,
  apiKey: env.OPENAI_API_KEY,
});

export const OpenAILangChain = new LangChainOpenAI({
  modelName: "gpt-3.5-turbo",
  openAIApiKey: env.OPENAI_API_KEY,
  temperature: 0.7,
});

export const ChatOpenAILangChain = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-16k",
  openAIApiKey: env.OPENAI_API_KEY,
  temperature: 0.7,
});