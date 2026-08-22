import { classify } from "./classify/index.js";
import { handle as addTask } from "./task-add/index.js";
import { handle as cancelTask } from "./task-cancel/index.js";
import { handle as completeTask } from "./task-complete/index.js";
import { handle as listTasks } from "./task-list/index.js";
import { handle as resetTasks } from "./task-reset/index.js";

import type { MessageContext } from "./types.js";

export async function route(context: MessageContext): Promise<void> {
  const intent = await classify(context.text);

  switch (intent) {
    case "task_add":
      await addTask(context);
      return;
    case "task_complete":
      await completeTask(context);
      return;
    case "task_cancel":
      await cancelTask(context);
      return;
    case "task_reset":
      await resetTasks(context);
      return;
    case "task_list":
      await listTasks(context);
      return;
    case "other":
      await context.say({
        text: "タスクの追加・完了・キャンセル・一覧確認のいずれにも該当しない発言として受け取りました。特に対応は行っていません。",
      });
      return;
    default:
      throw new Error(`Unhandled message intent: ${String(intent)}`);
  }
}
