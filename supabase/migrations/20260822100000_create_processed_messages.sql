create table public.processed_messages (
  slack_channel_id text not null,
  slack_message_ts text not null,
  created_at timestamptz not null default now(),

  primary key (slack_channel_id, slack_message_ts)
);
