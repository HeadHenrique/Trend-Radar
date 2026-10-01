
create table public.collection_runs (
  id uuid primary key default gen_random_uuid(),

  monitored_profile_id uuid not null
    references public.monitored_profiles(id)
    on delete restrict,

  collection_type text not null
    check (collection_type in ('profile', 'posts', 'profile_and_posts')),

  provider_key text not null
    check (
      char_length(provider_key) between 1 and 64
      and provider_key ~ '^[a-z0-9_]+$'
    ),

  orchestrator text not null default 'n8n'
    check (
      char_length(orchestrator) between 1 and 64
      and orchestrator ~ '^[a-z0-9_]+$'
    ),

  provider_run_id text null
    check (
      provider_run_id is null
      or char_length(provider_run_id) between 1 and 255
    ),

  orchestrator_run_id text null
    check (
      orchestrator_run_id is null
      or char_length(orchestrator_run_id) between 1 and 255
    ),

  started_at timestamptz not null default now(),
  finished_at timestamptz null,

  status text not null default 'running'
    check (status in ('running', 'success', 'partial', 'error')),

  received_count integer not null default 0
    check (received_count >= 0),

  inserted_count integer not null default 0
    check (inserted_count >= 0),

  updated_count integer not null default 0
    check (updated_count >= 0),

  error_message text null
    check (
      error_message is null
      or char_length(error_message) <= 2000
    ),

  created_at timestamptz not null default now(),

  constraint collection_runs_profile_identity_uq
    unique (id, monitored_profile_id),

  constraint collection_runs_finished_after_started
    check (finished_at is null or finished_at >= started_at),

  constraint collection_runs_status_finished_consistency
    check (
      (status = 'running' and finished_at is null)
      or
      (status in ('success', 'partial', 'error') and finished_at is not null)
    )
);

create table public.instagram_posts (
  id uuid primary key default gen_random_uuid(),

  monitored_profile_id uuid not null
    references public.monitored_profiles(id)
    on delete restrict,

  instagram_media_id text null,
  instagram_shortcode text null,
  permalink text null,
  published_at timestamptz null,
  caption text null,

  content_type text not null default 'unknown'
    check (
      content_type in ('reel', 'carousel', 'image', 'video', 'unknown')
    ),

  duration_seconds numeric(10,3) null
    check (
      duration_seconds is null
      or duration_seconds >= 0
    ),

  audio_name text null,
  thumbnail_url text null,

  first_collected_at timestamptz not null default now(),
  last_collected_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint instagram_posts_profile_identity_uq
    unique (id, monitored_profile_id),

  constraint instagram_posts_has_identity
    check (
      num_nonnulls(
        instagram_media_id,
        instagram_shortcode,
        permalink
      ) >= 1
    ),

  constraint instagram_posts_collection_order
    check (last_collected_at >= first_collected_at)
);

create table public.post_metric_snapshots (
  id uuid primary key default gen_random_uuid(),

  post_id uuid not null,
  monitored_profile_id uuid not null,
  collection_run_id uuid not null,

  captured_at timestamptz not null,

  views_count bigint null
    check (views_count is null or views_count >= 0),

  plays_count bigint null
    check (plays_count is null or plays_count >= 0),

  likes_count bigint null
    check (likes_count is null or likes_count >= 0),

  comments_count bigint null
    check (comments_count is null or comments_count >= 0),

  shares_count bigint null
    check (shares_count is null or shares_count >= 0),

  saves_count bigint null
    check (saves_count is null or saves_count >= 0),

  created_at timestamptz not null default now(),

  constraint post_metric_snapshots_post_profile_fkey
    foreign key (post_id, monitored_profile_id)
    references public.instagram_posts(id, monitored_profile_id)
    on delete restrict,

  constraint post_metric_snapshots_run_profile_fkey
    foreign key (collection_run_id, monitored_profile_id)
    references public.collection_runs(id, monitored_profile_id)
    on delete restrict,

  constraint post_metric_snapshots_has_observation
    check (
      num_nonnulls(
        views_count,
        plays_count,
        likes_count,
        comments_count,
        shares_count,
        saves_count
      ) >= 1
    ),

  constraint post_metric_snapshots_run_unique
    unique (post_id, collection_run_id)
);

