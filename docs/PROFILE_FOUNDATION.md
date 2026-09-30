# Profile Foundation

> **DRAFT DE ARQUITETURA — NÃO APLICADO**
>
> Este documento descreve a fundação proposta para Perfis Monitorados.
> Nenhuma tabela, policy, migration, Edge Function ou dado permanente foi criado nesta etapa.

## 1. Estado atual

Inspeção realizada em 30/09/2026 no projeto Supabase `zqwlyqnwcpddmknjnune`.

### Repositório

- Frontend em React + TypeScript + Vite.
- `/profiles` existe e atualmente exibe estado vazio.
- O cliente Supabase está centralizado em `src/lib/supabase.ts`.
- A aplicação usa publishable key no browser.
- `.env` e `.env.local` estão ignorados no Git.
- Não foi encontrada `service_role` nem `sb_secret_` nos arquivos inspecionados.
- A configuração real das variáveis do projeto na Vercel não foi lida por esta inspeção; apenas a separação prevista pelo repositório foi verificada.

### Supabase real

- Projeto: Trend Radar.
- Project ref: `zqwlyqnwcpddmknjnune`.
- Região: `us-east-1`.
- Estado: `ACTIVE_HEALTHY`.
- PostgreSQL: 17.
- Schemas encontrados: `auth`, `extensions`, `graphql`, `graphql_public`, `public`, `realtime`, `storage`, `vault`.
- Tabelas de negócio no schema `public`: 0.
- Migrations de projeto: 0.
- Edge Functions: 0.
- Policies em `public` e `storage`: 0.
- Usuários em `auth.users`: 0.
- Identidades em `auth.identities`: 0.

O schema `auth` possui as tabelas internas padrão do Supabase Auth. Isso não significa que a aplicação já tenha fluxo de login, autorização ou usuários configurados.

## 2. Decisões arquiteturais corrigidas

1. `profile_group` representa somente a função estratégica do perfil no Radar.
2. Geografia não faz parte de `profile_group`.
3. Os grupos do MVP serão `own`, `competitor`, `reference` e `trendsetter`.
4. Para o MVP, `profile_group` será `text + check`, sem tabela `profile_groups`.
5. A dimensão geográfica será `primary_market_code`.
6. `primary_market_code` representa o mercado principal associado ao perfil no Radar, não nacionalidade.
7. `created_by` será nullable, com FK para `auth.users` e `ON DELETE SET NULL`.
8. `updated_by` será nullable, com FK para `auth.users` e `ON DELETE SET NULL`.
9. `updated_by` representa o último usuário humano que alterou campos editoriais, não o ator da última escrita operacional.
10. Campos humanos e campos operacionais terão privilégios de coluna separados.
11. `created_by` não será atualizável pelo frontend autenticado.
12. `instagram_username` é editável apenas enquanto o perfil ainda não tiver identidade externa resolvida.
13. Depois que `instagram_external_id` existir, mudanças de username passam a ser responsabilidade do backend/provider.
14. `active` continua representando intenção do usuário.
15. `monitoring_status` continua representando saúde operacional, com `pending`, `healthy` e `error`.

## 3. Modelo conceitual de `monitored_profiles`

O nome `monitored_profiles` continua **proposto**, não aprovado.

### Campos aprovados

