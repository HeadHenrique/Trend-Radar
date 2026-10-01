create index post_metric_snapshots_profile_post_idx
  on public.post_metric_snapshots (
    monitored_profile_id,
    post_id
  );
