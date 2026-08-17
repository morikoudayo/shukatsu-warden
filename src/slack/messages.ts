import type { App } from "@slack/bolt";
import { env } from "../config/env.js";
import { createTasksFromMessage, formatTasks } from "../features/tasks/task.service.js"
import { format } from "node:path";

export function registerMessageHandlers(app: App): void {
  app.message(async ({ message, say, logger }) => {
    if ("bot_id" in message) return;
    if ("subtype" in message && message.subtype) return;
    if (message.channel !== env.slack.inboxChannelId) return;

    logger.info(
      { channel: message.channel, user: message.user, text: message.text },
      "Received message in #ai支社",
    );

    const parsed_tasks = await createTasksFromMessage(message.text || "", message.channel, message.ts, message.user)
    const formatted_tasks = formatTasks(parsed_tasks);

    await say({
      text: formatted_tasks,
    });
  });
}