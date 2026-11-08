create extension if not exists "pgcrypto";

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid references organizations (id) on delete set null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists playbooks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists playbook_rules (
  id uuid primary key default gen_random_uuid(),
  playbook_id uuid not null references playbooks (id) on delete cascade,
  name text not null,
  description text not null,
  domain text not null,
  severity text not null check (severity in ('red', 'amber')),
  condition text not null,
  keywords text[] not null default '{}',
  patterns text[] not null default '{}',
  enabled boolean not null default true
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  filename text not null,
  mime_type text not null,
  page_count integer not null default 1,
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete cascade,
  contract_id uuid references contracts (id) on delete cascade,
  verdict text not null,
  summary text not null,
  duration_ms integer not null default 0,
  playbook_version integer not null default 1,
  fingerprint text not null,
  created_at timestamptz not null default now()
);

create table if not exists findings (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews (id) on delete cascade,
  agent_id text not null,
  title text not null,
  summary text not null,
  severity text not null check (severity in ('red', 'amber', 'green')),
  quote text not null,
  section_number text not null,
  rule_id text,
  verified boolean not null default false,
  confidence numeric not null default 0
);
