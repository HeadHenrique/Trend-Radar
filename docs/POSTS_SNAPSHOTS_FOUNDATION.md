# Posts & Snapshots Foundation — Etapa 3.1

> **DRAFT — NÃO APLICADO**
>
> Este documento descreve arquitetura e contrato de dados. Nenhuma migration foi criada/aplicada, nenhuma tabela foi criada e o workflow n8n não foi alterado.

## 1. Estado real reinspecionado

Em 01/10/2026:

- o schema `public` possui somente `monitored_profiles`;
- existe uma única migration aplicada: `20260930195835_create_monitored_profiles_foundation`;
- não existem tabelas de posts;
- não existem snapshots de posts;
- não existem snapshots de perfil;
- não existe `collection_runs`;
- `Trend Radar — Profile Collector POC` continua DRAFT, sem versão ativa;
- o workflow atual seleciona `active=true` + `monitoring_status=pending`;
- nenhuma chamada nova ao provider foi realizada nesta etapa.

A execução real já existente da Etapa 3 foi apenas inspecionada. O payload observado continha 12 posts no objeto de perfil. Os campos observados no primeiro post foram:

- `caption`;
- `datetime`;
- `id`;
- `image_url`;
- `post_hashtags`;
- `content_type`;
- `url`.

Nesse payload não foram observados campos de views, plays, likes, comments, shares ou saves.

## 2. Princípio: dados observados

Posts e snapshots armazenam somente fatos observáveis.

Não pertencem a esta fundação:

- tema;
- subtema;
- hook;
- CTA interpretado;
- estrutura;
- formato interpretado por IA;
- Trend Score;
- Opportunity Score;
- Brazil Gap.

Esses campos deverão ficar em entidades analíticas futuras, sem contaminar a camada canônica observada.

## 3. Nome da tabela de posts

### Opção: `monitored_posts`

Prós:

- combina semanticamente com `monitored_profiles`;
- poderia sugerir abstração futura para outras plataformas.

Contras:

- a entidade proposta possui identidade e semântica específicas do Instagram;
- nomes como `instagram_media_id`, `instagram_shortcode` e permalink do Instagram tornam o nome genérico artificial.

### Opção: `instagram_posts`

Prós:

- deixa a plataforma explícita;
- evita fingir uma abstração cross-platform que ainda não existe;
- continua independente do provider: Instagram é domínio/plataforma, Bright Data é fornecedor.

### Decisão recomendada

`instagram_posts`.

Provider independence não exige platform independence.

## 4. Schema proposto: instagram_posts

| Campo | Tipo | Null | Default | Regra / justificativa |
|---|---|---:|---|---|
| id | uuid | não | gen_random_uuid() | PK interna estável |
| monitored_profile_id | uuid | não | — | FK para monitored_profiles |
| instagram_media_id | text | sim | — | melhor identidade quando provider entrega ID real |
| instagram_shortcode | text | sim | — | fallback forte e útil para URLs |
| permalink | text | sim | — | fallback final, armazenado de forma canônica |
| published_at | timestamptz | sim | — | horário observado; NULL se provider não entregar |
| caption | text | sim | — | conteúdo observado |
| content_type | text | não | 'unknown' | CHECK canônico |
| duration_seconds | numeric(10,3) | sim | — | somente quando realmente observável |
| audio_name | text | sim | — | somente quando provider entregar áudio/nome real |
| thumbnail_url | text | sim | — | preview observado; URL pode expirar |
| first_collected_at | timestamptz | não | now() | primeira observação pelo sistema |
| last_collected_at | timestamptz | não | now() | última vez que o post foi observado |
| created_at | timestamptz | não | now() | auditoria técnica |
| updated_at | timestamptz | não | now() | atualização da linha canônica |

### Decisões adicionais

- não armazenar followers no post;
- não armazenar métricas de performance diretamente como única verdade da linha canônica;
- não criar cache de métricas mais recentes no post nesta fase;
- se a UI precisar de latest metrics, inicialmente buscar o snapshot mais recente;
- somente considerar cache depois de medir necessidade real.

## 5. Content type

Recomendação:

`TEXT + CHECK`

Valores canônicos:

- `reel`;
- `carousel`;
- `image`;
- `video`;
- `unknown`.

Justificativa:

- conjunto pequeno;
- fácil de versionar;
- não precisa de tabela de referência no MVP;
- evita enum PostgreSQL prematuro.

### Mapeamento conservador observado

