import { REACTION, swapReaction } from "../shared/reactions.js";

import { classify } from "./classify/index.js";
import { handle as handleOther } from "./other/index.js";
import { handle as addTask } from "./task-add/index.js";
import { handle as cancelTask } from "./task-cancel/index.js";
import { handle as completeTask } from "./task-complete/index.js";
import { handle as listTasks } from "./task-list/index.js";
import { handle as resetTasks } from "./task-reset/index.js";

import type { App } from "@slack/bolt";
import type { MessageIntent } from "./classify/types.js";
import type { MessageContext } from "./types.js";

type Client = App["client"];

const ACK_REACTION: Record<MessageIntent, string> = {
  task_add: REACTION.working,
  task_list: REACTION.working,
  task_complete: REACTION.working,
  task_cancel: REACTION.working,
  task_reset: REACTION.working,
  other: REACTION.skipped,
};

/**
 * エラーは一切catchしない。全てエラー境界(slack/error-handler.ts)に集約する。
 */
export async function route(
  context: MessageContext,
  client: Client,
  channel: string,
  timestamp: string,
): Promise<void> {
  const intent = await classify(context.text);

  await swapReaction(client, channel, timestamp, REACTION.received, ACK_REACTION[intent]);

  switch (intent) {
    case "task_add":
      await addTask(context);
      break;
    case "task_complete":
      await completeTask(context);
      break;
    case "task_cancel":
      await cancelTask(context);
      break;
    case "task_reset":
      await resetTasks(context);
      break;
    case "task_list":
      await listTasks(context);
      break;
    case "other":
      await handleOther(context);
      break;
    default:
      throw new Error(`Unhandled message intent: ${String(intent)}`);
  }

  if (intent !== "other") {
    await swapReaction(client, channel, timestamp, ACK_REACTION[intent], REACTION.done);
  }
}
