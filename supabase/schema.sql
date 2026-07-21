-- LifeQuest — Supabase schema (single-tenant, no auth: RLS policies are
-- intentionally permissive for the `anon` role, per the app's design of a
-- single personal instance guarded only by keeping the project URL/key private.
-- Run this once in the Supabase SQL editor (or via psql against the
-- connection string) on a fresh project.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------------
create table if not exists activities (
  id text primary key,
  name text not null,
  color text not null,
  icon text not null,
  stat_key text not null check (stat_key in ('body','mind','focus','discipline','creativity','social')),
  created_at timestamptz not null default now(),
  archived boolean not null default false
);

-- ---------------------------------------------------------------------------
-- time_sessions
-- ---------------------------------------------------------------------------
create table if not exists time_sessions (
  id text primary key,
  activity_id text references activities(id) on delete set null,
  mode text not null check (mode in ('pomodoro','stopwatch','countdown')),
  started_at timestamptz not null,
  ended_at timestamptz,
  counted_seconds integer not null default 0,
  target_seconds integer,
  manual boolean not null default false,
  note text,
  auto_stopped boolean not null default false
);

create index if not exists time_sessions_started_at_idx on time_sessions (started_at desc);
create index if not exists time_sessions_activity_id_idx on time_sessions (activity_id);

-- ---------------------------------------------------------------------------
-- time_budgets (weekly hour goals per activity)
-- ---------------------------------------------------------------------------
create table if not exists time_budgets (
  id text primary key,
  activity_id text not null references activities(id) on delete cascade,
  target_hours_per_week numeric not null,
  unique (activity_id)
);

-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------
create table if not exists habits (
  id text primary key,
  name text not null,
  icon text not null,
  color text not null,
  kind text not null check (kind in ('binary','numeric')),
  target_value numeric,
  unit text,
  schedule jsonb not null,
  stat_key text not null check (stat_key in ('body','mind','focus','discipline','creativity','social')),
  xp_reward integer not null default 0,
  penalty_xp integer not null default 0,
  created_at timestamptz not null default now(),
  archived boolean not null default false
);

-- ---------------------------------------------------------------------------
-- habit_logs
-- ---------------------------------------------------------------------------
create table if not exists habit_logs (
  id text primary key,
  habit_id text not null references habits(id) on delete cascade,
  date date not null,
  value numeric not null default 0,
  completed boolean not null default false,
  penalized boolean not null default false,
  unique (habit_id, date)
);

create index if not exists habit_logs_habit_id_idx on habit_logs (habit_id);

-- ---------------------------------------------------------------------------
-- projects (todos)
-- ---------------------------------------------------------------------------
create table if not exists projects (
  id text primary key,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- todos
-- ---------------------------------------------------------------------------
create table if not exists todos (
  id text primary key,
  title text not null,
  notes text,
  project_id text references projects(id) on delete set null,
  priority text not null check (priority in ('p1','p2','p3','p4')),
  due_date date,
  labels jsonb not null default '[]'::jsonb,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists todos_project_id_idx on todos (project_id);

-- ---------------------------------------------------------------------------
-- achievements
-- ---------------------------------------------------------------------------
create table if not exists achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  condition jsonb not null,
  xp_reward integer not null default 0,
  unlocked_at timestamptz,
  created_at timestamptz not null default now(),
  builtin boolean not null default false
);

-- ---------------------------------------------------------------------------
-- xp_events (log of XP gains/penalties)
-- ---------------------------------------------------------------------------
create table if not exists xp_events (
  id text primary key,
  amount integer not null,
  reason text not null,
  stat_key text check (stat_key in ('body','mind','focus','discipline','creativity','social')),
  created_at timestamptz not null default now()
);

create index if not exists xp_events_created_at_idx on xp_events (created_at desc);

-- ---------------------------------------------------------------------------
-- app_settings — single row holding gamification totals + misc settings
-- ---------------------------------------------------------------------------
create table if not exists app_settings (
  id integer primary key default 1 check (id = 1),
  total_xp integer not null default 0,
  stats jsonb not null default '{}'::jsonb,
  timer_settings jsonb not null default '{}'::jsonb,
  notification_settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into app_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS: single-tenant, no auth — the anon key is the only gate, so every
-- table gets a blanket allow-all policy for anon + authenticated.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'activities','time_sessions','time_budgets','habits','habit_logs',
      'projects','todos','achievements','xp_events','app_settings'
    ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "public full access" on %I;', t);
    execute format(
      'create policy "public full access" on %I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
