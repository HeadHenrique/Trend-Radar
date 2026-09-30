create table public.monitored_profiles (
  id uuid primary key default gen_random_uuid(),

  instagram_username text not null,
  primary_market_code text not null,
  profile_group text not null,
  niche text null,
  category text null,
  priority smallint not null default 2,
  tags text[] not null default '{}',
  active boolean not null default true,

  instagram_external_id text null,
  display_name text null,
  profile_picture_url text null,
  followers_count bigint null,
  monitoring_status text not null default 'pending',
  last_collected_at timestamptz null,
  next_collection_at timestamptz null,
  last_collection_error text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  created_by uuid null default auth.uid()
    references auth.users(id)
    on delete set null,

  updated_by uuid null
    references auth.users(id)
    on delete set null,

  constraint monitored_profiles_instagram_username_lowercase
    check (instagram_username = lower(instagram_username)),

  constraint monitored_profiles_instagram_username_format
    check (
      char_length(instagram_username) between 1 and 64
      and instagram_username ~ '^[a-z0-9._]+$'
    ),

  constraint monitored_profiles_primary_market_code_format
    check (primary_market_code ~ '^[A-Z]{2}$'),

  constraint monitored_profiles_profile_group
    check (
      profile_group in (
        'own',
        'competitor',
        'reference',
        'trendsetter'
      )
    ),

  constraint monitored_profiles_priority_range
    check (priority between 1 and 3),

  constraint monitored_profiles_followers_nonnegative
    check (followers_count is null or followers_count >= 0),

  constraint monitored_profiles_monitoring_status
    check (monitoring_status in ('pending', 'healthy', 'error')),

  constraint monitored_profiles_last_error_length
    check (
      last_collection_error is null
      or char_length(last_collection_error) <= 2000
    ),

  constraint monitored_profiles_instagram_username_unique
    unique (instagram_username)
);

create unique index monitored_profiles_instagram_external_id_uq
  on public.monitored_profiles (instagram_external_id)
  where instagram_external_id is not null;

create index monitored_profiles_primary_market_idx
  on public.monitored_profiles (primary_market_code);

create index monitored_profiles_group_idx
  on public.monitored_profiles (profile_group);

create index monitored_profiles_created_by_idx
  on public.monitored_profiles (created_by)
  where created_by is not null;

create index monitored_profiles_updated_by_idx
  on public.monitored_profiles (updated_by)
  where updated_by is not null;

create index monitored_profiles_tags_gin_idx
  on public.monitored_profiles
  using gin (tags);

create index monitored_profiles_collection_queue_idx
  on public.monitored_profiles (priority, next_collection_at)
  where active = true;

create or replace function public.protect_resolved_instagram_username()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if
    old.instagram_username is distinct from new.instagram_username
    and old.instagram_external_id is not null
    and (select auth.uid()) is not null
  then
    raise exception
      'instagram_username cannot be changed by an authenticated client after identity resolution';
  end if;

  return new;
end;
$$;

create trigger a_monitored_profiles_protect_resolved_username
before update of instagram_username on public.monitored_profiles
for each row
execute function public.protect_resolved_instagram_username();

create or replace function public.set_monitored_profile_audit_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  human_fields_changed boolean;
begin
  human_fields_changed :=
    old.instagram_username is distinct from new.instagram_username
    or old.primary_market_code is distinct from new.primary_market_code
    or old.profile_group is distinct from new.profile_group
    or old.niche is distinct from new.niche
    or old.category is distinct from new.category
    or old.priority is distinct from new.priority
    or old.tags is distinct from new.tags
    or old.active is distinct from new.active;

  if new is not distinct from old then
    return new;
  end if;

  new.updated_at = now();

  if (select auth.uid()) is not null and human_fields_changed then
    new.updated_by = (select auth.uid());
  else
    new.updated_by = old.updated_by;
  end if;

  return new;
end;
$$;

create trigger z_monitored_profiles_set_audit_fields
before update on public.monitored_profiles
for each row
execute function public.set_monitored_profile_audit_fields();

alter table public.monitored_profiles enable row level security;

revoke all on table public.monitored_profiles from anon;
revoke all on table public.monitored_profiles from authenticated;

grant select on table public.monitored_profiles to authenticated;

grant insert (
  instagram_username,
  primary_market_code,
  profile_group,
  niche,
  category,
  priority,
  tags,
  active
) on table public.monitored_profiles to authenticated;

grant update (
  instagram_username,
  primary_market_code,
  profile_group,
  niche,
  category,
  priority,
  tags,
  active
) on table public.monitored_profiles to authenticated;

create policy "monitored_profiles_select_internal"
on public.monitored_profiles
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('viewer', 'editor', 'admin')
);

create policy "monitored_profiles_insert_editor"
on public.monitored_profiles
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and created_by = (select auth.uid())
  and (
    ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
      in ('editor', 'admin')
  )
);

create policy "monitored_profiles_update_editor"
on public.monitored_profiles
for update
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('editor', 'admin')
)
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('editor', 'admin')
);

revoke execute on function public.protect_resolved_instagram_username() from public, anon, authenticated;
revoke execute on function public.set_monitored_profile_audit_fields() from public, anon, authenticated;
