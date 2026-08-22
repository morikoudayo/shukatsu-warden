import { match } from "./chat.js";
import { complete } from "./query.js";
import { getOpenTasks } from "../_shared/open-tasks.js";
import { getTaskSummaryText } from "../_shared/task-summary.js";

import type { MessageContext } from "../types.js";

export async function handle(context: MessageContext): Promise<void> {
  const candidates = await getOpenTasks(context.channelId, context.userId);
  const matchedIds = await match(context.text, candidates);
  const task = candidates.find((candidate) => candidate.id === matchedIds[0]);

  if (!task) {
    await context.say({
      text: `完了報告として受け取りましたが、対象のタスクを特定できませんでした。タスク名をもう少し具体的に教えてください。\n\n${await getTaskSummaryText(context)}`,
    });
    return;
  }

  const didComplete = await complete(task.id, context.channelId, context.userId);
  const remaining = matchedIds.length - 1;

  await context.say({
    text: didComplete
      ? `完了にしました。\n・ ${task.title} ✅${remaining > 0 ? `\n(同じ内容の候補が他に${remaining}件あります。続けて同じ発言を送るとさらに完了になります)` : ""}\n\n${await getTaskSummaryText(context)}`
      : `対象のタスクはすでに完了済み、または見つかりませんでした。\n\n${await getTaskSummaryText(context)}`,
  });
}
