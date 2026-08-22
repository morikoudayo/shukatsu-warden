import type { MessageContext } from "../types.js";

export async function handle(context: MessageContext): Promise<void> {
  await context.say({
    text: "タスクの追加・完了・キャンセル・一覧確認のいずれにも該当しない発言として受け取りました。特に対応は行っていません。",
  });
}
