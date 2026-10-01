# Architecture

## Stack

- React;
- TypeScript;
- Vite;
- React Router;
- Supabase JS;
- Supabase Auth;
- PostgreSQL/RLS;
- n8n;
- Bright Data Instagram Profiles Scraper API;
- Vercel.

## Fluxo atual

```text
/login
  ↓
Supabase Auth
  ↓
ProtectedRoute
  ↓
React UI
  ↓
Profiles Repository
  ↓
Supabase Data API
  ↓
RLS + column privileges
  ↓
public.monitored_profiles
  ↑
n8n — Trend Radar — Profile Collector POC
  ↑
Bright Data Instagram Profiles Scraper API
```

O frontend continua sem credencial privilegiada. O n8n possui credenciais server-side separadas e é responsável pelos campos operacionais/provider.

## Auth

- e-mail + senha;
- restauração de sessão;
- logout;
- rotas internas protegidas;
- sem tela pública de cadastro;
- papel lido de `user.app_metadata.trend_radar_role`.

## Data access do frontend

Queries de perfis ficam centralizadas em:

`src/features/profiles/repository.ts`

Funções:

- `listProfiles()`;
- `createProfile()`;
- `updateProfile()`;
- `setProfileActive()`.

## Ingestão de perfil

Workflow n8n:

- nome: `Trend Radar — Profile Collector POC`;
- ID: `BijTnAz2cSLTMzva`;
- estado: DRAFT / não publicado;
- trigger: Manual Trigger;
- provider: Bright Data Instagram Profiles Scraper API.

Fluxo do POC:

```text
Manual Trigger
  ↓
Buscar próximo monitored_profile active + pending
  ↓
Bright Data — disparar coleta
  ↓
polling limitado (máximo 3 checagens)
  ↓
baixar snapshot
  ↓
normalizar InstagramProviderProfileResult
  ↓
validar identidade
  ↓
Supabase: sucesso ou erro
```

O workflow seleciona o próximo perfil `active=true` e `monitoring_status=pending`, limitado a um registro e ordenado por prioridade. O username não fica hardcoded na versão final do draft.

## Provider adapter

A automação converte o payload do provider para:

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

Somente esse formato normalizado segue para a atualização de `monitored_profiles`.

## Retry / polling

- requests externos com retry limitado;
- máximo configurado: 3 tentativas nos nodes Bright Data;
- polling do snapshot: 3 checagens com 25 segundos entre elas;
- sem loops infinitos;
- timeout do workflow: 180 segundos.

A POC observou uma coleta real de aproximadamente 59 segundos, motivo pelo qual a janela inicial de 45 segundos foi ampliada.

## Sucesso

Atualiza apenas:

- `instagram_external_id`;
- `display_name`;
- `profile_picture_url`;
- `followers_count`;
- `monitoring_status`;
- `last_collected_at`;
- `next_collection_at`;
- `last_collection_error`.

Para prioridade 2, a POC definiu `next_collection_at = last collection + 6 horas`.

## Erro

Uma falha:

- define `monitoring_status = error`;
- grava mensagem curta e sanitizada em `last_collection_error`;
- não apaga dados provider válidos anteriores;
- não altera campos humanos.

## Escopo atual

Etapa 3 validou somente metadados do perfil.

Não foram criados:

- tabela de posts;
- snapshots de posts/perfis;
- Trend Engine;
- IA;
- scores;
- schedule recorrente.

Detalhes da prova real:

`docs/INGESTION_POC.md`
