create table public.parent_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (btrim(full_name) <> ''),
  created_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references public.parent_profiles (user_id) on delete cascade,
  full_name text not null check (btrim(full_name) <> ''),
  sort_order smallint not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (parent_user_id, sort_order)
);

alter table public.parent_profiles enable row level security;
alter table public.children enable row level security;

revoke all on table public.parent_profiles from anon, authenticated;
revoke all on table public.children from anon, authenticated;

grant select on table public.parent_profiles to authenticated;
grant select on table public.children to authenticated;

create policy "Parents can read their own profile"
on public.parent_profiles
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Parents can read their own children"
on public.children
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = parent_user_id);
