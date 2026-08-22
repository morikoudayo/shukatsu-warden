import { match } from "./chat.js";
import { cancel } from "./query.js";
import { getOpenTasks } from "../_shared/open-tasks.js";

import type { MessageContext } from "../types.js";

export async function handle(context: MessageContext): Promise<void> {
  const candidates = await getOpenTasks(context.channelId, context.userId);
  const matchedIds = await match(context.text, candidates);
  const task = candidates.find((candidate) => candidate.id === matchedIds[0]);

  if (!task) {
    await context.say({
      text: "キャンセルとして受け取りましたが、対象のタスクを特定できませんでした。タスク名をもう少し具体的に教えてください。",
    });
    return;
  }

  const didCancel = await cancel(task.id, context.channelId, context.userId);
  const remaining = matchedIds.length - 1;

  await context.say({
    text: didCancel
      ? `キャンセルしました。\n~${task.title}~${remaining > 0 ? `\n(同じ内容の候補が他に${remaining}件あります。続けて同じ発言を送るとさらにキャンセルされます)` : ""}`
      : "対象のタスクはすでに完了・キャンセル済み、または見つかりませんでした。",
  });
}
