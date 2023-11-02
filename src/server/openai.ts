import { OpenAI } from "openai";
import { env } from "~/env.mjs";

export const openai = new OpenAI({
  organization: env.OPENAI_ORGANIZATION_ID,
  apiKey: env.OPENAI_API_KEY,
});
