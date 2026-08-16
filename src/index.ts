import { env } from "./config/env.js";
import { app } from "./libs/slack.js";
import { registerSlackHandlers } from "./slack/register.js";

async function main() {
  registerSlackHandlers(app);

  await app.start(env.port);

  console.log(`⚡️ Bot started on port ${env.port}`);
}

main().catch((error: unknown) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});