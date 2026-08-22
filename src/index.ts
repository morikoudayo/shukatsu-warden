import { env } from "./config/env.js";
import { app } from "./slack/app.js";
import { handleError } from "./slack/error/error-handler.js";
import { register as registerMessages } from "./slack/messages/index.js";

// アプリ内のエラーは経路を問わず全てhandleErrorに集約する。
process.on("uncaughtException", (error: unknown) => {
  void handleError({ error, label: "想定外の同期エラー" });
});

process.on("unhandledRejection", (error: unknown) => {
  void handleError({ error, label: "想定外の非同期エラー" });
});

async function main() {
  registerMessages(app);
  app.error(handleError);

  await app.start(env.port);

  console.log(`⚡️ Bot started on port ${env.port}`);
}

// 起動失敗もアラートは出す(app.clientはSocket Mode接続に依存しないため送れる)。
// ただしBotとして機能できないので、ここだけはプロセスを落とす。
// 落とさないと終了コード0になり、supervisorから正常終了に見えてしまう。
main().catch(async (error: unknown) => {
  await handleError({ error, label: "起動に失敗" });
  process.exit(1);
});
