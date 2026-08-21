import { getTasks } from "../task-list/query.js";

import type { MessageContext } from "../types.js";
import type { TaskListItem } from "../task-list/types.js";

function format(tasks: TaskListItem[]): string {
  if (tasks.length === 0) return "今日のタスクはありません。";

  const list = tasks.map((task) => {
    if (task.status === "done") return `${task.title} ✅`;
    if (task.status === "cancelled") return `~${task.title}~`;
    return task.title;
  }).join("\n");

  return `今日のタスクです。\n${list}`;
}

export async function getTaskSummaryText(context: MessageContext): Promise<string> {
  return format(await getTasks(context.channelId, context.userId));
}
