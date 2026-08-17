import { AzureOpenAI } from "openai";
import { env } from "../../config/env.js";
import type { ParsedTasks } from "./task.types.js";

const client = new AzureOpenAI({
  apiKey: env.azureOpenAi.apiKey,
  endpoint: env.azureOpenAi.endpoint,
  apiVersion: env.azureOpenAi.apiVersion,
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

const systemPrompt = `
あなたは、ユーザーが書いた自由形式の就活メモを
「今日のタスク一覧」に変換するパーサーです。

# 目的

入力から、今日実行するタスクだけを抽出し、
指定されたJSON形式で返してください。

# 出力ルール

- 今日実行すると明示されている、または文脈から明確に読み取れるタスクだけを抽出する
- 「今週中」「近日」「後で」など、今日に限定できない表現はタスクにしない
- 入力にない情報は憶測で追加しない
- 指定JSON以外の文章、Markdown、説明は出力しない

- titleは入力の表現をできるだけ維持する。企業名を含む場合も削らない
- titleは実行可能な行動として表現する
- companyNameには特定できる企業名を1社だけ設定し、不明ならnullにする
- annotationには、期限・条件・注意点・判断理由・参照情報を入れる。なければ空文字列にする

- 親子構造は最大2階層（親タスク → 子タスク）までとする
- ユーザーのチャットから、作業の包含関係または明確な親子関係が読み取れる場合のみ親タスクを作る
- 親子関係が明確でない場合は、親タスクを推測して作らず、それぞれを独立したタスクとして扱う
- 子タスクへ分ける必要がない場合、親タスクだけを作る
- 同じ作業を複数企業に対して行う場合、企業ごとに別のタスクを作る
- 子に複数企業がある親のcompanyNameはnullにする
- 子のcompanyNameが1社だけなら、親にも同じcompanyNameを設定する

- tasksは入力文に現れる順序を維持する
- positionは0から始まる重複しない連番にする
- 親タスクのparentPositionはnull、子タスクは親のpositionを指定する
`.trim();

export async function parseTasksFromText(
  text: string,
): Promise<ParsedTasks> {
  const completion = await client.chat.completions.create({
    model: env.azureOpenAi.taskModelDeployment,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: systemPrompt,
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