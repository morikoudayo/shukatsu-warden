alter table public.tasks
drop constraint if exists tasks_parent_task_id_fkey;

alter table public.tasks
drop column if exists parent_task_id;

alter table public.tasks
drop column if exists annotation;