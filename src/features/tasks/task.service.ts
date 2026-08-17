import { randomUUID } from "node:crypto";

import type {
  ParsedTasks,
  TaskInsert,
} from "./task.types.js";

export function createTaskInserts(
  parsedTasks: ParsedTasks,
  slackChannelId: string,
  slackMessageTs: string,
  slackUserId: string,
): TaskInsert[] {

  return parsedTasks.tasks.map((task) => {
    return {
      id: randomUUID(),

      title: task.title,
      companyName: task.companyName,

      slackChannelId: slackChannelId,
      slackMessageTs: slackMessageTs,
      slackUserId: slackUserId,
    };
  });
}

export function formatTasks(parsedTasks: ParsedTasks): string {
  return parsedTasks.tasks
    .map((task) => `• ${task.title}`)
    .join("\n");
}
