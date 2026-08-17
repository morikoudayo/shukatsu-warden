import { randomUUID } from "node:crypto";

import { parseTasks } from "./task.parser.js";
import { insertTasks } from "./task.repository.js";

import type {
  ParsedTask,
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
      priority: task.priority,
      companyName: task.companyName,

      slackChannelId: slackChannelId,
      slackMessageTs: slackMessageTs,
      slackUserId: slackUserId,
    };
  });
}

export async function createTasksFromMessage(
  text: string,
  slackChannelId: string,
  slackMessageTs: string,
  slackUserId: string,
): Promise<ParsedTasks> {
  const parsedTasks = await parseTasks(text);

  const taskInserts = createTaskInserts(
    parsedTasks,
    slackChannelId,
    slackMessageTs,
    slackUserId,
  );

  await insertTasks(taskInserts);

  return parsedTasks;
}

function formatTask(task: ParsedTask): string {
  return `• ${task.title}`;
}

export function formatTasks(parsedTasks: ParsedTasks): string {
  return parsedTasks.tasks
    .map(formatTask)
    .join("\n");
}