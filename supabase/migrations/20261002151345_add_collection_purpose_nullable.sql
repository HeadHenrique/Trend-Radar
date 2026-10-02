alter table public.collection_runs
  add column collection_purpose text;

alter table public.collection_runs
  add constraint collection_runs_collection_purpose_check
  check (
    collection_purpose is null
    or collection_purpose = any (
      array[
        'profile_metadata'::text,
        'posts_snapshot'::text,
        'posts_reprocess'::text,
        'post_metrics_enrichment'::text,
        'post_metrics_diagnostic'::text
      ]
    )
  );
