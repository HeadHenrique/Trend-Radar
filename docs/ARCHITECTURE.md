# Architecture

## Status

Frontend implementado. Nenhuma alteração foi aplicada ao banco Supabase nesta etapa.

## Stack

- React
- TypeScript
- Vite
- React Router
- Supabase JS
- Vercel
- CSS próprio

## Camadas atuais

1. **Presentation**
   - páginas em `src/pages`;
   - componentes em `src/components`.
2. **Application**
   - rotas em `src/App.tsx`;
   - estados loading, empty, error e success.
3. **Data access**
   - cliente Supabase em `src/lib/supabase.ts`;
   - health check em `src/hooks/useSupabaseHealth.ts`.

## Estado real do Supabase

Inspeção em 30/09/2026:

- projeto `zqwlyqnwcpddmknjnune` ativo;
- schema `public` sem tabelas de negócio;
- 0 migrations de projeto;
- 0 Edge Functions;
- 0 policies em `public` e `storage`;
- Auth presente como subsistema, mas com 0 usuários e 0 identidades.

## Fronteira proposta para Perfis Monitorados

A próxima fundação deve separar quatro responsabilidades:

```text
Frontend /profiles
        |
        v
Supabase Auth
        |
        v
RLS + monitored_profiles
        |
        +---- classificação humana
        |
        +---- estado operacional atual
        |
        v
Orquestração futura (n8n)
        |
        v
InstagramProviderAdapter
        |
        v
Provider de Instagram
```

Nenhuma dessas estruturas de backend foi criada nesta etapa.

## Segurança proposta

- frontend usa somente publishable key;
- escrita futura exige usuário autenticado;
- acesso anônimo a dados de negócio deve ser negado;
- autorização deve usar `app_metadata`, nunca `user_metadata`;
- `viewer`, `editor` e `admin` são papéis conceituais para revisão;
- DELETE físico não faz parte do fluxo normal;
- n8n usará credencial server-side futura, nunca a publishable key do browser.

## Independência de provider

O banco canônico não deve depender de Apify, Playwright, Instaloader, API oficial ou outro fornecedor.

`monitored_profiles` guarda identidade e estado canônicos.

Identificadores específicos de fornecedor devem ficar em uma entidade futura de bindings.

## Princípio de dados

O frontend não estima valores ausentes. Quando o backend não fornece uma métrica, a interface mostra `Dados insuficientes`.

A especificação detalhada da fundação de perfis está em `docs/PROFILE_FOUNDATION.md`.
