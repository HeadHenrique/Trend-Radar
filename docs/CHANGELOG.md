# Changelog

## 2026-09-30 — Etapa 2

### Database

- migration `20260930195835_create_monitored_profiles_foundation`;
- tabela `public.monitored_profiles`;
- constraints e índices;
- triggers de auditoria e proteção de username;
- RLS;
- grants por coluna;
- sem DELETE para frontend.

### Auth

- login com e-mail + senha;
- restauração de sessão;
- logout;
- proteção de rotas;
- papéis via `app_metadata.trend_radar_role`.

### Profiles

- tipos reais gerados do Supabase;
- data access centralizado;
- normalização de username/URL do Instagram;
- cadastro real;
- listagem real;
- edição dos campos humanos;
- pausa/reativação;
- busca e filtros;
- estados reais sem mocks.

### Security

- campos provider somente leitura para frontend;
- `created_by` e `updated_by` protegidos;
- security advisor sem findings.

## 2026-09-30 — Fundação inicial

- frontend React + TypeScript + Vite;
- dashboard e rotas executivas;
- integração Supabase;
- documentação técnica;
- CI.
