# Posts & Snapshots Foundation — Etapa 3.2

> **IMPLEMENTADO — migration `20261001041950_create_posts_snapshots_foundation`**
>
> A arquitetura aprovada nas Etapas 3.1 e 3.1.1 foi aplicada ao Supabase em 01/10/2026. O n8n e a Bright Data não foram alterados nem executados nesta etapa.

## 1. Estado da fundação

A Etapa 3.1 definiu a fundação de posts e snapshots. A Etapa 3.1.1 corrige pontos de segurança, integridade e observabilidade antes de qualquer implementação.

Foram criados no Supabase:

- `collection_runs`;
- `instagram_posts`;
- `post_metric_snapshots`;
- `profile_metric_snapshots`.

As quatro tabelas terminaram a etapa com **0 registros**, conforme exigido.

## 2. Princípio de dados observados

As entidades canônicas armazenam somente fatos observáveis.

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

## 3. instagram_posts

Nome recomendado:

`instagram_posts`.

A entidade é específica da plataforma Instagram, mas independente do provider.

### Schema final proposto

| Campo | Tipo | Null | Default | Regra / justificativa |
|---|---|---:|---|---|
| id | uuid | não | gen_random_uuid() | PK interna |
| monitored_profile_id | uuid | não | — | perfil proprietário |
| instagram_media_id | text | sim | — | identidade preferencial real |
| instagram_shortcode | text | sim | — | fallback de identidade |
| permalink | text | sim | — | fallback final canônico |
| published_at | timestamptz | sim | — | horário observado |
| caption | text | sim | — | conteúdo observado |
| content_type | text | não | 'unknown' | CHECK observável |
| duration_seconds | numeric(10,3) | sim | — | somente quando disponível |
| audio_name | text | sim | — | somente quando disponível |
| thumbnail_url | text | sim | — | preview observado |
| first_collected_at | timestamptz | não | now() | primeira observação |
| last_collected_at | timestamptz | não | now() | última observação |
| created_at | timestamptz | não | now() | auditoria técnica |
| updated_at | timestamptz | não | now() | auditoria técnica |

Constraints de identidade:

- pelo menos um entre media ID, shortcode e permalink deve existir;
- unique parcial em media ID;
- unique parcial em shortcode;
- unique parcial em permalink.

Para permitir integridade declarativa dos snapshots:

`UNIQUE(id, monitored_profile_id)`.

Esse unique composto é intencional mesmo com `id` já sendo PK: ele fornece uma chave candidata para FK composta e impede que um snapshot associe um post ao perfil errado.

## 4. content_type

`TEXT + CHECK`:

- `reel`;
- `carousel`;
- `image`;
- `video`;
- `unknown`.

Não transformar automaticamente `video` em `reel`.

## 5. collection_runs

### Objetivo

Representar uma **coleta lógica**, criada antes de chamar o provider.

O run é a unidade para:

- idempotência;
- recovery;
- observabilidade;
- contadores;
- associação de snapshots ao perfil correto.

### Modelo final

| Campo | Tipo | Null | Default | Finalidade |
|---|---|---:|---|---|
| id | uuid | não | gen_random_uuid() | PK |
| monitored_profile_id | uuid | não | — | perfil coletado |
| collection_type | text | não | — | profile/posts/profile_and_posts |
| provider_key | text | não | — | provider operacional, ex. bright_data |
| orchestrator | text | não | 'n8n' | executor/orquestrador |
| provider_run_id | text | sim | — | job/snapshot/run no provider |
| orchestrator_run_id | text | sim | — | execution ID do orquestrador |
| started_at | timestamptz | não | now() | início lógico |
| finished_at | timestamptz | sim | — | término |
| status | text | não | 'running' | running/success/partial/error |
| received_count | integer | não | 0 | recebidos |
| inserted_count | integer | não | 0 | inseridos |
| updated_count | integer | não | 0 | atualizados |
| error_message | text | sim | — | erro curto e sanitizado |
| created_at | timestamptz | não | now() | auditoria |

### provider_key

**Aprovado arquiteturalmente.**

Exemplo:

`bright_data`.

É correto registrar provider em `collection_runs` porque essa é uma entidade operacional. Isso não acopla `instagram_posts` ou snapshots a Bright Data.

### orchestrator

**Aprovado arquiteturalmente.**

`orchestrator text not null default 'n8n'`.

Motivo: provider e orquestrador são responsabilidades diferentes. O banco deve conseguir responder:

