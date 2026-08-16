import "dotenv/config";
import { App } from "@slack/bolt";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.message(async ({ message, say }) => {
  if ("subtype" in message && message.subtype) return;
  await say("受け取った");
});

await app.start();
console.log("⚡️ Bolt started");