import { supabase } from "../../../database/supabase.js";
import { getStartOfToday } from "../../../utils/date.js";

import type { TaskCandidate } from "./types.js";

export async function getOpenTasks(
  channelId: string,
  userId: string,
): Promise<TaskCandidate[]> {
  const startOfToday = getStartOfToday();
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, company_name")
    .eq("slack_channel_id", channelId)
    .eq("slack_user_id", userId)
    .eq("status", "open")
    .gte("created_at", startOfToday.toISOString())
    .lt("created_at", endOfToday.toISOString());

  if (error) throw new Error(`Failed to get open tasks: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    companyName: row.company_name,
  }));
}

export async function complete(
  taskId: string,
  channelId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("slack_channel_id", channelId)
    .eq("slack_user_id", userId)
    .eq("status", "open")
    .select("id")
    .maybeSingle();

  if (error) throw new Error(`Failed to complete task: ${error.message}`);

  return data !== null;
}