- quem forneceu os dados;
- quem executou a coleta.

### provider_run_id

**Aprovado arquiteturalmente.**

Campo provider-neutral para armazenar o ID real do job/snapshot/execução externa.

Benefício principal: recovery. Se o provider já criou um job, retries devem reutilizar esse ID e continuar polling/download, evitando nova cobrança/coleta desnecessária.

Não criar unique global nesse campo: um provider futuro pode usar um único job para mais de um perfil ou batch.

### orchestrator_run_id

**Aprovado arquiteturalmente como nullable.**

Ajuda a correlacionar `collection_runs` com uma execução do n8n e facilita debugging.

Não é chave de idempotência e não recebe unique global, porque uma execução de orquestrador pode futuramente administrar mais de um collection run.

### Integridade auxiliar

Adicionar:

`UNIQUE(id, monitored_profile_id)`.

Isso habilita FKs compostas nos snapshots.

## 6. Integridade forte perfil/run/post

Problema que deve ser impossível:

```text
collection_run → perfil A
post → perfil B
snapshot → referencia os dois
```

A solução final usa **constraints declarativas**, sem trigger customizada.

### post_metric_snapshots

Adicionar:

`monitored_profile_id uuid not null`.

FKs compostas:

```text
(post_id, monitored_profile_id)
→ instagram_posts(id, monitored_profile_id)

(collection_run_id, monitored_profile_id)
→ collection_runs(id, monitored_profile_id)
```

Assim, o mesmo `monitored_profile_id` precisa ser verdadeiro simultaneamente para o post e para o run.

### profile_metric_snapshots

FK composta:

```text
(collection_run_id, monitored_profile_id)
→ collection_runs(id, monitored_profile_id)
```

Assim, um snapshot de perfil B não pode apontar para um run do perfil A.

Essa solução é preferida a trigger porque:

- é declarativa;
- é validada pelo PostgreSQL;
- não depende de lógica procedural;
- reduz superfície de erro;
- permanece simples no MVP.

## 7. post_metric_snapshots

### Schema final

| Campo | Tipo | Null | Default | Regra |
|---|---|---:|---|---|
| id | uuid | não | gen_random_uuid() | PK |
| post_id | uuid | não | — | post observado |
| monitored_profile_id | uuid | não | — | integridade cross-profile |
| collection_run_id | uuid | não | — | idempotência/run |
| captured_at | timestamptz | não | — | horário observado |
| views_count | bigint | sim | — | >= 0 |
| plays_count | bigint | sim | — | >= 0 |
| likes_count | bigint | sim | — | >= 0 |
| comments_count | bigint | sim | — | >= 0 |
| shares_count | bigint | sim | — | >= 0 |
| saves_count | bigint | sim | — | >= 0 |
| created_at | timestamptz | não | now() | auditoria |

Regras:

- imutável;
- collector recebe SELECT + INSERT;
- sem UPDATE;
- sem DELETE;
- snapshot só existe se pelo menos uma métrica for não-NULL;
- `UNIQUE(post_id, collection_run_id)`.

## 8. profile_metric_snapshots

### Schema final

| Campo | Tipo | Null | Default | Regra |
|---|---|---:|---|---|
| id | uuid | não | gen_random_uuid() | PK |
| monitored_profile_id | uuid | não | — | perfil |
| collection_run_id | uuid | não | — | run do mesmo perfil |
| captured_at | timestamptz | não | — | horário observado |
| followers_count | bigint | sim | — | >= 0 |
| following_count | bigint | sim | — | >= 0 |
| posts_count | bigint | sim | — | >= 0 |
| created_at | timestamptz | não | now() | auditoria |

Regras:

- imutável;
- collector recebe SELECT + INSERT;
- sem UPDATE;
- sem DELETE;
- snapshot só existe se pelo menos uma métrica for não-NULL;
- `UNIQUE(monitored_profile_id, collection_run_id)`;
- FK composta garante que o run pertence ao mesmo perfil.

## 9. NULL versus ZERO

Regra obrigatória:

- `0` = zero realmente observado;
- `NULL` = não disponível / não observado.

Nunca converter ausência em zero.

## 10. Views versus plays

Continuam métricas diferentes.

Não assumir equivalência entre:

- views;
- plays;
- video views;
- reel plays.

A prova real do dataset de posts será necessária antes do mapping definitivo.

## 11. Idempotência final

Fluxo lógico obrigatório:

