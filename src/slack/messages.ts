import type { App } from "@slack/bolt";
import { env } from "../config/env.js";
import { parseTasks } from "../features/tasks/task.parser.js";
import { insertTasks } from "../features/tasks/task.repository.js";
import { createTaskInserts, formatTasks } from "../features/tasks/task.service.js";

export function registerMessageHandlers(app: App): void {
  app.message(async ({ message, say, logger }) => {
    if ("bot_id" in message) return;
    if ("subtype" in message && message.subtype) return;
    if (message.channel !== env.slack.inboxChannelId) return;

    logger.info(
      { channel: message.channel, user: message.user, text: message.text },
      "Received message in #ai支社",
    );

    await say({
      text: "タスク宣言／追加を検知しました。最大１分ほどお待ちください。",
    });

    const parsedTasks = await parseTasks(message.text || "");

    const taskInserts = createTaskInserts(
      parsedTasks,
      message.channel,
      message.ts,
      message.user,
    );

    await insertTasks(taskInserts);

    const formattedTasks = formatTasks(parsedTasks);

    if (formattedTasks) {
      await say({
        text: `タスクを追加しました。\n${formattedTasks}`,
      });
    }
  });
}