Na execução da Etapa 3 o provider retornou valores como:

- `Video` → `video`;
- `Carousel` → `carousel`;
- `Image` → `image`.

`reel` só deve ser usado quando a origem fornecer informação observável suficiente para afirmar Reel. Não transformar todo `Video` em `reel`.

## 6. Identidade e deduplicação

Ordem de identidade:

1. `instagram_media_id` real;
2. `instagram_shortcode` real;
3. `permalink` canônico.

Nunca:

- gerar media ID artificial;
- usar caption como identidade;
- usar título/nome como identidade;
- usar username como identidade do post.

### Constraints/uniques

Recomendação:

- unique parcial em `instagram_media_id` quando não NULL;
- unique parcial em `instagram_shortcode` quando não NULL;
- unique parcial em `permalink` quando não NULL;
- CHECK exigindo pelo menos uma das três identidades.

Shortcode não deve ser lowercased: é tratado como identidade case-sensitive.

### Canonical permalink

Antes do upsert:

- remover query string e fragment;
- normalizar host para Instagram;
- manter rota/shortcode;
- não depender de parâmetros de tracking.

## 7. Relação com monitored_profiles

`instagram_posts.monitored_profile_id → monitored_profiles.id`

Recomendação:

`ON DELETE RESTRICT`.

Motivo:

- perfis não usam DELETE físico como fluxo normal;
- posts e snapshots representam histórico;
- CASCADE apagaria histórico por uma ação administrativa acidental.

## 8. Schema proposto: post_metric_snapshots

Objetivo: guardar evolução temporal de métricas sem sobrescrever a verdade anterior.

| Campo | Tipo | Null | Default | Regra |
|---|---|---:|---|---|
| id | uuid | não | gen_random_uuid() | PK |
| post_id | uuid | não | — | FK instagram_posts |
| collection_run_id | uuid | não | — | idempotência/observabilidade |
| captured_at | timestamptz | não | — | horário observado explícito |
| views_count | bigint | sim | — | >= 0 |
| plays_count | bigint | sim | — | >= 0 |
| likes_count | bigint | sim | — | >= 0 |
| comments_count | bigint | sim | — | >= 0 |
| shares_count | bigint | sim | — | >= 0 |
| saves_count | bigint | sim | — | >= 0 |
| created_at | timestamptz | não | now() | auditoria técnica |

Recomendação adicional:

- snapshots são imutáveis;
- não conceder UPDATE ao collector;
- inserir snapshot somente se pelo menos uma métrica tiver sido realmente observada.

## 9. NULL versus ZERO

Regra obrigatória:

- `0` = provider informou zero;
- `NULL` = métrica indisponível, não entregue ou não observada.

Nunca converter ausência para zero.

Isso evita interpretar "provider não fornece saves" como "o post teve zero saves".

## 10. Views versus plays

Manter campos separados.

Não assumir:

- `views = plays`;
- `video_views = reel_plays`;
- qualquer equivalência não documentada.

### Estado observado do provider atual

Na execução já existente do Profile Collector:

- os objetos de post não continham `views`;
- não continham `plays`;
- não continham `likes`;
- não continham `comments`;
- não continham `shares`;
- não continham `saves`.

Portanto, a arquitetura deixa todas essas métricas nullable.

A próxima implementação deve testar o endpoint/dataset específico de posts e criar um mapping documentado campo a campo. Se o provider retornar uma métrica ambígua, não preencher nenhuma coluna por aproximação.

## 11. Schema proposto: profile_metric_snapshots

Objetivo: preservar evolução do perfil enquanto `monitored_profiles.followers_count` continua funcionando como cache do valor mais recente.

| Campo | Tipo | Null | Default | Regra |
|---|---|---:|---|---|
| id | uuid | não | gen_random_uuid() | PK |
| monitored_profile_id | uuid | não | — | FK |
| collection_run_id | uuid | não | — | idempotência |
| captured_at | timestamptz | não | — | horário observado |
| followers_count | bigint | sim | — | >= 0 |
| following_count | bigint | sim | — | >= 0 |
| posts_count | bigint | sim | — | >= 0 |
| created_at | timestamptz | não | now() | auditoria |

A execução observada da Etapa 3 mostrou que o provider atual entrega:

- `followers`;
- `following`;
- `posts_count`.

Mesmo assim, todos permanecem nullable no contrato canônico para não acoplar schema a um único provider.

## 12. Idempotência de snapshots

### A) unique(post_id, captured_at)

