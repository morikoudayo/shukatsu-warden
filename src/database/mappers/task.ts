import type { Database } from "../types.js";
import type { Task } from "../../types/task.js";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    companyName: row.company_name,
    status: row.status,
    completedAt: row.completed_at,
    slackChannelId: row.slack_channel_id,
    slackMessageTs: row.slack_message_ts,
    slackUserId: row.slack_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
