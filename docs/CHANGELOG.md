# Changelog

## 2026-09-30 — Etapa 2.5

### Hardening

- removidos fallbacks hardcoded de URL e publishable key do Supabase;
- bootstrap mostra erro de configuração legível se variáveis Vite obrigatórias estiverem ausentes;
- guard global bloqueia sessão sem `trend_radar_role` válido antes de carregar o shell;
- variáveis de produção configuradas na Vercel e redeploy validado.

### Auth real

- primeiro usuário interno real criado no Supabase Auth;
- papel `admin` atribuído em `app_metadata.trend_radar_role`;
- login real validado;
- restauração de sessão após reload validada;
- logout real validado;
- novo login validado;
- nenhuma credencial adicionada ao repositório.

### Perfil real

- cadastro real de `leonardofroese` pelo frontend;
- grupo estratégico `own`;
- mercado primário `BR`;
- provider fields permaneceram nulos;
- `monitoring_status = pending`;
- `created_by` preenchido pelo usuário autenticado;
- edição de campo humano validada com `updated_at` e `updated_by`;
- pausa e reativação validadas por `active`.

### Segurança e advisors

- RLS e grants revalidados;
- anon permanece sem acesso;
- authenticated sem DELETE e sem escrita em campos provider/auditoria;
- security advisor reportou apenas WARN de Leaked Password Protection desabilitado, configuração Auth de projeto não criada pela migration;
- performance advisor reportou 6 índices INFO ainda não utilizados, mantidos nesta etapa.

### Escopo

- nenhuma migration adicional aplicada;
- nenhuma tabela/policy/trigger duplicada;
- n8n não utilizado;
- provider/coleta de Instagram não implementados;
- nenhum dado de Instagram foi preenchido manualmente.

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
- `created_by` e `updated_by` protegidos.

## 2026-09-30 — Fundação inicial

- frontend React + TypeScript + Vite;
- dashboard e rotas executivas;
- integração Supabase;
- documentação técnica;
- CI.
