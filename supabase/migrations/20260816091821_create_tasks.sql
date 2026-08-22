create extension if not exists pgcrypto;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  company_name text,

  status text not null default 'open'
    check (status in ('open', 'done', 'cancelled')),

  completed_at timestamptz,

  slack_channel_id text not null,
  slack_message_ts text not null,
  slack_user_id text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tasks_completed_at_consistency check (
    (status = 'done' and completed_at is not null)
    or (status <> 'done' and completed_at is null)
  )
);

create index tasks_source_message_idx
  on public.tasks (slack_channel_id, slack_message_ts);

create index tasks_slack_user_id_idx
  on public.tasks (slack_user_id);

create table public.processed_messages (
  slack_channel_id text not null,
  slack_message_ts text not null,
  created_at timestamptz not null default now(),

  primary key (slack_channel_id, slack_message_ts)
);