1. criar `collection_run` **antes** da chamada ao provider;
2. chamar provider;
3. assim que houver ID externo, salvar `provider_run_id`;
4. retries/polling da mesma coleta reutilizam o mesmo `collection_run_id`;
5. se já existir `provider_run_id`, recovery deve continuar o job existente em vez de disparar outro;
6. snapshots usam o mesmo `collection_run_id`;
7. finalizar o run apenas no término lógico.

Não criar um novo collection run:

- para cada polling;
- para cada retry HTTP;
- para retomar o mesmo provider job.

Uma nova coleta deliberada cria um novo run.

## 12. Provider independence

Entidades canônicas não terão:

- `brightdata_id`;
- `brightdata_post`;
- `brightdata_payload`;
- `brightdata_snapshot_id`.

`provider_key` e `provider_run_id` vivem apenas em `collection_runs`, que é operacional e provider-neutral.

## 13. Segurança: RLS versus service_role

Ponto crítico:

- RLS protege usuários normais;
- `service_role` possui BYPASSRLS e ignora policies;
- portanto a limitação do collector server-side depende principalmente de **GRANTs mínimos**.

Por isso o SQL draft deve revogar explicitamente privilégios de:

- PUBLIC;
- anon;
- authenticated;
- service_role;

antes de conceder apenas o necessário.

Não alterar default privileges globais do projeto nesta etapa.

## 14. Exposição ao frontend

### collection_runs

**Server-side only no MVP.**

Não conceder SELECT a `authenticated`.

Motivos:

- não existe tela de observabilidade de runs;
- contém erros operacionais;
- contém IDs de execução;
- contém provider/orchestrator;
- não é dado de produto necessário à UI atual.

RLS continua habilitado, mas sem policy para authenticated.

### instagram_posts

`viewer/editor/admin → SELECT`.

### post_metric_snapshots

`viewer/editor/admin → SELECT`.

### profile_metric_snapshots

`viewer/editor/admin → SELECT`.

Nenhuma dessas três recebe escrita pelo frontend.

## 15. Grants finais

### collection_runs

`service_role → SELECT, INSERT, UPDATE`

Sem:

- DELETE;
- acesso authenticated.

### instagram_posts

`authenticated → SELECT`, condicionado por RLS/role.

`service_role → SELECT, INSERT, UPDATE`.

Sem DELETE.

### post_metric_snapshots

`authenticated → SELECT`, condicionado por RLS/role.

`service_role → SELECT, INSERT`.

Sem UPDATE e DELETE.

### profile_metric_snapshots

`authenticated → SELECT`, condicionado por RLS/role.

`service_role → SELECT, INSERT`.

Sem UPDATE e DELETE.

## 16. Índices finais

### collection_runs

- unique auxiliar `(id, monitored_profile_id)` para FK composta;
- `(monitored_profile_id, started_at desc)`.

Não criar índice/unique global em `provider_run_id` ou `orchestrator_run_id` neste MVP.

### instagram_posts

- unique auxiliar `(id, monitored_profile_id)`;
- unique parcial em `instagram_media_id`;
- unique parcial em `instagram_shortcode`;
- unique parcial em `permalink`;
- `(monitored_profile_id, published_at desc)`;
- `(published_at desc)`.

### post_metric_snapshots

- unique `(post_id, collection_run_id)`;
- `(post_id, captured_at desc)`;
- `(monitored_profile_id, captured_at desc)`.

A nova coluna redundante é útil para consultas temporais por perfil sem depender de join.

### profile_metric_snapshots

- unique `(monitored_profile_id, collection_run_id)`;
- `(monitored_profile_id, captured_at desc)`.

## 17. Função updated_at

`set_observed_entity_updated_at()` permanece:

- `SECURITY INVOKER`;
- usada apenas por trigger em `instagram_posts`;
- sem necessidade de RPC direta.

Revogar EXECUTE de:

- PUBLIC;
- anon;
- authenticated;
- service_role.

O trigger continua sendo o mecanismo de uso da função; ela não deve ficar exposta para chamada direta.

## 18. Primeira ingestão

Manter recomendação:

`20 posts recentes por perfil`.

Esse número é **configuração do workflow/provider adapter**, não constraint do banco.

O banco não deve conhecer o limite 20.

## 19. Frequência de snapshots

A proposta:

- 0–24h → 2h;
- 24–72h → 6h;
- 3–7 dias → 24h;
- >7 dias → sob demanda/sem recorrência padrão;

