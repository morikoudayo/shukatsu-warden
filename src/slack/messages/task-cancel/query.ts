import { supabase } from "../../../database/supabase.js";

export async function cancel(
  taskId: string,
  channelId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: "cancelled" })
    .eq("id", taskId)
    .eq("slack_channel_id", channelId)
    .eq("slack_user_id", userId)
    .eq("status", "open")
    .select("id")
    .maybeSingle();

  if (error) throw new Error(`Failed to cancel task: ${error.message}`);

  return data !== null;
}
