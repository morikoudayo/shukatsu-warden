import { AzureOpenAI } from "openai";
import { env } from "../../config/env.js";
import type { ParsedTasks } from "./task.types.js";
import { taskParserPrompt } from "../../prompts/task-parser.js";

const client = new AzureOpenAI({
  endpoint: env.azureOpenAi.endpoint,
  apiVersion: env.azureOpenAi.apiVersion,
  apiKey: env.azureOpenAi.apiKey
});

const parsedTasksSchema = {
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
          required: [
            "position",
            "parentPosition",
            "title",
            "companyName",
            "annotation",
          ],
          properties: {
            position: {
              type: "integer",
              minimum: 0,
            },
            parentPosition: {
              type: ["integer", "null"],
              minimum: 0,
            },
            title: {
              type: "string",
            },
            companyName: {
              type: ["string", "null"],
            },
            annotation: {
              type: "string",
            },
          },
        },
      },
    },
  },
} as const;

export async function parseTasks(
  text: string,
): Promise<ParsedTasks> {
  const completion = await client.chat.completions.create({
    model: env.azureOpenAi.taskModelDeployment,
    messages: [
      {
        role: "system",
        content: taskParserPrompt,
      },
      {
        role: "user",
        content: text,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: parsedTasksSchema,
    },
  });

  const content = completion.choices[0]?.message.content;

  if (!content) {
    throw new Error("Azure OpenAI returned an empty response");
  }

  try {
    return JSON.parse(content) as ParsedTasks;
  } catch {
    throw new Error("Azure OpenAI returned invalid task JSON");
  }
}