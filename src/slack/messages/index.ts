import type { App } from "@slack/bolt";

import { env } from "../../config/env.js";

import { markProcessed } from "./dedup.js";
import { route } from "./router.js";

export function register(app: App): void {
  app.message(async ({ message, say, logger }) => {
    if ("bot_id" in message) return;
    if ("subtype" in message && message.subtype) return;
    if (message.channel !== env.slack.inboxChannelId) return;

    try {
      if (!(await markProcessed(message.channel, message.ts))) {
        logger.info({ channel: message.channel, ts: message.ts }, "Ignoring duplicate message delivery");
        return;
      }

      logger.info(
        { channel: message.channel, user: message.user, text: message.text },
        "Received message in #ai支社",
      );

      await say({ text: "内容を確認しています。最大１分ほどお待ちください。" });

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
