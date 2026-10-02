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


## Etapa 4.0 — Profile/Competitor UX

A camada de produto agora reutiliza a mesma infraestrutura para perfis próprios, referências, trendsetters e concorrentes.

```text
/profiles
/competitors
   ↓
ProfileListTable
ProfileEditorDrawer
ProfileDetailDrawer
   ↓
profilesRepository
   ├─ monitored_profiles
   ├─ monitored_profile_posts
   └─ instagram_posts
```

### Profile details

`profilesRepository.getProfileDetails(profileId)`:

1. busca associações em `monitored_profile_posts`;
2. obtém os post IDs;
3. busca posts em `instagram_posts`;
4. calcula, na escala atual:
   - conteúdos monitorados;
   - Reels;
   - collabs;
5. retorna até 3 conteúdos recentes.

Nenhuma RPC ou migration foi criada.

### Competitors

Concorrente continua sendo:

`monitored_profiles.profile_group = 'competitor'`

Não existe tabela `competitors`.

A tela específica trava o grupo como competitor no create/edit, mas a tela geral de Profiles continua podendo editar o grupo.

### Autorização

- viewer: leitura/detalhes;
- editor/admin: criação/edição/pausa;
- DELETE continua inexistente.

### Dados

Followers usa exclusivamente `monitored_profiles.followers_count`.

Dados nulos são apresentados como insuficientes/não informados; nenhuma métrica analítica foi inventada.


## Etapa 4.1 — Profile Collector recorrente

O Profile Collector deixou de depender de `monitoring_status=pending`.

Workflow:

`Trend Radar — Profile Collector POC`

ID:

`BijTnAz2cSLTMzva`

Fluxo atual:

```text
active profiles
→ selecionar 1 elegível por next_collection_at
→ collection_run(profile)
→ Bright Data Profile Scraper
→ normalizar + validar identidade
→ monitored_profiles
→ profile_metric_snapshots
→ finalizar collection_run
```

Elegibilidade:

```text
active = true
status ∈ pending | healthy | error
next_collection_at IS NULL OR <= agora
```

Frequência provisória:

- prioridade 1: +1h;
- prioridade 2: +6h;
- prioridade 3: +24h;
- error: +6h.

O Profile Scraper é a única source of truth de followers_count.

Execução 13 validou:

- healthy recurrence;
- collection run;
- provider_run_id;
- followers 2767;
- following 286;
- posts_count 226;
- primeiro profile_metric_snapshot;
- success counters 1/0/1.

Workflow continua DRAFT/active=false/sem Schedule Trigger.


## Etapa 4.2 — Biblioteca /posts

A página /posts usa uma camada de domínio própria e não consulta Supabase diretamente.

Fluxo:

    /posts
      ↓
    PostsToolbar + PostCard + PostDetailDrawer
      ↓
    postsRepository
      ├─ instagram_posts
      ├─ monitored_profile_posts
      ├─ monitored_profiles
      └─ post_metric_snapshots

### Modelo de leitura

O repository carrega as quatro fontes em lote.

Não existe request N+1 por card.

A chave visual continua sendo instagram_posts.id, portanto múltiplas associações não duplicam o post.

Snapshots são agrupados por:

    post_id + monitored_profile_id

Para cada contexto é retido somente o snapshot com captured_at mais recente. O item canônico expõe a observação mais recente entre seus contextos apenas para apresentação, além da contagem histórica de snapshots.

### Semântica de métricas

NULL significa dado indisponível.

A UI não converte NULL para zero.

Likes e comments usam a última observação disponível.

Views, plays, shares e saves só são renderizados quando não são NULL.

Followers continua pertencendo ao perfil e não é tratado como métrica de post.

### Collab

Dc9H9yExV6q é um único instagram_posts.

Autoria canônica:

    joseantoniodiferenciagro

Associação monitorada:

    Leonardo Froese → collaborator

O drawer apresenta as duas identidades sem transformar o perfil monitorado no autor original.

### Limites desta etapa

Não foram adicionados:

- player de vídeo;
- Trend Score;
- IA;
- RPC;
- migration;
- alteração de schema;
- alteração de n8n;
- chamada Bright Data;
- scheduler.


