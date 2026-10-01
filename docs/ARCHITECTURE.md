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


## Validação real 3.3.3

Uma nova execução manual foi feita após a adaptação canônica.

Novo run/provider job foram criados normalmente, mas o provider retornou 0 registros.

Fluxo observado:

```text
perfil saudável
→ novo collection_run
→ novo provider_run_id
→ provider ready
→ records=0
→ download []
→ Finalizar Run — Erro
```

Nenhum node de upsert de posts/associações/snapshots executou efeito persistente.

O workflow permanece:

- DRAFT;
- active=false;
- sem Schedule Trigger.

Não houve segunda coleta.


## Etapa 3.3.3 — validação real

Uma nova execução manual criou novo collection_run e novo provider_run_id normalmente.

Fluxo observado:

```text
perfil saudável
→ novo collection_run
→ novo provider_run_id
→ provider ready
→ records=0
→ download []
→ run error tratado
```

Nenhum upsert de post/associação/snapshot alterou o banco.

O workflow permanece DRAFT, active=false e sem Schedule Trigger. Não houve segunda coleta.


## Etapa 3.3.4 — Runtime do modelo canônico

O snapshot histórico `sd_muppqcdph8ybzui2r` foi reprocessado sem nova discovery.

Fluxo validado:

```text
snapshot existente
→ normalização canônica
→ upsert instagram_posts
→ upsert monitored_profile_posts
→ post_metric_snapshots
→ collection_run success
```

Resultado:

- 20 registros processados;
- 1 post canônico novo;
- 19 posts canônicos atualizados;
- 1 collaborator;
- 19 author;
- 20 snapshots novos.

O caminho temporário foi removido ao final e o fluxo operacional normal foi restaurado.


## Etapa 3.4 — Reels Enrichment POC

Foi criado workflow separado:

`Trend Radar — Reels Enrichment POC`

ID:

`CWMacm8bwxDXue4w`

Fluxo:

```text
3 Reels existentes
→ novo collection_run
→ um job Bright Data Instagram Reels
→ polling
→ inspeção/match
→ snapshots novos
→ atualização opcional de audio_name
```

O Posts Collector não foi alterado.

Resultado real:

- 3 URLs enviadas;
- 3 resultados matched;
- 3 snapshots;
- views NULL em 3/3;
- video_play_count NULL em 3/3;
- likes/comments disponíveis;
- nenhum audio_name utilizável;
- 0 posts canônicos atualizados.

O workflow permanece DRAFT/active=false/sem Schedule.


## Etapa 3.4.2 — Reels Views Discovery Diagnostic

Workflow isolado:

`Trend Radar — Reels Views Discovery Diagnostic`

ID:

`0dnlSxCbcENJR4E4`

Fluxo:

```text
perfil saudável
→ carregar Reels canônicos existentes
→ novo collection_run
→ Bright Data discover_new / discover_by=url
→ num_of_posts=1
→ match seguro com post existente
→ snapshot diagnóstico
```

A execução única retornou um Reel existente, mas:

- views = NULL;
- video_play_count = NULL;
- likes/comments presentes.

Os workflows de Posts e Reels Enrichment não foram alterados.

Conclusão arquitetural atual:

views/plays permanecem métricas opcionais e não devem bloquear frontend/analytics baseados em likes/comments/followers.
