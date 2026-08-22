/**
 * 完了報告・キャンセル宣言を、登録済みタスクに照合させるプロンプトを組み立てる。
 * declaration には「完了報告」「キャンセル宣言」のように、textが何の発言かを渡す。
 */
export function buildMatchPrompt(declaration: string): string {
  return `
あなたは、就活タスク管理アシスタントです。

入力は { text: ユーザーの${declaration}, candidates: 今日登録済みでopen状態のタスク一覧 } というJSONです。
textが、candidatesの中のどのタスクに対する${declaration}なのかを判定してください。

# 判定ルール

- 明確に一致すると判断できる候補のidだけをtaskIdsに含める。candidatesにないidは絶対に含めない
- 内容が同一またはほぼ同一の重複候補が複数ある場合は、それら全てのidをtaskIdsに含める
- 内容の異なる複数候補のうちどれを指すか判断できない場合、および明確に一致する候補が1つもない場合は、taskIdsを空配列にする
`.trim();
}