## Etapa 4.3 — onboarding inicial de posts multi-perfil

O Posts Collector deixou de usar `limit 1` diretamente sobre os perfis healthy como decisão final.

Fluxo atual de onboarding inicial:

```text
monitored_profiles
  active=true
  healthy
  limit 50
        ↓
collection_runs
  collection_type=posts
        ↓
Code: Selecionar Perfil para Onboarding
  excluir profile com run success/partial
  priority ASC
  created_at ASC
        ↓
Criar Collection Run
        ↓
Bright Data Posts
        ↓
pipeline canônico existente
```

Um run `error` não marca onboarding como concluído.

Esta regra resolve somente a primeira coleta de posts. Não existe ainda política de recorrência de posts.

### Validação real N:N

Raphael Costa foi o primeiro competitor real onboardado ponta a ponta.

Profile Collector:

- execution 14;
- profile run a0300964-b92d-4b25-bb99-125dbd3ccf06;
- metadata real + profile snapshot;
- healthy.

Posts Collector:

- execution 15;
- posts run cf9f4140-4ea7-46f6-9f35-4c22a4e54de0;
- 20 posts reais;
- 20 inserts canônicos;
- 20 associações;
- 20 snapshots;
- 19 author + 1 collaborator.

Nenhum post compartilhado com Leonardo foi observado nesse batch. Portanto a possibilidade de duas associações para um mesmo post permanece estruturalmente suportada, mas não foi exercitada entre esses dois perfis nesta coleta.

Nenhum schema/RPC/migration foi adicionado.


## Etapa 4.4 — validação com segundo competitor

A arquitetura de onboarding inicial foi validada com um segundo concorrente sem alteração estrutural.

```text
helio.tatsuo pending
→ Profile Collector
→ metadata real + profile snapshot
→ healthy
→ Posts Collector
→ seleção automática sem run posts success/partial
→ 20 conteúdos
→ posts canônicos
→ associações
→ post snapshots
```

Resultado: Profile Collector execution 16, Posts Collector execution 17, 20 novos posts canônicos, 20 associações author, 20 snapshots, nenhum overlap real com Leonardo/Raphael e nenhum duplicado global.

Estado final: Leonardo own/healthy/20 associações; Raphael competitor/healthy/20; Hélio competitor/healthy/20.

Não houve alteração de schema, migration, frontend ou workflow na Etapa 4.4.


## Etapa 4.5 — Trend Engine V0 (especificação)

Nenhum engine foi implementado.

Fluxo conceitual futuro:

```text
canonical posts + associations + snapshots
        ↓
observable feature extraction
        ↓
semantic feature extraction (future AI)
        ↓
signal aggregation by scope/window
        ↓
adoption + overlap + temporal metrics
        ↓
performance baseline/lift
        ↓
data confidence
        ↓
TrendCandidate
        ↓
Trend Score + maturity
```

### Princípio temporal

Sem velocity ou persistence válida existe somente sinal observado.

Trend Score fica indisponível.

### Baseline

Baseline primário:

`profile + content_type + metric_basis`

Mediana é escolhida sobre média.

A base real demonstra o motivo:

Leonardo Reel possui median likes = 13 e mean likes = 643,50.

### Metric semantics

`observed_interactions = likes + comments` somente quando ambos forem observados.

NULL nunca vira zero.

### IA

IA futura gera semantic features estruturadas.

O motor quantitativo calcula adoção, velocidade, lift, confiança e score.

LLM não gera Trend Score diretamente.

### Collection lineage

`collection_type=posts` hoje mistura:

- posts snapshot;
- reprocess;
- enrichment;
- diagnostic.

Proposta futura:

`collection_purpose`

Valores:

- profile_metadata;
- posts_snapshot;
- posts_reprocess;
- post_metrics_enrichment;
- post_metrics_diagnostic.

Nenhuma migration foi criada nesta etapa.

### Estado de suficiência

Hoje:

- 3 profiles;
- 60 posts;
- 60 associations;
- 83 post snapshots;
- 3 profile snapshots.

A base é suficiente para sinais estáticos e especificação do engine.

Não existe série uniforme suficiente para velocity, acceleration, maturity ou Trend Score temporal.
