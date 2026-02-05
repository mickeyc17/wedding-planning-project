create extension if not exists "pgcrypto";

create table if not exists allowed_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  owner text check (owner in ('Mickey', 'Shivani')),
  due_date date,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  labels text[] not null default '{}',
  checklist jsonb not null default '[]',
  status text not null default 'Backlog' check (status in ('Backlog', 'This Month', 'In Progress', 'Waiting', 'Done')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_set_updated_at
before update on tasks
for each row
execute function set_updated_at();

alter table allowed_users enable row level security;
alter table tasks enable row level security;

create policy "allowed_users_select_self" on allowed_users
for select
to authenticated
using (email = auth.email());

create policy "tasks_select_invited" on tasks
for select
to authenticated
using (exists (select 1 from allowed_users where email = auth.email()));

create policy "tasks_insert_invited" on tasks
for insert
to authenticated
with check (exists (select 1 from allowed_users where email = auth.email()));

create policy "tasks_update_invited" on tasks
for update
to authenticated
using (exists (select 1 from allowed_users where email = auth.email()))
with check (exists (select 1 from allowed_users where email = auth.email()));

create policy "tasks_delete_invited" on tasks
for delete
to authenticated
using (exists (select 1 from allowed_users where email = auth.email()));