| Campo proposto | PostgreSQL | Obrigatório | Default | Constraint / FK | Índice | Unique | Justificativa |
|---|---|---:|---|---|---|---|---|
| `id` | `uuid` | sim | `gen_random_uuid()` | PK | PK | sim | Identificador interno estável. |
| `instagram_username` | `text` | sim | nenhum | lowercase, regex local, proteção contra troca após resolução | btree | sim | Username canônico atual; humano na criação e controlado após identidade resolvida. |
| `instagram_external_id` | `text` | não | `NULL` | nenhum | parcial | sim quando não nulo | Identidade estável da conta quando o provider a fornecer. |
| `display_name` | `text` | não | `NULL` | nenhum | não | não | Cache operacional do nome público. |
| `profile_picture_url` | `text` | não | `NULL` | nenhum | não | não | Cache operacional da imagem pública. |
| `primary_market_code` | `text` | sim | nenhum | `^[A-Z]{2}$` no MVP | btree | não | Mercado principal do Radar, sem confundir com nacionalidade. |
| `profile_group` | `text` | sim | nenhum | CHECK `own/competitor/reference/trendsetter` | btree | não | Papel estratégico, sem dimensão geográfica. |
| `niche` | `text` | não | `NULL` | nenhum | inicialmente não | não | Classificação editorial humana. |
| `category` | `text` | não | `NULL` | nenhum | inicialmente não | não | Classificação humana de negócio/conteúdo. |
| `priority` | `smallint` | sim | `2` | `1..3` | via índice de fila | não | 1 alta, 2 média, 3 baixa. |
| `tags` | `text[]` | sim | `{}` | nenhum | GIN | não | Segmentação flexível. |
| `followers_count` | `bigint` | não | `NULL` | `>= 0` | não | não | Último valor conhecido; histórico futuro ficará em snapshots. |
| `monitoring_status` | `text` | sim | `pending` | CHECK `pending/healthy/error` | inicialmente não | não | Saúde operacional, separada de `active`. |
| `active` | `boolean` | sim | `true` | nenhum | índice parcial de fila | não | Intenção do usuário de monitorar. |
| `last_collected_at` | `timestamptz` | não | `NULL` | nenhum | não | não | Última coleta bem-sucedida. |
| `next_collection_at` | `timestamptz` | não | `NULL` | nenhum | índice parcial de fila | não | Base futura da fila do n8n. |
| `last_collection_error` | `text` | não | `NULL` | limite de tamanho | não | não | Último erro resumido e sanitizado. |
| `created_at` | `timestamptz` | sim | `now()` | nenhum | não | não | Auditoria básica. |
| `updated_at` | `timestamptz` | sim | `now()` | trigger futuro | não | não | Última alteração de qualquer natureza. |
| `created_by` | `uuid` | não | `auth.uid()` | FK `auth.users(id) ON DELETE SET NULL` | btree | não | Criador humano, preservando o registro se o usuário for removido. |
| `updated_by` | `uuid` | não | `NULL` | FK `auth.users(id) ON DELETE SET NULL` | btree | não | Último editor humano dos campos editoriais. |

### Campos descartados ou substituídos

#### `instagram_url`

Não persistir. Derivar de `instagram_username`.

#### `country_code`

Substituído por `primary_market_code`.

`country_code` é tecnicamente válido, mas transmite a ideia de país/nacionalidade. O Radar precisa classificar **mercado relevante**. O nome `primary_market_code` deixa explícito que:

- é uma classificação de mercado;
- é o mercado principal do MVP;
- no futuro poderá coexistir com uma relação multi-mercado sem renomear o campo.

No MVP os códigos serão ISO alpha-2, por exemplo `BR` e `US`.

Se futuramente uma conta tiver relevância em múltiplos mercados, poderá ser adicionada uma relação conceitual `profile_markets`, mantendo `primary_market_code` como mercado principal.

#### `profile_groups` como tabela

Não recomendado no MVP.

Com quatro papéis estratégicos estáveis, uma tabela de referência adicionaria join, gestão e superfície administrativa sem benefício suficiente.

O MVP usará `TEXT + CHECK`.

Se o produto passar a permitir grupos customizados ou gerenciáveis por usuário, a arquitetura poderá evoluir para uma tabela de referência.

#### `provider` e `provider_profile_id`

Não colocar em `monitored_profiles`. Metadados específicos de fornecedor devem ficar em uma entidade futura de bindings.

## 4. Username do Instagram

### Normalização local

As regras de normalização permanecem:

- remover `@` inicial;
- extrair username de URL válida do Instagram;
- remover query string, fragment e barra final;
- lowercase;
- rejeitar espaços internos;
- aceitar localmente `a-z`, `0-9`, `.` e `_`;
- não tratar normalização como validação de existência.

### Regra de alteração

`instagram_username` possui dois estágios:

#### Antes da identidade ser resolvida