continua **exclusivamente conceitual**.

Não transformar esses intervalos em:

- scheduler;
- constraint;
- coluna default;
- regra permanente.

Antes disso é necessário:

1. confirmar quais métricas o dataset real de posts entrega;
2. medir latência;
3. medir consumo do provider;
4. observar utilidade real para detectar aceleração.

## 20. Contratos provider-neutral

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

type InstagramProviderPostsResult = {
  profileUsername: string
  fetchedAt: string
  posts: InstagramProviderPostResult[]
  nextCursor?: string | null
  hasMore?: boolean | null
}
```

## 21. Migration aplicada

```sql
create table public.collection_runs (
  id uuid primary key default gen_random_uuid(),

  monitored_profile_id uuid not null
    references public.monitored_profiles(id)
    on delete restrict,

  collection_type text not null
    check (collection_type in ('profile', 'posts', 'profile_and_posts')),

  provider_key text not null
    check (
      char_length(provider_key) between 1 and 64
      and provider_key ~ '^[a-z0-9_]+$'
    ),

  orchestrator text not null default 'n8n'
    check (
      char_length(orchestrator) between 1 and 64
      and orchestrator ~ '^[a-z0-9_]+$'
    ),

  provider_run_id text null
    check (
      provider_run_id is null
      or char_length(provider_run_id) between 1 and 255
    ),

  orchestrator_run_id text null
    check (
      orchestrator_run_id is null
      or char_length(orchestrator_run_id) between 1 and 255
    ),

  started_at timestamptz not null default now(),
  finished_at timestamptz null,

  status text not null default 'running'
    check (status in ('running', 'success', 'partial', 'error')),

  received_count integer not null default 0
    check (received_count >= 0),

  inserted_count integer not null default 0
    check (inserted_count >= 0),

  updated_count integer not null default 0
    check (updated_count >= 0),

  error_message text null
    check (
      error_message is null
      or char_length(error_message) <= 2000
    ),

  created_at timestamptz not null default now(),

  constraint collection_runs_profile_identity_uq
    unique (id, monitored_profile_id),

  constraint collection_runs_finished_after_started
    check (finished_at is null or finished_at >= started_at),

  constraint collection_runs_status_finished_consistency
    check (
      (status = 'running' and finished_at is null)
      or
      (status in ('success', 'partial', 'error') and finished_at is not null)
    )
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
    check (
      content_type in ('reel', 'carousel', 'image', 'video', 'unknown')
    ),

  duration_seconds numeric(10,3) null
    check (
      duration_seconds is null
      or duration_seconds >= 0
    ),

  audio_name text null,
  thumbnail_url text null,

  first_collected_at timestamptz not null default now(),
  last_collected_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint instagram_posts_profile_identity_uq
    unique (id, monitored_profile_id),

  constraint instagram_posts_has_identity
    check (
      num_nonnulls(
        instagram_media_id,
        instagram_shortcode,
        permalink
      ) >= 1
    ),

  constraint instagram_posts_collection_order
    check (last_collected_at >= first_collected_at)
);