create table public.profile_metric_snapshots (
  id uuid primary key default gen_random_uuid(),

  monitored_profile_id uuid not null,
  collection_run_id uuid not null,

  captured_at timestamptz not null,

  followers_count bigint null
    check (
      followers_count is null
      or followers_count >= 0
    ),

  following_count bigint null
    check (
      following_count is null
      or following_count >= 0
    ),

  posts_count bigint null
    check (
      posts_count is null
      or posts_count >= 0
    ),

  created_at timestamptz not null default now(),

  constraint profile_metric_snapshots_run_profile_fkey
    foreign key (collection_run_id, monitored_profile_id)
    references public.collection_runs(id, monitored_profile_id)
    on delete restrict,

  constraint profile_metric_snapshots_has_observation
    check (
      num_nonnulls(
        followers_count,
        following_count,
        posts_count
      ) >= 1
    ),

  constraint profile_metric_snapshots_run_unique
    unique (monitored_profile_id, collection_run_id)
);

create unique index instagram_posts_media_id_uq
  on public.instagram_posts (instagram_media_id)
  where instagram_media_id is not null;

create unique index instagram_posts_shortcode_uq
  on public.instagram_posts (instagram_shortcode)
  where instagram_shortcode is not null;

create unique index instagram_posts_permalink_uq
  on public.instagram_posts (permalink)
  where permalink is not null;

create index instagram_posts_profile_published_idx
  on public.instagram_posts (
    monitored_profile_id,
    published_at desc
  );

create index instagram_posts_published_idx
  on public.instagram_posts (published_at desc);

create index collection_runs_profile_started_idx
  on public.collection_runs (
    monitored_profile_id,
    started_at desc
  );

create index post_metric_snapshots_post_captured_idx
  on public.post_metric_snapshots (
    post_id,
    captured_at desc
  );

create index post_metric_snapshots_profile_captured_idx
  on public.post_metric_snapshots (
    monitored_profile_id,
    captured_at desc
  );

create index profile_metric_snapshots_profile_captured_idx
  on public.profile_metric_snapshots (
    monitored_profile_id,
    captured_at desc
  );

create or replace function public.set_observed_entity_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger instagram_posts_set_updated_at
before update on public.instagram_posts
for each row
execute function public.set_observed_entity_updated_at();

alter table public.collection_runs enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.post_metric_snapshots enable row level security;
alter table public.profile_metric_snapshots enable row level security;

-- Remover qualquer grant automático/preexistente antes de aplicar
-- a matriz mínima. Não alterar default privileges globais do projeto.
revoke all on table public.collection_runs
  from PUBLIC, anon, authenticated, service_role;

revoke all on table public.instagram_posts
  from PUBLIC, anon, authenticated, service_role;

revoke all on table public.post_metric_snapshots
  from PUBLIC, anon, authenticated, service_role;

revoke all on table public.profile_metric_snapshots
  from PUBLIC, anon, authenticated, service_role;

-- Frontend: somente dados de produto observados.
-- collection_runs permanece server-side only.
grant select on table public.instagram_posts
  to authenticated;

grant select on table public.post_metric_snapshots
  to authenticated;

grant select on table public.profile_metric_snapshots
  to authenticated;

-- Collector server-side: privilégio mínimo.
grant select, insert, update
  on table public.collection_runs
  to service_role;

grant select, insert, update
  on table public.instagram_posts
  to service_role;

grant select, insert
  on table public.post_metric_snapshots
  to service_role;

grant select, insert
  on table public.profile_metric_snapshots
  to service_role;

-- Sem policy de collection_runs para authenticated.
-- service_role ignora RLS; seus limites vêm dos GRANTs acima.

create policy "instagram_posts_select_internal"
on public.instagram_posts
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('viewer', 'editor', 'admin')
);

create policy "post_metric_snapshots_select_internal"
on public.post_metric_snapshots
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('viewer', 'editor', 'admin')
);

create policy "profile_metric_snapshots_select_internal"
on public.profile_metric_snapshots
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('viewer', 'editor', 'admin')
);

-- A função é usada apenas pelo trigger.
-- Não expor RPC direta para nenhum cliente/collector.
revoke execute
  on function public.set_observed_entity_updated_at()
  from PUBLIC, anon, authenticated, service_role;