Enquanto `instagram_external_id IS NULL`, um editor/admin pode corrigir o username.

#### Depois da identidade ser resolvida

Quando `instagram_external_id IS NOT NULL`, o frontend autenticado comum não pode mudar o username.

Motivo: o external ID passa a representar a identidade histórica da conta. Uma mudança manual arbitrária poderia apontar o registro para outra pessoa e quebrar histórico.

Se o Instagram renomear a conta, o backend/provider poderá atualizar `instagram_username` somente após confirmar que o `instagram_external_id` continua o mesmo.

Correções excepcionais após resolução devem ocorrer por fluxo administrativo/backend controlado, não pelo formulário normal.

## 5. `profile_group`

### Decisão final do MVP

Usar:

```text
own
competitor
reference
trendsetter
```

Labels:

```text
Próprio
Concorrente
Referência
Trendsetter
```

A geografia vem exclusivamente de `primary_market_code`.

Exemplos:

```text
profile_group = reference
primary_market_code = BR
UI = Referência Brasil
```

```text
profile_group = reference
primary_market_code = US
UI = Referência EUA
```

Isso elimina combinações redundantes como `reference_us + BR`.

### TEXT + CHECK vs tabela de referência

**Escolha para o MVP: TEXT + CHECK.**

Critérios:

- simplicidade: melhor;
- manutenção: quatro valores centrais e raramente alterados;
- integridade: forte via CHECK;
- escalabilidade: suficiente para o MVP;
- novos grupos futuros: exigem migration, o que é aceitável para uma mudança de taxonomia estratégica.

Tabela dinâmica só passa a valer a complexidade quando grupos precisarem ser criados/configurados em runtime.

## 6. Mercado

### Decisão

Usar `primary_market_code text`.

No MVP:

- `BR`
- `US`

Constraint inicial:

`^[A-Z]{2}$`

O campo responde:

> Qual é o mercado principal deste perfil dentro do Radar?

Ele não afirma nacionalidade do criador.

### Futuro multi-mercado

Não modelar agora.

Quando necessário, criar relação própria para mercados adicionais. O campo `primary_market_code` continua sendo útil como classificação principal.

## 7. Prioridade

Permanece:

- `1` = alta;
- `2` = média;
- `3` = baixa.

Tipo: `smallint`.

Default: `2`.

## 8. Status operacional

### `active`

Intenção humana:

> Este perfil deve continuar sendo monitorado?

### `monitoring_status`

Saúde operacional:

- `pending`;
- `healthy`;
- `error`.

Nenhum estado adicional é essencial para o MVP.

Não adicionar `paused`, pois `active = false` já representa isso.

Não adicionar estados transitórios como `collecting` nesta fase.

## 9. Campos humanos vs operacionais

### Campos humanos

Campos controlados pelo fluxo editorial:

- `instagram_username` — somente criação/correção enquanto ainda não resolvido;
- `primary_market_code`;
- `profile_group`;
- `niche`;
- `category`;
- `priority`;
- `tags`;
- `active`.

### Campos operacionais / provider

Não editáveis pelo frontend autenticado comum:

- `instagram_external_id`;
- `display_name`;
- `profile_picture_url`;
- `followers_count`;
- `monitoring_status`;
- `last_collected_at`;
- `next_collection_at`;
- `last_collection_error`.

Esses campos serão futuramente atualizados apenas por backend/n8n autorizado.

### Auditoria

- `created_by`: usuário humano que criou o registro;
- `updated_by`: último usuário humano que alterou campos humanos;
- `updated_at`: última alteração do registro, humana ou operacional.

Por isso, uma atualização automática pode mudar `updated_at` sem mudar `updated_by`.

## 10. Segurança, Auth e RLS

### Papéis

- `viewer`: leitura;
- `editor`: leitura, criação e edição de campos humanos;
- `admin`: mesmas permissões operacionais do editor, com futura gestão administrativa;
- `anon`: nenhum acesso.

Autorização futura deve usar `app_metadata`, não `user_metadata`.

### `created_by`

Decisão:

```sql
created_by uuid null
references auth.users(id)
on delete set null
```

