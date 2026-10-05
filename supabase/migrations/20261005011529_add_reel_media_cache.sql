alter table public.instagram_posts
  add column video_storage_path text null,
  add column video_cached_at timestamptz null;

alter table public.instagram_posts
  add constraint instagram_posts_video_cache_consistency
  check (video_storage_path is not null or video_cached_at is null);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'reel-media-cache',
  'reel-media-cache',
  false,
  67108864,
  array['video/mp4','video/quicktime','video/webm','application/octet-stream']::text[]
)
on conflict (id) do nothing;

create policy "trend_radar_authenticated_read_reel_media_cache"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'reel-media-cache'
  and coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'trend_radar_role') in ('viewer','editor','admin'),
    false
  )
);
