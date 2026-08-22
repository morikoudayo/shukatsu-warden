import { randomUUID } from "node:crypto";

import { parse } from "./chat.js";
import { insert } from "./query.js";
import { getTaskSummaryText } from "../_shared/task-summary.js";

import type { MessageContext } from "../types.js";

export async function handle(context: MessageContext): Promise<void> {
  const tasks = await parse(context.text);

  await insert(tasks.map((task) => ({
    id: randomUUID(),
    title: task.title,
    companyName: task.companyName,
    slackChannelId: context.channelId,
    slackMessageTs: context.messageTs,
    slackUserId: context.userId,
  })));

  if (tasks.length === 0) return;

  const newTasks = tasks.map((task) => `・ ${task.title}`).join("\n");
  await context.say({
    text: `新規タスクを追加しました。\n${newTasks}\n\n${await getTaskSummaryText(context)}`,
  });
}
