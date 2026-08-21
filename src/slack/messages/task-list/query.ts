import { supabase } from "../../../database/supabase.js";
import { getStartOfToday } from "../../../utils/date.js";

import type { TaskListItem } from "./types.js";

export async function getTasks(
  channelId: string,
  userId: string,
): Promise<TaskListItem[]> {
  const startOfToday = getStartOfToday();
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const { data, error } = await supabase
    .from("tasks")
    .select("title, status")
    .eq("slack_channel_id", channelId)
    .eq("slack_user_id", userId)
    .gte("created_at", startOfToday.toISOString())
    .lt("created_at", endOfToday.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to get today's tasks: ${error.message}`);

  return data.map((row) => ({ title: row.title, status: row.status }));
}
