import { App, LogLevel } from "@slack/bolt";
import { env } from "./config/env.js";

export const app = new App({
  token: env.slack.botToken,
  appToken: env.slack.appToken,
  socketMode: true,

  logLevel:
    env.nodeEnv === "development"
      ? LogLevel.DEBUG
      : LogLevel.INFO,
});