# API Spec

## Estado atual

A fundação de posts está persistindo dados reais via n8n.

Ainda não existe repository/UI frontend de Posts nesta etapa.

## Workflow de ingestão

`Trend Radar — Posts Collector POC`

ID:

`q9XBNlb3PsxsyULl`

Estado:

- DRAFT;
- active=false;
- Manual Trigger;
- sem Schedule Trigger.

## Entrada

Seleciona dinamicamente um perfil:

- active=true;
- monitoring_status=healthy;
- limite 1;
- prioridade ascendente.

O perfil não fica hardcoded na versão final.

## Collection run

Antes do provider:

- collection_type=posts;
- provider_key=bright_data;
- orchestrator=n8n;
- orchestrator_run_id real quando disponível;
- status=running.

Após o trigger, `provider_run_id` recebe o ID real do job.

## Provider contract observado

Mapping:

- post_id → instagram_media_id;
- shortcode → instagram_shortcode;
- url → permalink;
- date_posted → published_at;
- description → caption;
- content_type → content_type;
- thumbnail → thumbnail_url;
- videos_duration[0].video_duration → duration_seconds;
- likes → likes_count;
- num_comments → comments_count.

Ausentes no primeiro batch:

- views;
- plays;
- shares;
- saves;
- áudio utilizável.

Ausência permanece NULL.

## Deduplicação

Lookup na ordem:

1. instagram_media_id;
2. instagram_shortcode;
3. permalink.

Post existente preserva valor anterior quando o novo payload retorna NULL.

Posts são processados um por vez para manter item pairing correto no n8n.

## Snapshots

Snapshot só é criado quando ao menos uma métrica é observada.

Antes do INSERT é verificado se já existe `post_id + collection_run_id`, permitindo recovery/replay idempotente.

## Resultado da primeira POC

Provider:

- solicitado: 20;
- retornado: 20.

Persistido:

- 19 posts;
- 19 snapshots de post;
- 0 snapshots de perfil.

Um registro foi rejeitado porque `user_posted` não correspondia ao perfil solicitado.

Detalhes completos:

`docs/POSTS_INGESTION_POC.md`
