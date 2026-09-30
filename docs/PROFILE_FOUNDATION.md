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

## 2. Decisões propostas

1. Manter `/profiles` como origem de monitoramento.
2. Não permitir escrita anônima.
3. Exigir Supabase Auth antes de qualquer escrita futura.
4. Usar RLS em toda tabela de negócio exposta no schema `public`.
5. Preferir desativação lógica a exclusão física.
6. Separar intenção do usuário (`active`) da saúde operacional (`monitoring_status`).
7. Guardar identidade canônica do Instagram separada de metadados de qualquer provider.
8. Não armazenar `instagram_url`, pois ela é derivável do username.
9. Representar país com código ISO alpha-2 em texto, sem ENUM.
10. Representar grupos por tabela de referência, permitindo novos grupos sem migration.
11. Representar prioridade por inteiro pequeno, adequado para ordenação de fila.
12. Manter no perfil somente o último valor operacional necessário; histórico futuro deve ir para snapshots e execuções próprias.

## 3. Modelo conceitual de `monitored_profiles`

O nome `monitored_profiles` continua **proposto**, não aprovado.

### Campos aprovados

| Campo proposto | PostgreSQL | Obrigatório | Default | Constraint / FK | Índice | Unique | Justificativa |
|---|---|---:|---|---|---|---|---|
| `id` | `uuid` | sim | `gen_random_uuid()` | PK | PK | sim | Identificador interno estável. |
| `instagram_username` | `text` | sim | nenhum | lowercase, regex local, tamanho de segurança | btree | sim | Identidade canônica usada pela aplicação. |
| `instagram_external_id` | `text` | não | `NULL` | nenhum | parcial | sim quando não nulo | ID estável da conta no Instagram quando um provider confiável o entregar. |
| `display_name` | `text` | não | `NULL` | nenhum | não | não | Cache do nome público mais recente. |
| `profile_picture_url` | `text` | não | `NULL` | nenhum | não | não | Cache da imagem pública mais recente. |
| `country_code` | `text` | sim | nenhum | `^[A-Z]{2}$` | btree | não | Classificação de mercado escalável, sem limitar a BR/US. |
| `profile_group` | `text` | sim | nenhum | FK para tabela de referência `profile_groups(key)` | btree | não | Permite grupos dinâmicos sem alterar schema. |
| `niche` | `text` | não | `NULL` | nenhum | inicialmente não | não | Classificação editorial livre. |
| `category` | `text` | não | `NULL` | nenhum | inicialmente não | não | Classificação de negócio/conteúdo. |
| `priority` | `smallint` | sim | `2` | `1..3` | via índice de fila | não | Ordenação operacional simples: 1 alta, 2 média, 3 baixa. |
| `tags` | `text[]` | sim | `{}` | nenhum | GIN | não | Segmentação flexível sem criar colunas. |
| `followers_count` | `bigint` | não | `NULL` | `>= 0` | não | não | Último valor conhecido para listagem; histórico ficará em snapshots. |
| `monitoring_status` | `text` | sim | `pending` | CHECK de estados | inicialmente não | não | Estado operacional da coleta, separado de `active`. |
| `active` | `boolean` | sim | `true` | nenhum | índice parcial de fila | não | Intenção do usuário de continuar monitorando. |
| `last_collected_at` | `timestamptz` | não | `NULL` | nenhum | não | não | Última coleta concluída com sucesso. |
| `next_collection_at` | `timestamptz` | não | `NULL` | nenhum | índice parcial de fila | não | Base de seleção futura do n8n. |
| `last_collection_error` | `text` | não | `NULL` | limite de tamanho | não | não | Último erro resumido; não substitui logs históricos. |
| `created_at` | `timestamptz` | sim | `now()` | nenhum | não | não | Auditoria básica. |
| `updated_at` | `timestamptz` | sim | `now()` | trigger futuro | não | não | Auditoria básica. |
| `created_by` | `uuid` | sim | `auth.uid()` | FK `auth.users(id)` | btree | não | Identifica o usuário interno que cadastrou a fonte. |

### Campos descartados ou substituídos

#### `instagram_url`

**Descartar como coluna.** Deve ser derivada de `instagram_username`:

`https://www.instagram.com/{instagram_username}/`

Guardar os dois cria risco de inconsistência quando o username muda.

#### `country`

**Substituir por `country_code`** para deixar explícito que o valor é um código de mercado, não um texto livre.

#### `provider` e `provider_profile_id`

**Não colocar em `monitored_profiles`.** O perfil canônico não deve depender do fornecedor de coleta.

Metadados específicos de provider devem, futuramente, ficar em uma entidade de binding, por exemplo:

`instagram_provider_bindings(monitored_profile_id, provider_key, provider_profile_id, metadata, last_seen_at)`

