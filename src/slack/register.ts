import type { App } from "@slack/bolt";
import { registerMessageHandlers } from "./messages.js";

export function registerSlackHandlers(app: App): void {
  registerMessageHandlers(app);

  app.error(async (error) => {
    console.error("Unhandled Slack Bolt error:", error);
  });
}