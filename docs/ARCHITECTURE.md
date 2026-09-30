# Architecture

## Stack

- React;
- TypeScript;
- Vite;
- React Router;
- Supabase JS;
- Supabase Auth;
- PostgreSQL/RLS;
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
```

## Auth

- e-mail + senha;
- restauração de sessão;
- logout;
- rotas internas protegidas;
- sem tela pública de cadastro;
- papel lido de `user.app_metadata.trend_radar_role`.

## Data access

Queries de perfis ficam centralizadas em:

`src/features/profiles/repository.ts`

Funções:

- `listProfiles()`;
- `createProfile()`;
- `updateProfile()`;
- `setProfileActive()`.

## Tipos

Schema real gerado em:

`src/lib/database.types.ts`

Tipos de domínio/UI ficam separados em:

`src/features/profiles/types.ts`

## Segurança

RLS controla linhas e `GRANT` de coluna controla quais campos o frontend pode escrever.

Nenhuma credencial privilegiada está no frontend.

## Próxima fronteira

A próxima etapa poderá provar coleta real de um único perfil.

n8n, provider Instagram e posts permanecem fora desta implementação.
