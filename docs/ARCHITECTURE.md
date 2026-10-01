# Architecture

## Stack

- React + TypeScript + Vite;
- Supabase Auth + PostgreSQL/RLS;
- n8n;
- Bright Data Instagram scrapers atrás de adapter;
- Vercel.

## Fluxo implementado

### Perfil

```text
monitored_profiles
  ↑
Trend Radar — Profile Collector POC
  ↑
Bright Data Instagram Profiles
```

### Posts

```text
monitored_profiles
  ↓
Trend Radar — Posts Collector POC
  ↓
collection_runs
  ↓
Bright Data Instagram Posts discovery
  ↓
polling provider_run_id
  ↓
InstagramProviderPostsResult
  ↓
deduplicação item a item
  ↓
instagram_posts
  ↓
post_metric_snapshots
```

Workflow de Posts:

- ID: `q9XBNlb3PsxsyULl`;
- DRAFT;
- active=false;
- Manual Trigger;
- sem Schedule Trigger;
- limite de 20 enviado ao provider;
- seleção dinâmica de perfil saudável;
- sem `leonardofroese` hardcoded na versão final.

## Idempotência

O collector:

1. cria collection run antes do provider;
2. persiste provider_run_id;
3. reutiliza run/job em recovery;
4. deduplica por media ID → shortcode → permalink;
5. processa posts um a um;
6. verifica snapshot existente antes de inserir;
7. finaliza run com success/partial/error.

A Etapa 3.3 provou idempotência reutilizando o mesmo provider snapshot: posts permaneceram em 19 e snapshots em 19.

## Segurança

Frontend permanece sem service role.

- collection_runs: server-side only;
- posts/snapshots: leitura via RLS para roles internas;
- n8n usa credenciais server-side armazenadas no cofre;
- nenhum secret foi versionado.

## Métricas

O primeiro batch real entregou comentários e likes parcialmente.

Não entregou views, plays, shares ou saves.

Não existe enriquecimento adicional com Reels Scraper nesta etapa.

Detalhes:

`docs/POSTS_INGESTION_POC.md`
