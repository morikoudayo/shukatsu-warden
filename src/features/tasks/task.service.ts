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
  const idByPosition = new Map<number, string>();

  for (const task of parsedTasks.tasks) {
    if (idByPosition.has(task.position)) {
      throw new Error(`Duplicate task position: ${task.position}`);
    }

    idByPosition.set(task.position, randomUUID());
  }

  return parsedTasks.tasks.map((task) => {
    const id = idByPosition.get(task.position);

    if (!id) {
      throw new Error(`Task ID not found: ${task.position}`);
    }

    const parentTaskId =
      task.parentPosition === null
        ? null
        : idByPosition.get(task.parentPosition);

    if (task.parentPosition !== null && parentTaskId === undefined) {
      throw new Error(
        `Parent task position not found: ${task.parentPosition}`,
      );
    }

    return {
      id,
      parentTaskId: parentTaskId ?? null,

      position: task.position,
      title: task.title,
      companyName: task.companyName,
      annotation: task.annotation,

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
  const prefix = task.parentPosition === null ? "•" : "  -";

  const companyName =
    task.companyName === null
      ? ""
      : `（${task.companyName}）`;

  const annotation =
    task.annotation === ""
      ? ""
      : ` — ${task.annotation}`;

  return `${prefix} ${task.title}${companyName}${annotation}`;
}

export function formatTasks(parsedTasks: ParsedTasks): string {
  return parsedTasks.tasks
    .map(formatTask)
    .join("\n");
}