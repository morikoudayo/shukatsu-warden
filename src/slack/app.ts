import { App, LogLevel } from "@slack/bolt";

import { env } from "../config/env.js";

export const app = new App({
  token: env.slack.botToken,
  appToken: env.slack.appToken,
  socketMode: true,
  // エラー境界でイベントbody(チャンネル/発言者/本文)を受け取るため
  extendedErrorHandler: true,
  logLevel: env.nodeEnv === "development" ? LogLevel.DEBUG : LogLevel.INFO,
});
