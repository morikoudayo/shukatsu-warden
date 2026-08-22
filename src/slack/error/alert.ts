import { inspect } from "node:util";

import { env } from "../../config/env.js";

import { app } from "../app.js";

import type { KnownBlock, MrkdwnElement } from "@slack/web-api";

/** エラーの原因になったメッセージ。分かる範囲で渡す。 */
export type AlertSource = {
  channelId: string;
  messageTs: string;
  userId?: string | undefined;
  text?: string | undefined;
};

/** カード左端の色。Slack標準のred。 */
const ALERT_COLOR = "#E01E5A";

/** sectionのtextは3000文字上限。コードブロックの記号ぶんの余裕を見る。 */
const MAX_FENCED_LENGTH = 2800;

/**
 * 本文がSlackの記法として解釈されないよう無害化する。
 * リンク・ユーザー参照になる記号に加え、囲みを破るコードフェンスも潰す。
 */
function escapeMrkdwn(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("```", "'''");
}

/** 見出し用の短い1行表現。 */
function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : inspect(error, { depth: 2 });
}

function truncate(value: string): string {
  if (value.length <= MAX_FENCED_LENGTH) return value;

  return `${value.slice(0, MAX_FENCED_LENGTH)}\n…(残り${value.length - MAX_FENCED_LENGTH}文字を省略)`;
}

function fence(value: string): string {
  return `\`\`\`\n${escapeMrkdwn(truncate(value))}\n\`\`\``;
}

function field(label: string, value: string): MrkdwnElement {
  return { type: "mrkdwn", text: `*${label}*\n${value}` };
}

function nowInJst(): string {
  return new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", hour12: false });
}

async function getPermalink(source: AlertSource): Promise<string | undefined> {
  try {
    const result = await app.client.chat.getPermalink({
      channel: source.channelId,
      message_ts: source.messageTs,
    });

    return result.permalink;
  } catch {
    // リンクは付加情報なので、取れなくてもアラート自体は送る
    return undefined;
  }
}

function buildCard(
  context: string,
  error: unknown,
  source: AlertSource | undefined,
  permalink: string | undefined,
): KnownBlock[] {
  const fields: MrkdwnElement[] = [
    field("発生箇所", escapeMrkdwn(context)),
    field("日時", nowInJst()),
  ];

  if (source) {
    fields.push(field("チャンネル", `<#${source.channelId}>`));
    if (source.userId) fields.push(field("ユーザー", `<@${source.userId}>`));
  }

  const blocks: KnownBlock[] = [
    { type: "header", text: { type: "plain_text", text: "🚨 エラーが発生しました", emoji: true } },
    { type: "section", fields },
    { type: "divider" },
    { type: "section", text: { type: "mrkdwn", text: `*エラー*\n${fence(describeError(error))}` } },
  ];

  if (source?.text) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*元のメッセージ*\n${fence(source.text)}` },
    });
  }

  blocks.push({
    type: "section",
    text: { type: "mrkdwn", text: `*詳細*\n${fence(inspect(error, { depth: null }))}` },
  });

  if (permalink) {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: `<${permalink}|元のメッセージを開く>` }],
    });
  }

  return blocks;
}

/**
 * エラーをアラートチャンネルへカードとして送る。
 * この関数は決してthrowしない。通報の失敗が新たな未処理エラーになるのを防ぐため。
 */
export async function reportError(
  context: string,
  error: unknown,
  source?: AlertSource,
): Promise<void> {
  // Slackへの送信が失敗しても情報を失わないよう、ターミナルには必ず残す
  console.error(`${context}:`, error);

  try {
    const permalink = source ? await getPermalink(source) : undefined;

    await app.client.chat.postMessage({
      channel: env.slack.alertChannelId,
      // 左端に色バーを出すため、blocksはattachmentに包む
      attachments: [
        {
          color: ALERT_COLOR,
          // 通知プレビュー用。トップレベルのtextに置くとカードの上に本文として
          // 表示され、見出しが二重になるのでattachment側のfallbackに置く。
          fallback: `🚨 ${context}: ${describeError(error)}`,
          blocks: buildCard(context, error, source, permalink),
        },
      ],
    });
  } catch (alertError) {
    console.error("アラートの送信自体に失敗しました:", alertError);
  }
}
