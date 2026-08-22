import { chatClient } from "../../../chat/client.js";
import { env } from "../../../config/env.js";

import { prompt } from "./prompt.js";

import type { MessageIntent } from "./types.js";

const VALID_INTENTS: readonly MessageIntent[] = ["task_add", "task_complete", "task_cancel", "task_reset", "task_list", "other"];

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
        enum: ["task_add", "task_complete", "task_cancel", "task_reset", "task_list", "other"],
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Azure OpenAI returned invalid message intent JSON");
  }

  const intent = (parsed as { intent?: unknown }).intent;

  if (typeof intent !== "string" || !VALID_INTENTS.includes(intent as MessageIntent)) {
    throw new Error(`Azure OpenAI returned an unknown message intent: ${JSON.stringify(intent)}`);
  }

  return intent as MessageIntent;
}
