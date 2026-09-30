# Caliber Trend Radar

Frontend executivo de Instagram Social Intelligence.

## Estado atual

- React + TypeScript + Vite.
- Supabase: `zqwlyqnwcpddmknjnune`.
- Auth interno por e-mail + senha.
- Primeiro admin real criado, sem credenciais versionadas.
- Login, reload de sessão e logout validados no fluxo real.
- Rotas internas protegidas.
- Sessão sem papel válido não carrega o shell interno.
- `public.monitored_profiles` implementada com RLS.
- `/profiles` conectado a dados reais.
- Um perfil real cadastrado pelo fluxo da aplicação para validar criação, edição, auditoria e pausa/reativação.
- Nenhum perfil fake ou seed persistente.
- n8n, provider Instagram, posts, snapshots e Trend Engine ainda não foram implementados.

## Rotas

`/login`, `/dashboard`, `/trends`, `/trends/:id`, `/competitors`, `/usa`, `/profiles`, `/posts`, `/opportunities`, `/alerts`, `/settings`.

## Auth interno

O procedimento completo e seguro está em:

`docs/AUTH_SETUP.md`

Regras:

1. usuários internos são criados no Supabase Auth;
2. autorização usa `app_metadata.trend_radar_role`;
3. o frontend não altera `app_metadata`;
4. secret/service role nunca entra em `VITE_*`, GitHub ou bundle;
5. para um produto estritamente interno, o self-signup público deve ser conferido no painel do Supabase.

## Desenvolvimento

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Use `.env.example` como referência.

O browser usa somente:

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_PUBLISHABLE_KEY`.

Não existe fallback hardcoded para URL/chave do Supabase.

## Banco

Migration aplicada e versionada uma única vez:

`supabase/migrations/20260930195835_create_monitored_profiles_foundation.sql`

Veja `/docs` para arquitetura, segurança, modelo de dados e roadmap.
