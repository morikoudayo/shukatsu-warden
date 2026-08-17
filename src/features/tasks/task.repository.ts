import { supabase } from "../../libs/supabase.js";

import type { TaskInsert } from "./task.types.js";

export async function insertTasks(
  taskInserts: TaskInsert[],
): Promise<void> {
  if (taskInserts.length === 0) {
    return;
  }

  const { error } = await supabase.from("tasks").insert(
    taskInserts.map((task) => ({
      id: task.id,

      priority: task.priority,
      title: task.title,
      company_name: task.companyName,

      slack_channel_id: task.slackChannelId,
      slack_message_ts: task.slackMessageTs,
      slack_user_id: task.slackUserId,
    })),
  );

  if (error) {
    throw new Error(`Failed to insert tasks: ${error.message}`);
  }
}