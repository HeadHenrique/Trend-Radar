# Architecture

## Stack

- React + TypeScript + Vite
- Supabase Auth/PostgreSQL/RLS
- n8n
- Bright Data atrás de adapter
- Vercel

## Modelo de posts

```text
monitored_profiles
        │
        └─ monitored_profile_posts
              │
              └─ instagram_posts (canônico global)
                       │
                       └─ post_metric_snapshots
```

## Posts Collector

Workflow:

`Trend Radar — Posts Collector POC`

ID:

`q9XBNlb3PsxsyULl`

Estado:

- DRAFT
- active=false
- sem Schedule Trigger
- não executado na Etapa 3.3.2

Fluxo adaptado:

```text
perfil saudável
→ abrir collection_run
→ provider
→ normalizar post + autor + hashtags + coauthors
→ deduplicar post global
→ upsert instagram_posts
→ resolver monitored_profile_posts
→ snapshot somente após associação
→ finalizar run
```

## Association evidence

Ordem de força:

`discovered < collaborator < author`

O collector não rebaixa evidência anterior.

## Replay

Run terminal não entra na persistência.

Guard:

`Run processável?`

Somente `running` continua.

Finalizadores também filtram por `status=running`.

## Recovery

Recovery de erro permanece explícito e deve reutilizar:

- mesmo collection_run;
- mesmo provider_run_id.

`orchestrator_run_id` permanece o ID da execução original.

## Segurança

Nenhuma credencial foi movida para código/GitHub.

Workflow preserva:

- `Supabase account`;
- `Trend Radar — Bright Data API`.