Simples, mas depende de igualdade exata de timestamp e pode falhar em retries que recalculam o horário.

### B) collection_run_id

Mais robusto: todos os efeitos de uma mesma execução lógica compartilham um ID.

### C) time bucket

Útil para agregação, mas transforma política de frequência em identidade e pode colidir com coletas legítimas.

### Decisão recomendada

Usar `collection_run_id`:

- `UNIQUE(post_id, collection_run_id)`;
- `UNIQUE(monitored_profile_id, collection_run_id)`.

O collector deve criar o run uma vez e reutilizar o mesmo ID durante retries internos.

Uma execução nova deliberada cria um run novo e representa uma nova observação.

## 13. Collection runs

### Sem collection_runs

Prós:

- uma tabela a menos.

Contras:

- retries ficam mais frágeis;
- debugging depende apenas do n8n;
- difícil explicar quantos posts foram recebidos/inseridos/atualizados;
- snapshots perdem uma chave natural de idempotência.

### Com collection_runs agora

Prós:

- idempotência simples;
- observabilidade;
- auditoria de ingestão;
- base para debugging;
- contadores de batch;
- associa profile snapshot e post snapshots à mesma coleta lógica.

Custo:

- uma tabela pequena;
- workflow precisa abrir/finalizar o run.

### Decisão recomendada

Criar `collection_runs` na futura implementação.

Campos:

| Campo | Tipo | Null | Default |
|---|---|---:|---|
| id | uuid | não | gen_random_uuid() |
| monitored_profile_id | uuid | não | — |
| collection_type | text | não | — |
| source | text | não | — |
| started_at | timestamptz | não | now() |
| finished_at | timestamptz | sim | — |
| status | text | não | 'running' |
| received_count | integer | não | 0 |
| inserted_count | integer | não | 0 |
| updated_count | integer | não | 0 |
| error_message | text | sim | — |
| created_at | timestamptz | não | now() |

`collection_type`:

- `profile`;
- `posts`;
- `profile_and_posts`.

`status`:

- `running`;
- `success`;
- `partial`;
- `error`.

`source` é origem operacional genérica, por exemplo `n8n`, e não nome de provider.

## 14. Provider independence

As entidades canônicas não terão:

- `brightdata_id`;
- `brightdata_post`;
- `brightdata_payload`.

O adapter é responsável por traduzir provider → contrato canônico.

### Raw payload

Não armazenar payload completo por padrão.

Motivos:

- volume;
- dados desnecessários;
- acoplamento;
- maior superfície de privacidade/segurança.

Se no futuro for necessária auditoria de raw payload, criar armazenamento separado com retenção explícita e escopo bem definido.

## 15. Segurança, RLS e grants

Todas as quatro tabelas propostas terão RLS habilitado.

### anon

Sem acesso.

### authenticated com role viewer/editor/admin

Somente SELECT.

### authenticated

Sem:

- INSERT de posts;
- UPDATE de posts;
- DELETE;
- INSERT/UPDATE de snapshots;
- alteração de métricas;
- criação de collection runs.

### backend/n8n

Escrita via credencial server-side.

Princípio de menor privilégio proposto:

- `instagram_posts`: SELECT, INSERT, UPDATE;
- `collection_runs`: SELECT, INSERT, UPDATE;
- `post_metric_snapshots`: SELECT, INSERT;
- `profile_metric_snapshots`: SELECT, INSERT;
- DELETE não é necessário para o collector.

## 16. Índices

### instagram_posts

1. unique parcial em `instagram_media_id`;
2. unique parcial em `instagram_shortcode`;
3. unique parcial em `permalink`;
4. `(monitored_profile_id, published_at desc)`;
5. `(published_at desc)` para biblioteca global de recentes.

Não criar índice isolado de `content_type` inicialmente: baixa cardinalidade + escala pequena. Reavaliar se a biblioteca passar a filtrar intensamente por tipo.

### post_metric_snapshots

- unique `(post_id, collection_run_id)`;
- `(post_id, captured_at desc)`.

### profile_metric_snapshots

- unique `(monitored_profile_id, collection_run_id)`;
- `(monitored_profile_id, captured_at desc)`.

### collection_runs

- `(monitored_profile_id, started_at desc)`.

## 17. Escala e retenção

Escala inicial prevista:

- dezenas de perfis;
- centenas ou poucos milhares de posts;
- múltiplos snapshots por post.

Não particionar agora.

