import type { App } from "@slack/bolt";
import { env } from "../config/env.js";

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
      text: "受け取りました",
      thread_ts: message.ts,
    });
  });
}