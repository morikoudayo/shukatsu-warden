import { supabase } from "../../database/supabase.js";

const UNIQUE_VIOLATION = "23505";

export async function markProcessed(channelId: string, ts: string): Promise<boolean> {
  const { error } = await supabase
    .from("processed_messages")
    .insert({ slack_channel_id: channelId, slack_message_ts: ts });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) return false;
    throw new Error(`Failed to mark message as processed: ${error.message}`);
  }

  return true;
}
