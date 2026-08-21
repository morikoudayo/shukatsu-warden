import { chatClient } from "../../../chat/client.js";
import { env } from "../../../config/env.js";

import { prompt } from "./prompt.js";

import type { ParsedTask } from "./types.js";

const schema = {
  name: "parsed_tasks",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["tasks"],
    properties: {
      tasks: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "companyName"],
          properties: {
            title: { type: "string" },
            companyName: { type: ["string", "null"] },
          },
        },
      },
    },
  },
} as const;

export async function parse(text: string): Promise<ParsedTask[]> {
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
    return (JSON.parse(content) as { tasks: ParsedTask[] }).tasks;
  } catch {
    throw new Error("Azure OpenAI returned invalid task JSON");
  }
}
