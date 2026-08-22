import { chatClient } from "../../../chat/client.js";
import { env } from "../../../config/env.js";

import { prompt } from "./prompt.js";

import type { TaskCandidate } from "../_shared/open-tasks.js";

const schema = {
  name: "task_cancellation_match",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["taskIds"],
    properties: {
      taskIds: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
} as const;

export async function match(
  text: string,
  candidates: TaskCandidate[],
): Promise<string[]> {
  const completion = await chatClient.chat.completions.create({
    model: env.azureOpenAi.taskModelDeployment,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: JSON.stringify({ text, candidates }) },
    ],
    response_format: { type: "json_schema", json_schema: schema },
  });

  const content = completion.choices[0]?.message.content;

  if (!content) throw new Error("Azure OpenAI returned an empty response");

  try {
    return (JSON.parse(content) as { taskIds: string[] }).taskIds;
  } catch {
    throw new Error("Azure OpenAI returned invalid task cancellation JSON");
  }
}
