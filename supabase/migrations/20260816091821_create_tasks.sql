create extension if not exists pgcrypto;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),

  parent_task_id uuid
    references public.tasks (id)
    on delete cascade,

  title text not null,
  company_name text,
  annotation text not null default '',

  status text not null default 'open'
    check (status in ('open', 'done', 'cancelled')),

  completed_at timestamptz,

  slack_channel_id text not null,
  slack_message_ts text not null,
  position integer not null
    check (position >= 0),

  slack_user_id text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tasks_completed_at_consistency check (
    (status = 'done' and completed_at is not null)
    or (status <> 'done' and completed_at is null)
  ),

  constraint tasks_source_position_key unique (
    slack_channel_id,
    slack_message_ts,
    position
  )
);

create index tasks_parent_task_id_idx
  on public.tasks (parent_task_id);

create index tasks_source_message_idx
  on public.tasks (slack_channel_id, slack_message_ts);

create index tasks_slack_user_id_idx
  on public.tasks (slack_user_id);