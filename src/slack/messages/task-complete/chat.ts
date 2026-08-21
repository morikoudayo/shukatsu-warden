import { chatClient } from "../../../chat/client.js";
import { env } from "../../../config/env.js";

import { prompt } from "./prompt.js";

import type { TaskCandidate } from "./types.js";

const schema = {
  name: "task_completion_match",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["taskId"],
    properties: { taskId: { type: ["string", "null"] } },
  },
} as const;

export async function match(
  text: string,
  candidates: TaskCandidate[],
): Promise<string | null> {
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
    return (JSON.parse(content) as { taskId: string | null }).taskId;
  } catch {
    throw new Error("Azure OpenAI returned invalid task completion JSON");
  }
}
