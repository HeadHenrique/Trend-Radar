-- Etapa 3.3.2 — canonical posts + monitored profile associations
-- Generic migration: no POC-specific UUIDs or provider run IDs.

do $$
begin
  if exists (
    select 1
    from public.instagram_posts p
    left join public.monitored_profiles mp on mp.id = p.monitored_profile_id
    where p.monitored_profile_id is null
       or mp.id is null
       or num_nonnulls(p.instagram_media_id, p.instagram_shortcode, p.permalink) = 0
  ) then
    raise exception 'Legacy instagram_posts preflight validation failed';
  end if;

  if exists (
    select 1
    from public.post_metric_snapshots s
    left join public.instagram_posts p
      on p.id = s.post_id
     and p.monitored_profile_id = s.monitored_profile_id
    left join public.collection_runs cr
      on cr.id = s.collection_run_id
     and cr.monitored_profile_id = s.monitored_profile_id
    where p.id is null or cr.id is null
  ) then
    raise exception 'Legacy post_metric_snapshots preflight validation failed';
  end if;
end
$$;

create table public.monitored_profile_posts (
  monitored_profile_id uuid not null
    references public.monitored_profiles(id)
    on delete restrict,

  instagram_post_id uuid not null
    references public.instagram_posts(id)
    on delete restrict,

  association_type text not null
    check (association_type in ('author', 'collaborator', 'discovered')),

  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint monitored_profile_posts_pkey
    primary key (monitored_profile_id, instagram_post_id),

  constraint monitored_profile_posts_seen_order
    check (last_seen_at >= first_seen_at)
);

create index monitored_profile_posts_post_profile_idx
  on public.monitored_profile_posts (
    instagram_post_id,
    monitored_profile_id
  );

alter table public.instagram_posts
  add column author_instagram_username text null,
  add column author_instagram_external_id text null,
  add column hashtags text[] null;

update public.instagram_posts p
set
  author_instagram_username = mp.instagram_username,
  author_instagram_external_id = mp.instagram_external_id
from public.monitored_profiles mp
where mp.id = p.monitored_profile_id;

insert into public.monitored_profile_posts (
  monitored_profile_id,
  instagram_post_id,
  association_type,
  first_seen_at,
  last_seen_at,
  created_at
)
select
  monitored_profile_id,
  id,
  'author',
  first_collected_at,
  last_collected_at,
  created_at
from public.instagram_posts;

do $$
declare
  post_count bigint;
  association_count bigint;
begin
  select count(*) into post_count
  from public.instagram_posts;

  select count(*) into association_count
  from public.monitored_profile_posts;

  if post_count <> association_count then
    raise exception
      'Legacy association backfill mismatch: posts %, associations %',
      post_count,
      association_count;
  end if;
end
$$;

alter table public.post_metric_snapshots
  drop constraint post_metric_snapshots_post_profile_fkey;

alter table public.post_metric_snapshots
  add constraint post_metric_snapshots_profile_post_fkey
  foreign key (monitored_profile_id, post_id)
  references public.monitored_profile_posts (
    monitored_profile_id,
    instagram_post_id
  )
  on delete restrict;

drop index public.instagram_posts_profile_published_idx;

alter table public.instagram_posts
  drop constraint instagram_posts_profile_identity_uq;

alter table public.instagram_posts
  drop constraint instagram_posts_monitored_profile_id_fkey;

alter table public.instagram_posts
  drop column monitored_profile_id;

alter table public.monitored_profile_posts
  enable row level security;

revoke all on table public.monitored_profile_posts
  from PUBLIC, anon, authenticated, service_role;

grant select on table public.monitored_profile_posts
  to authenticated;

grant select, insert, update
  on table public.monitored_profile_posts
  to service_role;

create policy "monitored_profile_posts_select_internal"
on public.monitored_profile_posts
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('viewer', 'editor', 'admin')
);