Esse nome também é apenas conceitual.

## 4. Username do Instagram

A normalização local deve produzir uma chave canônica antes de qualquer tentativa de consultar o Instagram.

### Exemplos

| Entrada | Resultado |
|---|---|
| `@alfredosoares` | `alfredosoares` |
| `alfredosoares` | `alfredosoares` |
| `instagram.com/alfredosoares` | `alfredosoares` |
| `https://instagram.com/alfredosoares/` | `alfredosoares` |
| `https://www.instagram.com/alfredosoares/?hl=pt-br` | `alfredosoares` |

### Regras propostas

1. aplicar `trim()`;
2. aceitar username puro, username iniciado por `@` ou URL do Instagram;
3. quando URL, aceitar somente host do Instagram previamente permitido;
4. remover query string e fragment;
5. usar somente o primeiro segmento de path esperado para perfil;
6. remover `@` inicial;
7. remover barras externas;
8. transformar em lowercase;
9. rejeitar espaços internos;
10. aceitar localmente somente `a-z`, `0-9`, `.` e `_`;
11. rejeitar string vazia;
12. limitar o tamanho por proteção da aplicação, sem tratar isso como prova de existência;
13. rejeitar rotas conhecidas que não representam perfil quando a entrada for URL.

### Limite da normalização

Normalizar **não confirma que a conta existe**.

A validação de existência será responsabilidade do provider futuro e poderá retornar perfil inexistente, privado, indisponível, renomeado ou temporariamente inacessível.

## 5. `profile_group`

### Opções avaliadas

#### PostgreSQL ENUM

Vantagem: integridade forte.

Desvantagem: adicionar ou reorganizar grupos exige alteração de schema. Não combina com a expectativa de novos grupos.

#### TEXT + CHECK

Vantagem: simples.

Desvantagem: qualquer novo grupo ainda exige alterar a constraint, ou então perde-se integridade se o CHECK for removido.

#### Tabela de referência

**Recomendação.**

Tabela conceitual `profile_groups` com chave estável, label, ativo e ordenação. `monitored_profiles.profile_group` referencia a chave.

Benefícios:

- novos grupos não exigem migration;
- labels podem mudar sem alterar registros;
- grupos podem ser desativados sem apagar histórico;
- permite ordem de UI e metadados futuros.

Grupos iniciais previstos, como dados de configuração futuros:

- próprio;
- concorrente;
- referência Brasil;
- referência EUA;
- trendsetter.

Nenhum desses registros foi criado nesta etapa.

## 6. País

Usar `country_code text` com ISO 3166-1 alpha-2 em uppercase.

Exemplos:

- `BR`
- `US`

Não usar ENUM de países. Novos mercados não devem exigir migration.

O campo representa o **mercado operacional associado ao perfil no Radar**, não uma inferência automática de nacionalidade.

## 7. Prioridade

Usar `smallint`:

- `1` = alta;
- `2` = média;
- `3` = baixa.

Default: `2`.

Motivos:

- ordenação natural de fila;
- comparação simples;
- fácil uso em n8n;
- evita depender de ordem lexicográfica de strings.

A frequência exata de coleta não deve ser codificada nesta tabela. Ela deve ser calculada pela camada de orquestração/configuração futura.

## 8. Status operacional

### `active`

Responde:

> O usuário quer que este perfil continue sendo monitorado?

`true` ou `false`.

### `monitoring_status`

Responde:

> Qual é a saúde operacional conhecida da fonte?

Estados iniciais propostos:

- `pending`: cadastrado e ainda sem primeira coleta bem-sucedida;
- `healthy`: última operação relevante concluiu normalmente;
- `error`: existe falha operacional que requer retry ou atenção.

### Por que não armazenar `paused`

`paused` duplicaria o significado de `active = false` e poderia gerar inconsistência.

Na UI, quando `active = false`, o estado visual pode ser “Pausado”, preservando `monitoring_status` como a última saúde operacional conhecida.

Estados transitórios como `collecting` devem ser avaliados junto com a futura estratégia de fila/lock e tabela de execuções, para evitar estados presos.

## 9. Segurança, Auth e RLS

### Estado atual

- O Supabase Auth existe como subsistema.
- Existem 0 usuários e 0 identidades.
- O frontend não possui tela de login nem guard de rotas.
- `useSupabaseHealth` chama `getSession()` apenas para validar a disponibilidade da conexão.
- Não existem tabelas de negócio nem policies de negócio.

### Arquitetura recomendada para uso interno

Usar Supabase Auth com acesso por convite, sem cadastro público aberto.

Papéis propostos em `raw_app_meta_data` / `app_metadata`:

- `viewer`: pode visualizar;
- `editor`: pode visualizar, cadastrar, alterar e pausar;
- `admin`: mesmos poderes operacionais, além de futuras configurações administrativas.

