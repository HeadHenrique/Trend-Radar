# API Spec

## Estado atual

O frontend usa `@supabase/supabase-js` conectado ao projeto `zqwlyqnwcpddmknjnune`.

No momento da inspeção:

- não existem tabelas de negócio em `public`;
- não existem endpoints de negócio consumidos pelo frontend;
- não existe implementação de Profiles Repository;
- não existe Auth de aplicação implementado;
- não existem Edge Functions de negócio.

## Health check atual

A aplicação usa `supabase.auth.getSession()` em `useSupabaseHealth` somente para verificar a disponibilidade da conexão.

Isso não protege rotas e não representa um fluxo de login.

## Chaves

No browser deve existir somente publishable key.

Nunca usar `service_role` ou secret key no frontend.

## Contrato conceitual de Perfis

Não implementado:

```ts
interface ProfilesRepository {
  listProfiles(params?: ListProfilesParams): Promise<MonitoredProfile[]>
  createProfile(input: CreateProfileInput): Promise<MonitoredProfile>
  updateProfile(id: string, input: UpdateProfileInput): Promise<MonitoredProfile>
  setProfileActive(id: string, active: boolean): Promise<MonitoredProfile>
}
```

### `listProfiles()`

Futuramente poderá filtrar por:

- ativo/inativo;
- país;
- grupo;
- prioridade;
- busca por username/nome.

### `createProfile()`

Recebe entrada humana de Instagram e classificação editorial.

Deve:

1. normalizar URL/@ localmente;
2. não fingir validação de existência;
3. persistir somente após autenticação e autorização;
4. preencher `created_by` com o usuário autenticado.

### `updateProfile()`

O frontend deve alterar somente campos de classificação humana:

- país;
- grupo;
- nicho;
- categoria;
- prioridade;
- tags.

Campos derivados do provider e campos operacionais de coleta não devem ser editados pelo formulário normal.

### `setProfileActive()`

Troca somente a intenção de monitoramento.

`active = false` deve ser o fluxo comum de pausa, preservando histórico.

## n8n futuro

A automação deve consultar perfis ativos e vencidos por `next_collection_at`, chamar o adapter de provider e atualizar somente dados derivados/operacionais.

A credencial da automação deverá ser server-side e não poderá ser reutilizada no frontend.

## Estados de resposta

- consulta em andamento → `loading`;
- consulta válida sem registros → `empty`;
- erro de rede/permissão → `error`;
- dados válidos → `success`.

## Especificação detalhada

Ver `docs/PROFILE_FOUNDATION.md`.

Nenhum contrato deste documento cria uma API ou tabela automaticamente.
