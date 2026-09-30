# API Spec

## Estado atual

O frontend usa `@supabase/supabase-js` conectado ao projeto `zqwlyqnwcpddmknjnune`.

Ainda não existem:

- tabelas de negócio em `public`;
- Profiles Repository implementado;
- Auth de aplicação;
- Edge Functions de negócio.

## Contrato conceitual de Perfis

Não implementado:

```ts
export type MarketCode = string

export type ProfileGroup =
  | 'own'
  | 'competitor'
  | 'reference'
  | 'trendsetter'

export interface ProfilesRepository {
  listProfiles(params?: ListProfilesParams): Promise<MonitoredProfile[]>
  createProfile(input: CreateProfileInput): Promise<MonitoredProfile>
  updateProfile(id: string, input: UpdateProfileInput): Promise<MonitoredProfile>
  setProfileActive(id: string, active: boolean): Promise<MonitoredProfile>
}
```

## `listProfiles()`

Filtros conceituais:

- ativo/inativo;
- `primaryMarketCode`;
- `profileGroup`;
- prioridade;
- busca por username/nome.

## `createProfile()`

Entrada humana:

- Instagram URL ou @;
- mercado principal;
- grupo estratégico;
- nicho;
- categoria;
- prioridade;
- tags;
- ativo.

O cliente não envia:

- `created_by`;
- `updated_by`;
- campos derivados do provider.

`created_by` deve ser preenchido no banco com o usuário autenticado.

## `updateProfile()`

O frontend comum altera somente campos humanos:

- `instagramUsername`, apenas enquanto a identidade ainda não foi resolvida;
- `primaryMarketCode`;
- `profileGroup`;
- `niche`;
- `category`;
- `priority`;
- `tags`;
- `active`.

O cliente não pode atualizar:

- `instagramExternalId`;
- `displayName`;
- `profilePictureUrl`;
- `followersCount`;
- `monitoringStatus`;
- `lastCollectedAt`;
- `nextCollectionAt`;
- `lastCollectionError`;
- `createdBy`;
- `updatedBy`.

A restrição deve existir no banco por privilégios de coluna, não apenas na UI.

## Regra de username

Antes de existir `instagramExternalId`, editor/admin pode corrigir o username.

Depois da resolução da identidade, o frontend autenticado comum não pode alterá-lo.

Rename real do Instagram deve ser sincronizado por backend/provider confirmando o mesmo external ID.

## Auditoria humana

`updated_by` representa o último editor humano.

Ele deve ser preenchido por lógica de banco quando campos humanos mudarem.

Atualizações do n8n em campos operacionais não devem alterar `updated_by`.

## RLS e privilégios

### anon

Nenhum acesso.

### viewer

SELECT permitido pelas policies.

### editor/admin

- SELECT;
- INSERT nos campos humanos;
- UPDATE somente nos campos humanos;
- sem DELETE.

RLS controla quais linhas podem ser lidas/alteradas.

GRANT por coluna controla quais campos o frontend pode gravar.

## Backend/n8n futuro

A automação será responsável pelos campos operacionais/provider.

Ela deverá usar credencial server-side separada, nunca a publishable key do frontend.

## Estados de resposta

- consulta em andamento → `loading`;
- consulta válida sem registros → `empty`;
- erro de rede/permissão → `error`;
- dados válidos → `success`.

## Especificação detalhada

Ver `docs/PROFILE_FOUNDATION.md`.

Nenhum contrato deste documento cria API, tabela ou policy automaticamente.
