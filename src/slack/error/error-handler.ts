import { app } from "../app.js";
import { PROGRESS_REACTIONS, REACTION, addReaction, removeReaction } from "../shared/reactions.js";

import { reportError } from "./alert.js";

import type { AlertSource } from "./alert.js";

/**
 * Boltのエラーハンドラ引数はそのまま渡せる形にしてある。
 * ExtendedErrorHandlerArgsは@slack/boltのルートから公開されていないため、
 * dist配下を直接参照せず構造だけで受ける。
 */
type ErrorReport = {
  error: unknown;
  /** Slackイベントのbody。プロセス例外など、無い場合もある。 */
  body?: unknown;
  /** 発生源のラベル。省略時はSlackイベント由来とみなす。 */
  label?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Boltが渡してくるイベントbodyから、アラートに載せる文脈を取り出す。
 *
 * bodyの型は@slack/boltのルートから公開されておらず、プロセス例外由来なら
 * そもそも存在しない。asで断定せず、実行時に一つずつ確かめる。
 * messageイベントで期待する形:
 *   { event: { channel: "C0BQ…", ts: "1787…", user: "U0BQ…", text: "…" } }
 */
function toAlertSource(body: unknown): AlertSource | undefined {
  if (!isRecord(body) || !isRecord(body.event)) return undefined;

  const { channel, ts, user, text } = body.event;

  // チャンネルとtsが無いと、リアクションも返信も宛先が決まらない
  if (typeof channel !== "string" || typeof ts !== "string") return undefined;

  return {
    channelId: channel,
    messageTs: ts,
    userId: asString(user),
    text: asString(text),
  };
}

/** 失敗を発言者にも伝える。ここでの失敗は元のエラーを覆い隠さないよう握る。 */
async function notifyUser(source: AlertSource): Promise<void> {
  try {
    for (const name of PROGRESS_REACTIONS) {
      await removeReaction(app.client, source.channelId, source.messageTs, name);
    }

    await addReaction(app.client, source.channelId, source.messageTs, REACTION.failed);

    await app.client.chat.postMessage({
      channel: source.channelId,
      text: "処理中にエラーが発生しました。詳細はアラートチャンネルに送りました。",
    });
  } catch (error) {
    console.error("発言者への失敗通知に失敗しました:", error);
  }
}

/**
 * アプリ内で出たエラーは、全てここに集まる。
 * 各ハンドラはcatchせずthrowするだけでよい。
 */
export async function handleError({ error, body, label }: ErrorReport): Promise<void> {
  const source = toAlertSource(body);

  await reportError(label ?? "メッセージの処理に失敗", error, source);

  if (source) await notifyUser(source);
}
