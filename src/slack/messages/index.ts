import type { App } from "@slack/bolt";

import { env } from "../../config/env.js";

import { markProcessed } from "./dedup.js";
import { route } from "./router.js";

export function register(app: App): void {
  app.message(async ({ message, say, client, logger }) => {
    if ("bot_id" in message) return;
    if ("subtype" in message && message.subtype) return;
    if (message.channel !== env.slack.inboxChannelId) return;

    if (!(await markProcessed(message.channel, message.ts))) {
      logger.info({ channel: message.channel, ts: message.ts }, "Ignoring duplicate message delivery");
      return;
    }

    logger.info(
      { channel: message.channel, user: message.user, text: message.text },
      "Received message in #ai支社",
    );

    const channel = message.channel;
    const timestamp = message.ts;

    await client.reactions.add({ channel, timestamp, name: "eyes" }).catch(() => {});

    await route(
      {
        text: message.text || "",
        channelId: channel,
        messageTs: timestamp,
        userId: message.user,
        say,
      },
      client,
      channel,
      timestamp,
    );
  });
}