create table public.post_metric_snapshots (
  id uuid primary key default gen_random_uuid(),

  post_id uuid not null,
  monitored_profile_id uuid not null,
  collection_run_id uuid not null,

  captured_at timestamptz not null,

  views_count bigint null
    check (views_count is null or views_count >= 0),

  plays_count bigint null
    check (plays_count is null or plays_count >= 0),

  likes_count bigint null
    check (likes_count is null or likes_count >= 0),

  comments_count bigint null
    check (comments_count is null or comments_count >= 0),

  shares_count bigint null
    check (shares_count is null or shares_count >= 0),

  saves_count bigint null
    check (saves_count is null or saves_count >= 0),

  created_at timestamptz not null default now(),

  constraint post_metric_snapshots_post_profile_fkey
    foreign key (post_id, monitored_profile_id)
    references public.instagram_posts(id, monitored_profile_id)
    on delete restrict,

  constraint post_metric_snapshots_run_profile_fkey
    foreign key (collection_run_id, monitored_profile_id)
    references public.collection_runs(id, monitored_profile_id)
    on delete restrict,

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

  monitored_profile_id uuid not null,
  collection_run_id uuid not null,

  captured_at timestamptz not null,

  followers_count bigint null
    check (
      followers_count is null
      or followers_count >= 0
    ),

  following_count bigint null
    check (
      following_count is null
      or following_count >= 0
    ),

  posts_count bigint null
    check (
      posts_count is null
      or posts_count >= 0
    ),

  created_at timestamptz not null default now(),

  constraint profile_metric_snapshots_run_profile_fkey
    foreign key (collection_run_id, monitored_profile_id)
    references public.collection_runs(id, monitored_profile_id)
    on delete restrict,

  constraint profile_metric_snapshots_has_observation
    check (
      num_nonnulls(
        followers_count,
        following_count,
        posts_count
      ) >= 1
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
  on public.instagram_posts (
    monitored_profile_id,
    published_at desc
  );

create index instagram_posts_published_idx
  on public.instagram_posts (published_at desc);

create index collection_runs_profile_started_idx
  on public.collection_runs (
    monitored_profile_id,
    started_at desc
  );

create index post_metric_snapshots_post_captured_idx
  on public.post_metric_snapshots (
    post_id,
    captured_at desc
  );

create index post_metric_snapshots_profile_captured_idx
  on public.post_metric_snapshots (
    monitored_profile_id,
    captured_at desc
  );

create index profile_metric_snapshots_profile_captured_idx
  on public.profile_metric_snapshots (
    monitored_profile_id,
    captured_at desc
  );

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

-- Remover qualquer grant automático/preexistente antes de aplicar
-- a matriz mínima. Não alterar default privileges globais do projeto.
revoke all on table public.collection_runs
  from PUBLIC, anon, authenticated, service_role;

revoke all on table public.instagram_posts
  from PUBLIC, anon, authenticated, service_role;

revoke all on table public.post_metric_snapshots
  from PUBLIC, anon, authenticated, service_role;

revoke all on table public.profile_metric_snapshots
  from PUBLIC, anon, authenticated, service_role;

-- Frontend: somente dados de produto observados.
-- collection_runs permanece server-side only.
grant select on table public.instagram_posts
  to authenticated;

grant select on table public.post_metric_snapshots
  to authenticated;

grant select on table public.profile_metric_snapshots
  to authenticated;

-- Collector server-side: privilégio mínimo.
grant select, insert, update
  on table public.collection_runs
  to service_role;

grant select, insert, update
  on table public.instagram_posts
  to service_role;

grant select, insert
  on table public.post_metric_snapshots
  to service_role;

grant select, insert
  on table public.profile_metric_snapshots
  to service_role;

-- Sem policy de collection_runs para authenticated.
-- service_role ignora RLS; seus limites vêm dos GRANTs acima.

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

-- A função é usada apenas pelo trigger.
-- Não expor RPC direta para nenhum cliente/collector.
revoke execute
  on function public.set_observed_entity_updated_at()
  from PUBLIC, anon, authenticated, service_role;
```

## 22. Validações da implementação

Validações executadas após a migration:

- `collection_runs_status_finished_consistency` bloqueia `running + finished_at` e bloqueia status terminal sem `finished_at`;
- FKs compostas impediram, em transação com rollback, snapshot de post/perfil usando run de outro perfil;
- trigger `instagram_posts_set_updated_at` funcionou para `service_role` mesmo com EXECUTE direto da função revogado;
- `viewer`, `editor` e `admin` leram posts/snapshots em teste RLS transacional;
- role inválida não leu linhas;
- `collection_runs` permaneceu inacessível a `authenticated`;
- snapshots permaneceram sem UPDATE/DELETE para `service_role`;
- nenhum dado de teste foi persistido.

### Advisors

Security Advisor:

- INFO `rls_enabled_no_policy` em `collection_runs` é **intencional**: a tabela é server-side only, sem GRANT para authenticated e sem policy de frontend;
- WARN `auth_leaked_password_protection` é anterior e não foi causado por esta migration.

Performance Advisor:

- INFO de 3 FKs compostas sem índice de cobertura exato;
- não foram adicionados índices extras porque os parent IDs não são fluxo de UPDATE/DELETE no MVP, e os índices aprovados já atendem às consultas previstas;
- INFO de índices não usados em tabelas recém-criadas/vazias é esperado.

### Arquivo de migration

`supabase/migrations/20261001041950_create_posts_snapshots_foundation.sql`

## 23. Próxima autorização

A camada de banco está pronta. A próxima etapa deve ser autorizada separadamente para:

- alterar/criar workflow n8n de posts;
- chamar o provider;
- realizar a primeira ingestão real;
- inserir os primeiros snapshots reais.

Até essa autorização, as quatro tabelas permanecem vazias.
