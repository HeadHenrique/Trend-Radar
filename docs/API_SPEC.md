# API Spec

## Supabase client

O frontend usa o Data API via `@supabase/supabase-js` com publishable key e JWT do usuário autenticado.

## Auth

Implementado:

- `signInWithPassword`;
- `signOut`;
- restauração de sessão;
- listener de mudança de sessão.

Não existe signup público na UI.

## Profiles Repository

Implementado em `src/features/profiles/repository.ts`:

```ts
listProfiles(params?)
createProfile(input)
updateProfile(id, input)
setProfileActive(id, active)
```

### Escrita humana

O cliente envia somente:

- instagram username;
- mercado;
- grupo;
- nicho;
- categoria;
- prioridade;
- tags;
- active.

Não envia campos operacionais/provider nem auditoria.

### Username

É normalizado em `normalizeInstagram.ts`.

Depois de existir `instagram_external_id`, o banco protege o username contra mudança pelo frontend.

### Estados

A página trata:

- loading;
- empty;
- error;
- success.

## Ingestão server-side via n8n

Workflow:

`Trend Radar — Profile Collector POC`

ID:

`BijTnAz2cSLTMzva`

Estado:

`DRAFT / NÃO PUBLICADO`

### Entrada

O workflow consulta `public.monitored_profiles` e seleciona um registro:

- `active = true`;
- `monitoring_status = pending`;
- limite 1;
- prioridade ascendente.

### Provider

Bright Data Instagram Profiles Scraper API.

A requisição usa o username vindo do registro real do Supabase para formar a URL pública do perfil. Nenhum username fica hardcoded na versão final do workflow.

### Formato normalizado

```ts
type InstagramProviderProfileResult = {
  instagramUsername: string
  instagramExternalId: string | null
  displayName: string | null
  profilePictureUrl: string | null
  followersCount: number | null
  fetchedAt: string
}
```

Campos ausentes permanecem `null`.

### Validação de identidade

Antes do update, o username retornado pelo provider precisa corresponder ao `instagram_username` solicitado.

`instagram_external_id` é preenchido somente com ID real retornado pelo provider.

### Update de sucesso

Somente:

- `instagram_external_id`;
- `display_name`;
- `profile_picture_url`;
- `followers_count`;
- `monitoring_status = healthy`;
- `last_collected_at`;
- `next_collection_at`;
- `last_collection_error = null`.

### Update de erro

Somente:

- `monitoring_status = error`;
- `last_collection_error`.

Dados provider válidos anteriores não são limpos em erro.

### Credenciais

Somente nomes/tipos são documentados:

- `Supabase account` — `supabaseApi`;
- `Trend Radar — Bright Data API` — `httpHeaderAuth`.

Valores de credenciais não ficam no GitHub, frontend, documentação ou parâmetros visíveis dos nodes.

## Posts

A Etapa 3 não persiste posts, não cria tabela de posts e não envia posts para IA.

O provider de perfil pode devolver campos adicionais no payload bruto, mas apenas os metadados definidos no adapter acima são normalizados e gravados no Supabase.
