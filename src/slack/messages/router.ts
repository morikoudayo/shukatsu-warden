import { classify } from "./classify/index.js";
import { handle as addTask } from "./task-add/index.js";
import { handle as completeTask } from "./task-complete/index.js";
import { handle as listTasks } from "./task-list/index.js";

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
    case "task_list":
      await listTasks(context);
      return;
    case "other":
      return;
  }
}
