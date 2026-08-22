import type { App } from "@slack/bolt";

type Client = App["client"];

/** 処理状況を表すリアクション。 */
export const REACTION = {
  received: "eyes",
  working: "saluting_face",
  skipped: "pray",
  done: "white_check_mark",
  failed: "x",
} as const;

/** 処理途中を示すもの。失敗時はどれが付いているか分からないのでまとめて外す。 */
export const PROGRESS_REACTIONS = [REACTION.received, REACTION.working, REACTION.skipped];

/** 既に付いている/既に外れている等、実害がなく無視してよいSlackエラー。 */
const IGNORABLE_ERRORS = new Set(["already_reacted", "no_reaction"]);

function isIgnorable(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const detail = (error as { data?: { error?: unknown } }).data?.error;

  return typeof detail === "string" && IGNORABLE_ERRORS.has(detail);
}

export async function addReaction(
  client: Client,
  channel: string,
  timestamp: string,
  name: string,
): Promise<void> {
  try {
    await client.reactions.add({ channel, timestamp, name });
  } catch (error) {
    // 想定外のエラーはここで握らず、エラー境界まで投げる
    if (!isIgnorable(error)) throw error;
  }
}

export async function removeReaction(
  client: Client,
  channel: string,
  timestamp: string,
  name: string,
): Promise<void> {
  try {
    await client.reactions.remove({ channel, timestamp, name });
  } catch (error) {
    if (!isIgnorable(error)) throw error;
  }
}

export async function swapReaction(
  client: Client,
  channel: string,
  timestamp: string,
  from: string,
  to: string,
): Promise<void> {
  await removeReaction(client, channel, timestamp, from);
  await addReaction(client, channel, timestamp, to);
}