Não usar `user_metadata` para autorização.

### Matriz de acesso futura

| Ação | viewer | editor | admin | anon |
|---|---:|---:|---:|---:|
| visualizar perfis | sim | sim | sim | não |
| cadastrar perfil | não | sim | sim | não |
| alterar classificação | não | sim | sim | não |
| pausar/reativar | não | sim | sim | não |
| editar dados derivados do provider | não | não | não pelo frontend | não |
| excluir fisicamente | não | não | não pelo fluxo normal | não |

### DELETE

Não criar policy de DELETE para o frontend.

Preferir `active = false`.

Exclusão física, se algum dia for necessária por privacidade, erro operacional ou retenção, deve ocorrer por fluxo administrativo controlado e explícito.

### `created_by`

- preenchido com `auth.uid()` no INSERT;
- validado por RLS;
- imutável depois da criação;
- não deve ser editável pelo formulário.

### Observação sobre claims

Papéis em `app_metadata` entram no JWT. Mudanças de papel podem exigir refresh de sessão para refletir imediatamente nas policies.

## 10. Contrato TypeScript

Proposta conceitual, não implementada em `src` nesta etapa:

```ts
export type CountryCode = string

export interface ProfileGroup {
  key: string
  label: string
  active: boolean
  sortOrder: number
}

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
  countryCode: CountryCode
  profileGroup: string
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
  createdBy: string
}

export interface ListProfilesParams {
  active?: boolean
  countryCode?: CountryCode
  profileGroup?: string
  priority?: ProfilePriority
  search?: string
}

export interface CreateProfileInput {
  instagramInput: string
  countryCode: CountryCode
  profileGroup: string
  niche?: string | null
  category?: string | null
  priority: ProfilePriority
  tags?: string[]
  active?: boolean
}

export interface UpdateProfileInput {
  countryCode?: CountryCode
  profileGroup?: string
  niche?: string | null
  category?: string | null
  priority?: ProfilePriority
  tags?: string[]
}

export interface ProfilesRepository {
  listProfiles(params?: ListProfilesParams): Promise<MonitoredProfile[]>
  createProfile(input: CreateProfileInput): Promise<MonitoredProfile>
  updateProfile(id: string, input: UpdateProfileInput): Promise<MonitoredProfile>
  setProfileActive(id: string, active: boolean): Promise<MonitoredProfile>
}
```

Campos derivados do provider não entram em `UpdateProfileInput` do frontend.

## 11. Próxima versão técnica de `/profiles`

### Cabeçalho

**Perfis Monitorados**

CTA: **Adicionar perfil**

### Drawer ou modal

Campos:

- Instagram URL ou @;
- Grupo;
- País;
- Nicho;
- Categoria;
- Prioridade;
- Tags;
- Ativo.

O formulário deve normalizar a entrada localmente e, futuramente, enviar apenas a forma canônica.

### Listagem

Colunas previstas:

- Avatar;
- Nome;
- @username;
- Grupo;
- País;
- Seguidores;
- Status;
- Última coleta;
- Posts coletados;
- Prioridade.

### Regras de ausência

Antes da primeira coleta:

**Aguardando primeira coleta**

Métrica inexistente:

**Dados insuficientes**

`posts coletados` não deve ser uma coluna persistida em `monitored_profiles` agora. Quando posts existirem, esse total deverá vir de agregação ou leitura derivada.

## 12. Contrato futuro com n8n

Não implementado.

Fluxo conceitual:

1. n8n consulta perfis com `active = true`;
2. filtra `next_collection_at IS NULL OR next_collection_at <= now()`;
3. ordena por prioridade e vencimento;
4. seleciona lote limitado;
5. chama um `InstagramProviderAdapter`;
6. normaliza a resposta;
7. atualiza somente os campos derivados e operacionais autorizados;
8. define `last_collected_at`, `next_collection_at`, `monitoring_status`;
9. em erro, registra resumo em `last_collection_error` e agenda retry;
10. futuramente persiste posts, snapshots e execução em entidades próprias.

### Credenciais

n8n é servidor e não deve usar a publishable key do frontend como credencial operacional.

Uma credencial privilegiada futura deve ficar somente no cofre/credentials do n8n ou em outra camada server-side, nunca no browser, GitHub ou logs.

O desenho definitivo da credencial n8n exige autorização na etapa de implementação.

## 13. Provider Adapter

O domínio não deve conhecer detalhes de Apify, Playwright, Instaloader, API oficial ou qualquer fornecedor pago.

Contrato conceitual:

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

### Metadata específica do provider

Não guardar `provider` e `provider_profile_id` em `monitored_profiles`.

Se necessário, criar futuramente uma entidade separada de bindings. Assim o provider pode ser trocado sem migrar a identidade canônica do perfil.

