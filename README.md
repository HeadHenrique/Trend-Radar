# Caliber Trend Radar

Frontend executivo de Instagram Social Intelligence.

## Estado atual

- React + TypeScript + Vite.
- Supabase: `zqwlyqnwcpddmknjnune`.
- Auth interno por e-mail + senha.
- Rotas internas protegidas.
- `public.monitored_profiles` implementada com RLS.
- `/profiles` conectado a dados reais.
- Nenhum perfil fake ou seed persistente.
- n8n, provider Instagram, posts, snapshots e Trend Engine ainda não foram implementados.

## Rotas

`/login`, `/dashboard`, `/trends`, `/trends/:id`, `/competitors`, `/usa`, `/profiles`, `/posts`, `/opportunities`, `/alerts`, `/settings`.

## Primeiro usuário admin

Atualmente o projeto pode estar com zero usuários.

O procedimento completo e seguro está em:

`docs/AUTH_SETUP.md`

Resumo:

1. Crie o primeiro usuário real no Supabase Auth usando e-mail e senha.
2. Em ambiente server-side/admin, atribua `app_metadata.trend_radar_role = "admin"`.
3. Não use o frontend para alterar `app_metadata`.
4. Não exponha secret/service role em `VITE_*`, GitHub ou bundle.
5. Para um produto estritamente interno, verifique no painel do Supabase que self-signup público está desabilitado.

Depois de alterar `app_metadata`, renove a sessão para o JWT refletir o papel.

## Desenvolvimento

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Use `.env.example` como referência. O browser usa somente publishable key.

## Banco

Migration aplicada e versionada:

`supabase/migrations/20260930195835_create_monitored_profiles_foundation.sql`

Veja `/docs` para arquitetura, segurança, modelo de dados e roadmap.
