import { chatClient } from "../../../chat/client.js";
import { env } from "../../../config/env.js";

import { prompt } from "./prompt.js";

import type { MessageIntent } from "./types.js";

const schema = {
  name: "message_intent",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["intent"],
    properties: {
      intent: {
        type: "string",
        enum: ["task_add", "task_complete", "task_list", "other"],
      },
    },
  },
} as const;

export async function classify(text: string): Promise<MessageIntent> {
  const completion = await chatClient.chat.completions.create({
    model: env.azureOpenAi.taskModelDeployment,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: text },
    ],
    response_format: { type: "json_schema", json_schema: schema },
  });

  const content = completion.choices[0]?.message.content;

  if (!content) throw new Error("Azure OpenAI returned an empty response");

  try {
    return (JSON.parse(content) as { intent: MessageIntent }).intent;
  } catch {
    throw new Error("Azure OpenAI returned invalid message intent JSON");
  }
}