Com 100 perfis e 20 posts por perfil, a base canônica ainda é pequena. O crescimento relevante vem dos snapshots: manter 4 snapshots por dia para todos os posts indefinidamente faria a tabela crescer muito mais rápido que `instagram_posts`.

Por isso a frequência deve cair conforme o post envelhece.

Não apagar histórico automaticamente nesta fase.

Particionamento só deve ser reavaliado quando snapshots chegarem a dezenas de milhões de linhas, ou quando manutenção/consultas temporais demonstrarem necessidade real.

## 18. Contrato: InstagramProviderPostResult

```ts
type InstagramObservedContentType =
  | 'reel'
  | 'carousel'
  | 'image'
  | 'video'
  | 'unknown'

type InstagramProviderPostMetrics = {
  views: number | null
  plays: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
}

type InstagramProviderPostResult = {
  instagramMediaId: string | null
  shortcode: string | null
  permalink: string | null
  publishedAt: string | null
  caption: string | null
  contentType: InstagramObservedContentType
  durationSeconds: number | null
  audioName: string | null
  thumbnailUrl: string | null
  metrics: InstagramProviderPostMetrics
}
```

### Justificativas

- `instagramMediaId`: identidade preferencial;
- `shortcode`: fallback forte;
- `permalink`: fallback final e navegação;
- `publishedAt`: ordenação temporal;
- `caption`: conteúdo observado;
- `contentType`: provider/URL observável, não IA;
- `durationSeconds`: útil para vídeo/reel quando disponível;
- `audioName`: útil para tendências somente quando observado;
- `thumbnailUrl`: UI;
- `metrics`: valores observados nullable.

## 19. Contrato de batch

```ts
type InstagramProviderPostsResult = {
  profileUsername: string
  fetchedAt: string
  posts: InstagramProviderPostResult[]
  nextCursor?: string | null
  hasMore?: boolean | null
}
```

`nextCursor` e `hasMore` são opcionais.

Regra:

- expor paginação no contrato somente quando o adapter/provider realmente precisar;
- não colocar parâmetros específicos de Bright Data no domínio.

## 20. Limite inicial recomendado

Recomendação para primeira ingestão:

`20 posts recentes por perfil`.

Motivos:

- suficiente para criar baseline inicial;
- baixo volume para validar deduplicação;
- permite testar carrossel/imagem/vídeo/reel quando presentes;
- reduz consumo de provider enquanto o pipeline ainda está sendo validado.

Não aumentar para 30 antes de medir cobertura real dos primeiros perfis.

## 21. Frequência futura de snapshots

Estratégia inicial recomendada por idade:

- 0–24h: a cada 2 horas;
- 24–72h: a cada 6 horas;
- 3–7 dias: a cada 24 horas;
- >7 dias: sem snapshot recorrente por padrão; reavaliar apenas posts selecionados/ativos em análises futuras.

Justificativa:

- a aceleração mais útil acontece nas primeiras horas/dias;
- reduzir frequência evita crescimento desnecessário;
- a política pode ser calibrada depois com dados reais de velocidade.

Não implementar scheduler nesta etapa.

## 22. Correção futura do Profile Collector

Estado atual:

```text
active = true
AND monitoring_status = pending
```

Isso funciona para primeira resolução, mas não para recorrência.

Estratégia futura:

```text
active = true
AND (
  next_collection_at IS NULL
  OR next_collection_at <= now()
)
```

Tratamento por status:

- `pending`: primeira resolução;
- `healthy`: recolher quando `next_collection_at` vencer;
- `error`: retry controlado/backoff, também orientado por `next_collection_at`.

Não alterar o workflow nesta etapa.

## 23. Fluxo futuro de ingestão

### Posts

```text
monitored_profiles
→ selecionar perfil elegível
→ abrir collection_run
→ provider de posts
→ normalizar InstagramProviderPostsResult
→ resolver identidade/deduplicar
→ upsert instagram_posts
→ inserir post_metric_snapshots
→ finalizar collection_run
```

### Perfil

```text
coleta de perfil
→ abrir/reusar collection_run
→ atualizar cache monitored_profiles
→ inserir profile_metric_snapshot
→ finalizar collection_run
```

## 24. SQL DRAFT — NÃO APLICADO