## 14. Riscos

1. **Username muda:** usar `instagram_external_id` quando disponível ajuda a reconhecer a mesma conta.
2. **Provider indisponível:** não marcar conta como inexistente com base em uma única falha.
3. **Followers é variável temporal:** valor em `monitored_profiles` é apenas cache do último estado.
4. **URL de avatar expira:** tratar como cache descartável.
5. **Claims de papel podem ficar stale:** refresh da sessão após mudanças de `app_metadata`.
6. **Credencial n8n privilegiada:** comprometimento teria alto impacto; manter em cofre e restringir escopo.
7. **Erros longos ou sensíveis:** `last_collection_error` deve ser sanitizado e limitado.
8. **Delete físico perde histórico:** preferir desativação.
9. **Grupo dinâmico:** não codificar grupos como ENUM.
10. **País inferido automaticamente:** evitar; país é classificação operacional definida pelo produto.

## 15. Decisões pendentes

Requerem aprovação antes de implementação:

1. nome final `monitored_profiles`;
2. criação de `profile_groups`;
3. valores iniciais dos grupos;
4. obrigatoriedade de `country_code`;
5. estados finais de `monitoring_status`;
6. papéis internos `viewer/editor/admin`;
7. método de login interno;
8. desativação de signup público no Supabase Auth;
9. política de retenção/exclusão;
10. estratégia exata de credencial n8n;
11. provider inicial do Instagram;
12. frequência de coleta por prioridade;
13. modelo futuro de provider bindings.

## 16. SQL draft

> **DRAFT — NÃO APLICADO**
>
> O SQL abaixo existe somente para revisão arquitetural.
> Não é migration e não foi executado.

```sql
-- ============================================================
-- DRAFT — NÃO APLICADO
-- Caliber Trend Radar: foundation for monitored profiles
-- ============================================================

create table public.profile_groups (
  key text primary key,
  label text not null,
  active boolean not null default true,
  sort_order smallint not null default 100,
  created_at timestamptz not null default now(),

  constraint profile_groups_key_format
    check (key ~ '^[a-z0-9_]+$')
);

create table public.monitored_profiles (
  id uuid primary key default gen_random_uuid(),

  instagram_username text not null,
  instagram_external_id text null,

  display_name text null,
  profile_picture_url text null,

  country_code text not null,
  profile_group text not null
    references public.profile_groups(key)
    on update cascade
    on delete restrict,

  niche text null,
  category text null,

  priority smallint not null default 2,
  tags text[] not null default '{}',

  followers_count bigint null,

  monitoring_status text not null default 'pending',
  active boolean not null default true,

  last_collected_at timestamptz null,
  next_collection_at timestamptz null,
  last_collection_error text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null default auth.uid()
    references auth.users(id)
    on delete restrict,

  constraint monitored_profiles_instagram_username_lowercase
    check (instagram_username = lower(instagram_username)),

  constraint monitored_profiles_instagram_username_format
    check (
      char_length(instagram_username) between 1 and 64
      and instagram_username ~ '^[a-z0-9._]+$'
    ),

  constraint monitored_profiles_country_code_format
    check (country_code ~ '^[A-Z]{2}$'),

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

create index monitored_profiles_country_idx
  on public.monitored_profiles (country_code);

create index monitored_profiles_group_idx
  on public.monitored_profiles (profile_group);

create index monitored_profiles_created_by_idx
  on public.monitored_profiles (created_by);

create index monitored_profiles_tags_gin_idx
  on public.monitored_profiles
  using gin (tags);

create index monitored_profiles_collection_queue_idx
  on public.monitored_profiles (priority, next_collection_at)
  where active = true;

create or replace function public.set_updated_at()
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
execute function public.set_updated_at();

alter table public.profile_groups enable row level security;
alter table public.monitored_profiles enable row level security;

-- Explicitly deny anonymous access.
revoke all on public.profile_groups from anon;
revoke all on public.monitored_profiles from anon;

-- Authenticated users get only the privileges needed by the client.
grant select on public.profile_groups to authenticated;
grant select on public.monitored_profiles to authenticated;

grant insert (
  instagram_username,
  country_code,
  profile_group,
  niche,
  category,
  priority,
  tags,
  active
) on public.monitored_profiles to authenticated;

grant update (
  country_code,
  profile_group,
  niche,
  category,
  priority,
  tags,
  active
) on public.monitored_profiles to authenticated;

create policy "profile_groups_select_internal"
on public.profile_groups
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('viewer', 'editor', 'admin')
);

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
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('editor', 'admin')
  and created_by = (select auth.uid())
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

-- Deliberadamente sem GRANT DELETE e sem policy DELETE.
-- Desativação normal: active = false.
```
