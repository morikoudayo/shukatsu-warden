import { AzureOpenAI } from "openai";

import { env } from "../config/env.js";

export const chatClient = new AzureOpenAI({
  endpoint: env.azureOpenAi.endpoint,
  apiVersion: env.azureOpenAi.apiVersion,
  apiKey: env.azureOpenAi.apiKey,
});
