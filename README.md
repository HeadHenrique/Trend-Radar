# Caliber Trend Radar

Frontend executivo de Instagram Social Intelligence para identificar tendências emergentes, aceleração, saturação, diferenças EUA × Brasil, movimentos de concorrentes e oportunidades de conteúdo.

## Estado atual

- Frontend: implementado em React + TypeScript + Vite.
- Supabase: conectado ao projeto `zqwlyqnwcpddmknjnune`.
- Banco observado em 30/09/2026: schema `public` sem tabelas.
- Dados fictícios: não utilizados.
- Métricas ausentes: exibidas como **Dados insuficientes**.
- Backend/schema: não alterado.

## Rotas

`/dashboard`, `/trends`, `/trends/:id`, `/competitors`, `/usa`, `/profiles`, `/posts`, `/opportunities`, `/alerts`, `/settings`.

## Desenvolvimento

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Use `.env.example` como referência. A aplicação aceita `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.

Veja `/docs` para arquitetura, produto, modelo de dados, motor de tendências, API, UI, segurança, roadmap e changelog.
