import { supabase } from "../../../database/supabase.js";
import { getStartOfToday } from "../../../utils/date.js";

export async function resetTasks(channelId: string, userId: string): Promise<number> {
  const startOfToday = getStartOfToday();
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("slack_channel_id", channelId)
    .eq("slack_user_id", userId)
    .gte("created_at", startOfToday.toISOString())
    .lt("created_at", endOfToday.toISOString())
    .select("id");

  if (error) throw new Error(`Failed to reset tasks: ${error.message}`);

  return data.length;
}