Motivos:

- preservar dados de negócio;
- permitir remoção de usuário do Auth;
- manter vínculo enquanto o usuário existir;
- evitar bloquear offboarding por histórico antigo.

Na inserção humana, o default conceitual é `auth.uid()`.

### `updated_by`

Aprovado para o MVP:

```sql
updated_by uuid null
references auth.users(id)
on delete set null
```

Ele será preenchido no banco por trigger quando houver mudança em campos humanos e `auth.uid()` existir.

Não será enviado pelo formulário.

Atualizações operacionais que mudem somente campos de provider não alteram `updated_by`.

### Imutabilidade de `created_by`

Não depender da UI.

O papel `authenticated` não receberá privilégio `UPDATE(created_by)`.

Também não receberá `UPDATE(updated_by)`; o trigger interno do banco é quem atualiza `updated_by`.

Assim, mesmo que um cliente tente enviar esses campos manualmente, o Postgres nega a alteração por privilégio de coluna.

### Proteção dos campos operacionais

O papel `authenticated` recebe UPDATE somente para as colunas humanas.

Campos operacionais não aparecem no GRANT UPDATE do frontend.

RLS decide **quais linhas** podem ser atualizadas; privilégios de coluna decidem **quais colunas** podem ser atualizadas.

### Username após resolução

Como `instagram_username` precisa ser corrigível antes da primeira resolução, ele permanece no GRANT UPDATE humano.

Um trigger defensivo impede alteração por usuário autenticado quando `OLD.instagram_external_id IS NOT NULL`.

Backend autorizado poderá sincronizar um rename confirmado.

### DELETE

Sem GRANT DELETE e sem policy DELETE para frontend.

Fluxo normal de pausa: `active = false`.

## 11. Contrato TypeScript

Proposta conceitual, ainda não implementada em `src`:

```ts
export type MarketCode = string

export type ProfileGroup =
  | 'own'
  | 'competitor'
  | 'reference'
  | 'trendsetter'

export type ProfilePriority = 1 | 2 | 3

export type MonitoringStatus =
  | 'pending'
  | 'healthy'
  | 'error'

export interface MonitoredProfile {
  id: string
  instagramUsername: string
  instagramExternalId: string | null
  displayName: string | null
  profilePictureUrl: string | null
  primaryMarketCode: MarketCode
  profileGroup: ProfileGroup
  niche: string | null
  category: string | null
  priority: ProfilePriority
  tags: string[]
  followersCount: number | null
  monitoringStatus: MonitoringStatus
  active: boolean
  lastCollectedAt: string | null
  nextCollectionAt: string | null
  lastCollectionError: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export interface ListProfilesParams {
  active?: boolean
  primaryMarketCode?: MarketCode
  profileGroup?: ProfileGroup
  priority?: ProfilePriority
  search?: string
}

export interface CreateProfileInput {
  instagramInput: string
  primaryMarketCode: MarketCode
  profileGroup: ProfileGroup
  niche?: string | null
  category?: string | null
  priority: ProfilePriority
  tags?: string[]
  active?: boolean
}

export interface UpdateProfileInput {
  instagramUsername?: string
  primaryMarketCode?: MarketCode
  profileGroup?: ProfileGroup
  niche?: string | null
  category?: string | null
  priority?: ProfilePriority
  tags?: string[]
  active?: boolean
}
```

A presença de `instagramUsername` em `UpdateProfileInput` não significa atualização irrestrita: o banco deve bloquear troca após resolução da identidade.

## 12. Próxima versão técnica de `/profiles`

A interface futura continua fora desta etapa.

Campos do formulário:

- Instagram URL ou @;
- Grupo;
- Mercado;
- Nicho;
- Categoria;
- Prioridade;
- Tags;
- Ativo.

Na listagem, grupo e mercado podem ser compostos visualmente.

Exemplo:

`reference + BR` → **Referência Brasil**

Isso é apresentação, não armazenamento redundante.

## 13. Contrato futuro com n8n

Não implementado.

Fluxo conceitual:

