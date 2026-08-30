create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  inquiry_type text not null check (inquiry_type in ('client', 'professional', 'general')),
  subject text,
  message text not null,
  ip_hash text,
  user_agent text
);

create index contact_submissions_created_at_idx on public.contact_submissions (created_at desc);
create index contact_submissions_ip_hash_created_at_idx on public.contact_submissions (ip_hash, created_at desc);

alter table public.contact_submissions enable row level security;
