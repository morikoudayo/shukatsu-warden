import { resetTasks } from "./query.js";
import { getTaskSummaryText } from "../_shared/task-summary.js";

import type { MessageContext } from "../types.js";

export async function handle(context: MessageContext): Promise<void> {
  const count = await resetTasks(context.channelId, context.userId);

  await context.say({
    text: count > 0
      ? `今日のタスクを${count}件リセットしました。\n\n${await getTaskSummaryText(context)}`
      : `リセット対象の今日のタスクはありませんでした。\n\n${await getTaskSummaryText(context)}`,
  });
}