1. consulta `active = true`;
2. verifica `next_collection_at`;
3. ordena por prioridade;
4. chama `InstagramProviderAdapter`;
5. atualiza somente campos operacionais/provider;
6. atualiza `updated_at`, mas não `updated_by`;
7. registra erros/retry;
8. futuramente persiste posts, snapshots e execuções em entidades próprias.

A automação deve usar credencial server-side, nunca a publishable key do browser.

## 14. Provider Adapter

Permanece independente de fornecedor.

```ts
export interface InstagramProviderProfileResult {
  instagramUsername: string
  instagramExternalId: string | null
  displayName: string | null
  profilePictureUrl: string | null
  followersCount: number | null
  fetchedAt: string
}

export interface InstagramProviderAdapter {
  readonly providerKey: string

  getProfile(
    instagramUsername: string,
  ): Promise<InstagramProviderProfileResult>
}
```

Metadados específicos de provider devem ficar futuramente em entidade separada de bindings.

## 15. Riscos e decisões pendentes

### Riscos principais

1. username pode mudar;
2. falha de provider não significa conta inexistente;
3. dados operacionais são caches temporais;
4. JWT pode ficar stale após mudança de papel;
5. credencial do n8n terá alto impacto;
6. delete físico prejudica histórico;
7. classificação de mercado é editorial e não deve ser inferida automaticamente.

### Decisões que ainda exigem aprovação

1. nome final `monitored_profiles`;
2. uso definitivo de `primary_market_code`;
3. `profile_group` como TEXT + CHECK;
4. valores `own/competitor/reference/trendsetter`;
5. `created_by nullable + ON DELETE SET NULL`;
6. inclusão de `updated_by`;
7. trigger de `updated_by` em mudanças humanas;
8. regra de bloqueio de username após `instagram_external_id`;
9. estados `pending/healthy/error`;
10. papéis `viewer/editor/admin`;
11. grants de coluna propostos;
12. método futuro de login interno;
13. estratégia de credencial n8n;
14. provider inicial do Instagram;
15. frequência de coleta por prioridade.

## 16. SQL draft

> **DRAFT — NÃO APLICADO**
>
> O SQL abaixo existe somente para revisão arquitetural.
> Não é migration e não foi executado.