```sql
-- DRAFT — NÃO APLICADO
-- Revisar e autorizar antes de transformar em migration.

create table public.collection_runs (
  id uuid primary key default gen_random_uuid(),
  monitored_profile_id uuid not null
    references public.monitored_profiles(id)
    on delete restrict,
  collection_type text not null
    check (collection_type in ('profile', 'posts', 'profile_and_posts')),
  source text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz null,
  status text not null default 'running'
    check (status in ('running', 'success', 'partial', 'error')),
  received_count integer not null default 0 check (received_count >= 0),
  inserted_count integer not null default 0 check (inserted_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  error_message text null
    check (error_message is null or char_length(error_message) <= 2000),
  created_at timestamptz not null default now(),
  constraint collection_runs_finished_after_started
    check (finished_at is null or finished_at >= started_at)
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
    check (content_type in ('reel', 'carousel', 'image', 'video', 'unknown')),
  duration_seconds numeric(10,3) null
    check (duration_seconds is null or duration_seconds >= 0),
  audio_name text null,
  thumbnail_url text null,
  first_collected_at timestamptz not null default now(),
  last_collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint instagram_posts_has_identity
    check (num_nonnulls(instagram_media_id, instagram_shortcode, permalink) >= 1),
  constraint instagram_posts_collection_order
    check (last_collected_at >= first_collected_at)
);

create table public.post_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null
    references public.instagram_posts(id)
    on delete restrict,
  collection_run_id uuid not null
    references public.collection_runs(id)
    on delete restrict,
  captured_at timestamptz not null,
  views_count bigint null check (views_count is null or views_count >= 0),
  plays_count bigint null check (plays_count is null or plays_count >= 0),
  likes_count bigint null check (likes_count is null or likes_count >= 0),
  comments_count bigint null check (comments_count is null or comments_count >= 0),
  shares_count bigint null check (shares_count is null or shares_count >= 0),
  saves_count bigint null check (saves_count is null or saves_count >= 0),
  created_at timestamptz not null default now(),
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
  monitored_profile_id uuid not null
    references public.monitored_profiles(id)
    on delete restrict,
  collection_run_id uuid not null
    references public.collection_runs(id)
    on delete restrict,
  captured_at timestamptz not null,
  followers_count bigint null check (followers_count is null or followers_count >= 0),
  following_count bigint null check (following_count is null or following_count >= 0),
  posts_count bigint null check (posts_count is null or posts_count >= 0),
  created_at timestamptz not null default now(),
  constraint profile_metric_snapshots_has_observation
    check (
      num_nonnulls(followers_count, following_count, posts_count) >= 1
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
  on public.instagram_posts (monitored_profile_id, published_at desc);

create index instagram_posts_published_idx
  on public.instagram_posts (published_at desc);

create index post_metric_snapshots_post_captured_idx
  on public.post_metric_snapshots (post_id, captured_at desc);

create index profile_metric_snapshots_profile_captured_idx
  on public.profile_metric_snapshots (monitored_profile_id, captured_at desc);

create index collection_runs_profile_started_idx
  on public.collection_runs (monitored_profile_id, started_at desc);

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

revoke all on table public.collection_runs from public, anon, authenticated;
revoke all on table public.instagram_posts from public, anon, authenticated;
revoke all on table public.post_metric_snapshots from public, anon, authenticated;
revoke all on table public.profile_metric_snapshots from public, anon, authenticated;

grant select on table public.collection_runs to authenticated;
grant select on table public.instagram_posts to authenticated;
grant select on table public.post_metric_snapshots to authenticated;
grant select on table public.profile_metric_snapshots to authenticated;

grant select, insert, update on table public.collection_runs to service_role;
grant select, insert, update on table public.instagram_posts to service_role;
grant select, insert on table public.post_metric_snapshots to service_role;
grant select, insert on table public.profile_metric_snapshots to service_role;

create policy "collection_runs_select_internal"
on public.collection_runs
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('viewer', 'editor', 'admin')
);

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

revoke execute on function public.set_observed_entity_updated_at()
from public, anon, authenticated;
```

## 25. Decisões que exigem autorização antes da implementação

Antes de criar migration:

1. aprovar o nome `instagram_posts`;
2. aprovar a inclusão de `collection_runs`;
3. aprovar `ON DELETE RESTRICT`;
4. aprovar as quatro tabelas propostas;
5. aprovar `collection_run_id` como chave de idempotência;
6. aprovar limite inicial de 20 posts;
7. aprovar política conceitual de snapshots por idade;
8. autorizar explicitamente a migration da Etapa 3.1;
9. autorizar separadamente qualquer alteração no n8n para coleta de posts.
