import { match } from "./chat.js";
import { complete, getOpenTasks } from "./query.js";

import type { MessageContext } from "../types.js";

export async function handle(context: MessageContext): Promise<void> {
  const candidates = await getOpenTasks(context.channelId, context.userId);
  const taskId = await match(context.text, candidates);
  const task = candidates.find((candidate) => candidate.id === taskId);

  if (!task) {
    await context.say({
      text: "完了報告として受け取りましたが、対象のタスクを特定できませんでした。タスク名をもう少し具体的に教えてください。",
    });
    return;
  }

  const didComplete = await complete(task.id, context.channelId, context.userId);
  await context.say({
    text: didComplete
      ? `完了にしました。\n• ${task.title}`
      : "対象のタスクはすでに完了済み、または見つかりませんでした。",
  });
}