```sql
-- ============================================================
-- DRAFT — NÃO APLICADO
-- Caliber Trend Radar: monitored profiles foundation
-- ============================================================

create table public.monitored_profiles (
  id uuid primary key default gen_random_uuid(),

  -- identidade / entrada humana
  instagram_username text not null,
  primary_market_code text not null,
  profile_group text not null,
  niche text null,
  category text null,
  priority smallint not null default 2,
  tags text[] not null default '{}',
  active boolean not null default true,

  -- dados operacionais / provider
  instagram_external_id text null,
  display_name text null,
  profile_picture_url text null,
  followers_count bigint null,
  monitoring_status text not null default 'pending',
  last_collected_at timestamptz null,
  next_collection_at timestamptz null,
  last_collection_error text null,

  -- auditoria
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  created_by uuid null default auth.uid()
    references auth.users(id)
    on delete set null,

  updated_by uuid null
    references auth.users(id)
    on delete set null,

  constraint monitored_profiles_instagram_username_lowercase
    check (instagram_username = lower(instagram_username)),

  constraint monitored_profiles_instagram_username_format
    check (
      char_length(instagram_username) between 1 and 64
      and instagram_username ~ '^[a-z0-9._]+$'
    ),

  constraint monitored_profiles_primary_market_code_format
    check (primary_market_code ~ '^[A-Z]{2}$'),

  constraint monitored_profiles_profile_group
    check (
      profile_group in (
        'own',
        'competitor',
        'reference',
        'trendsetter'
      )
    ),

  constraint monitored_profiles_priority_range
    check (priority between 1 and 3),

  constraint monitored_profiles_followers_nonnegative
    check (followers_count is null or followers_count >= 0),

  constraint monitored_profiles_monitoring_status
    check (monitoring_status in ('pending', 'healthy', 'error')),

  constraint monitored_profiles_last_error_length
    check (
      last_collection_error is null
      or char_length(last_collection_error) <= 2000
    ),

  constraint monitored_profiles_instagram_username_unique
    unique (instagram_username)
);

create unique index monitored_profiles_instagram_external_id_uq
  on public.monitored_profiles (instagram_external_id)
  where instagram_external_id is not null;

create index monitored_profiles_primary_market_idx
  on public.monitored_profiles (primary_market_code);

create index monitored_profiles_group_idx
  on public.monitored_profiles (profile_group);

create index monitored_profiles_created_by_idx
  on public.monitored_profiles (created_by)
  where created_by is not null;

create index monitored_profiles_updated_by_idx
  on public.monitored_profiles (updated_by)
  where updated_by is not null;

create index monitored_profiles_tags_gin_idx
  on public.monitored_profiles
  using gin (tags);

create index monitored_profiles_collection_queue_idx
  on public.monitored_profiles (priority, next_collection_at)
  where active = true;

create or replace function public.set_monitored_profile_updated_at()
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

create trigger monitored_profiles_set_updated_at
before update on public.monitored_profiles
for each row
execute function public.set_monitored_profile_updated_at();

create or replace function public.set_monitored_profile_updated_by()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    new.updated_by = (select auth.uid());
  end if;

  return new;
end;
$$;

create trigger monitored_profiles_set_updated_by
before update on public.monitored_profiles
for each row
when (
  old.instagram_username is distinct from new.instagram_username
  or old.primary_market_code is distinct from new.primary_market_code
  or old.profile_group is distinct from new.profile_group
  or old.niche is distinct from new.niche
  or old.category is distinct from new.category
  or old.priority is distinct from new.priority
  or old.tags is distinct from new.tags
  or old.active is distinct from new.active
)
execute function public.set_monitored_profile_updated_by();

create or replace function public.protect_resolved_instagram_username()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if
    old.instagram_username is distinct from new.instagram_username
    and old.instagram_external_id is not null
    and (select auth.uid()) is not null
  then
    raise exception
      'instagram_username cannot be changed by an authenticated client after identity resolution';
  end if;

  return new;
end;
$$;

create trigger monitored_profiles_protect_resolved_username
before update of instagram_username on public.monitored_profiles
for each row
execute function public.protect_resolved_instagram_username();

alter table public.monitored_profiles enable row level security;

-- Anonymous: nenhum acesso.
revoke all on public.monitored_profiles from anon;

-- Remove privilégios amplos antes de conceder somente o necessário.
revoke all on public.monitored_profiles from authenticated;

-- viewer/editor/admin poderão ler via RLS.
grant select on public.monitored_profiles to authenticated;

-- Criação humana: somente campos de entrada/classificação.
-- created_by é preenchido pelo DEFAULT auth.uid().
-- updated_by não é aceito do cliente.
grant insert (
  instagram_username,
  primary_market_code,
  profile_group,
  niche,
  category,
  priority,
  tags,
  active
) on public.monitored_profiles to authenticated;

-- Edição humana: somente campos humanos.
-- Campos operacionais/provider, created_by e updated_by ficam fora deste GRANT.
grant update (
  instagram_username,
  primary_market_code,
  profile_group,
  niche,
  category,
  priority,
  tags,
  active
) on public.monitored_profiles to authenticated;

create policy "monitored_profiles_select_internal"
on public.monitored_profiles
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('viewer', 'editor', 'admin')
);

create policy "monitored_profiles_insert_editor"
on public.monitored_profiles
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and created_by = (select auth.uid())
  and (
    ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
      in ('editor', 'admin')
  )
);

create policy "monitored_profiles_update_editor"
on public.monitored_profiles
for update
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('editor', 'admin')
)
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('editor', 'admin')
);

-- Deliberadamente:
-- - sem GRANT DELETE;
-- - sem policy DELETE;
-- - sem UPDATE grant para campos operacionais/provider;
-- - sem UPDATE grant para created_by/updated_by.
--
-- n8n/backend futuro usará credencial server-side apropriada e separada.
-- Este draft não define nem aplica essa credencial.
```
