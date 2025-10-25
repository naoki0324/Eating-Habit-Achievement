create table if not exists auth_users (
  id text primary key,
  password_hash text not null,
  goal_days integer not null check (goal_days > 0),
  email text unique,
  display_name text,
  streak_days integer not null default 0,
  longest_streak integer not null default 0,
  last_checklist_date date,
  total_checklists integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists checklist_templates (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references auth_users (id) on delete cascade,
  title text,
  position integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists checklist_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references checklist_templates (id) on delete cascade,
  label text not null,
  position integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists daily_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references auth_users (id) on delete cascade,
  record_date date not null,
  sections jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint daily_checklists_unique_user_date unique (user_id, record_date)
);

-- 連続日数管理テーブル
create table if not exists streak_records (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references auth_users (id) on delete cascade,
  streak_start_date date not null,
  streak_end_date date,
  streak_length integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- ユーザー統計テーブル
create table if not exists user_statistics (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references auth_users (id) on delete cascade,
  stat_date date not null,
  checklists_completed integer not null default 0,
  items_checked integer not null default 0,
  completion_rate numeric(5,2) not null default 0.00,
  created_at timestamptz not null default timezone('utc', now()),
  constraint user_statistics_unique_user_date unique (user_id, stat_date)
);

create table if not exists system_logs (
  id bigserial primary key,
  user_id text references auth_users (id) on delete set null,
  level text not null,
  action text not null,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- インデックス
create index if not exists idx_checklist_templates_user_id ON checklist_templates (user_id);
create index if not exists idx_checklist_template_items_template_id ON checklist_template_items (template_id);
create index if not exists idx_daily_checklists_user_date ON daily_checklists (user_id, record_date desc);
create index if not exists idx_system_logs_user_date ON system_logs (user_id, created_at desc);
create index if not exists idx_streak_records_user_id ON streak_records (user_id);
create index if not exists idx_streak_records_active ON streak_records (user_id, is_active);
create index if not exists idx_user_statistics_user_date ON user_statistics (user_id, stat_date desc);
create index if not exists idx_auth_users_email ON auth_users (email);
