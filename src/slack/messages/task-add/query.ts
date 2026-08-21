import { supabase } from "../../../database/supabase.js";

import type { Database } from "../../../database/types.js";
import type { NewTask } from "./types.js";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];

export async function insert(tasks: NewTask[]): Promise<void> {
  if (tasks.length === 0) return;

  const rows: TaskInsert[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    company_name: task.companyName,
    slack_channel_id: task.slackChannelId,
    slack_message_ts: task.slackMessageTs,
    slack_user_id: task.slackUserId,
  }));

  const { error } = await supabase.from("tasks").insert(rows);

  if (error) throw new Error(`Failed to insert tasks: ${error.message}`);
}
