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