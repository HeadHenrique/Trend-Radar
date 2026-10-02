alter table public.collection_runs
  alter column collection_purpose set not null;

alter table public.collection_runs
  add constraint collection_runs_type_purpose_compatible_check
  check (
    (
      collection_purpose = 'profile_metadata'
      and collection_type in ('profile','profile_and_posts')
    )
    or
    (
      collection_purpose in (
        'posts_snapshot',
        'posts_reprocess',
        'post_metrics_enrichment',
        'post_metrics_diagnostic'
      )
      and collection_type in ('posts','profile_and_posts')
    )
  );
