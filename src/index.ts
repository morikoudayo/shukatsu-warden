import { env } from "./config/env.js";
import { app } from "./slack/app.js";
import { register as registerMessages } from "./slack/messages/index.js";

async function main() {
  registerMessages(app);

  await app.start(env.port);

  console.log(`⚡️ Bot started on port ${env.port}`);
}

main().catch((error: unknown) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
