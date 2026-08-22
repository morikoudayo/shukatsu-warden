// supabase/migrations/ の内容を元に手動で作成。
// `supabase login && supabase link` 後は
// `supabase gen types typescript --linked > src/database/types.ts` で置き換える。

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          company_name: string | null;
          status: "open" | "done" | "cancelled";
          completed_at: string | null;
          slack_channel_id: string;
          slack_message_ts: string;
          slack_user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          company_name?: string | null;
          status?: "open" | "done" | "cancelled";
          completed_at?: string | null;
          slack_channel_id: string;
          slack_message_ts: string;
          slack_user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          company_name?: string | null;
          status?: "open" | "done" | "cancelled";
          completed_at?: string | null;
          slack_channel_id?: string;
          slack_message_ts?: string;
          slack_user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      processed_messages: {
        Row: {
          slack_channel_id: string;
          slack_message_ts: string;
          created_at: string;
        };
        Insert: {
          slack_channel_id: string;
          slack_message_ts: string;
          created_at?: string;
        };
        Update: {
          slack_channel_id?: string;
          slack_message_ts?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
