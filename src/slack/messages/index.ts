import type { App } from "@slack/bolt";

import { env } from "../../config/env.js";

import { route } from "./router.js";

export function register(app: App): void {
  app.message(async ({ message, say, logger }) => {
    if ("bot_id" in message) return;
    if ("subtype" in message && message.subtype) return;
    if (message.channel !== env.slack.inboxChannelId) return;

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
  });
}
