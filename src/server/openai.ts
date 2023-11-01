import { Configuration, OpenAIApi } from "openai-edge";
import { env } from "~/env.mjs";

export const openai = new OpenAIApi(
  new Configuration({
    organization: env.OPENAI_ORGANIZATION_ID,
    apiKey: env.OPENAI_API_KEY,
  }),
);
