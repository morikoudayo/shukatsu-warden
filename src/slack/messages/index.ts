import type { App } from "@slack/bolt";

import { env } from "../../config/env.js";

import { route } from "./router.js";

const MAX_PROCESSED_MESSAGES = 1000;
const processedMessages = new Set<string>();

function alreadyProcessed(channel: string, ts: string): boolean {
  const key = `${channel}:${ts}`;

  if (processedMessages.has(key)) return true;

  processedMessages.add(key);

  if (processedMessages.size > MAX_PROCESSED_MESSAGES) {
    const oldest = processedMessages.values().next().value;
    if (oldest !== undefined) processedMessages.delete(oldest);
  }

  return false;
}

export function register(app: App): void {
  app.message(async ({ message, say, logger }) => {
    if ("bot_id" in message) return;
    if ("subtype" in message && message.subtype) return;
    if (message.channel !== env.slack.inboxChannelId) return;

    if (alreadyProcessed(message.channel, message.ts)) {
      logger.info({ channel: message.channel, ts: message.ts }, "Ignoring duplicate message delivery");
      return;
    }

    logger.info(
      { channel: message.channel, user: message.user, text: message.text },
      "Received message in #ai支社",
    );

    await say({ text: "内容を確認しています。最大１分ほどお待ちください。" });

    try {
      await route({
        text: message.text || "",
        channelId: message.channel,
        messageTs: message.ts,
        userId: message.user,
        say,
      });
    } catch (error) {
      logger.error(error);
      await say({ text: "メッセージの処理中にエラーが発生しました。もう一度お試しください。" });
    }
  });
}
