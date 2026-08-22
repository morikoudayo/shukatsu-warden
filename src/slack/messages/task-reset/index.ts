import { resetTasks } from "./query.js";

import type { MessageContext } from "../types.js";

export async function handle(context: MessageContext): Promise<void> {
  const count = await resetTasks(context.channelId, context.userId);

  await context.say({
    text: count > 0
      ? `今日のタスクを${count}件リセットしました。`
      : "リセット対象の今日のタスクはありませんでした。",
  });
}
