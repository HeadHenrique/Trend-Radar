# Changelog

## 2026-10-01 — Etapa 3

### n8n

- workflow `Trend Radar — Profile Collector POC` criado no projeto pessoal;
- workflow ID `BijTnAz2cSLTMzva`;
- permaneceu DRAFT / não publicado;
- Manual Trigger somente;
- sem Schedule Trigger recorrente;
- canvas organizado em grupo visual de ingestão.

### Provider

- Bright Data Instagram Profiles Scraper API integrado por HTTP Request;
- credential `Trend Radar — Bright Data API` do tipo `httpHeaderAuth`;
- nenhum token versionado ou impresso em documentação;
- provider adapter explícito `InstagramProviderProfileResult`.

### Supabase no n8n

- credential `Supabase account` do tipo `supabaseApi`;
- leitura server-side de `monitored_profiles`;
- update restrito aos campos operacionais/provider;
- nenhuma alteração de schema ou migration nova.

### POC real

- perfil real: `leonardofroese`;
- Bright Data retornou perfil correspondente;
- external ID real gravado;
- display name real gravado;
- profile picture real gravada;
- followers count real gravado;
- `monitoring_status = healthy`;
- `last_collected_at` preenchido;
- `next_collection_at` definido em +6h para prioridade 2;
- `last_collection_error = null`.

### Execuções

Foram realizadas 3 execuções manuais:

1. provider iniciou corretamente; falha local em condição booleana do IF;
2. condição corrigida; provider ainda estava `running` após a janela inicial de ~45s e o fluxo de erro foi validado;
3. o snapshot existente foi reutilizado para evitar uma terceira coleta, terminou `ready`, foi normalizado e atualizou o Supabase com sucesso.

A coleta observada levou aproximadamente 59 segundos. O draft final passou a usar 3 checagens com 25 segundos de espera.

### Generalização

Após a POC:

- removido username hardcoded do fluxo;
- workflow passa a buscar o próximo perfil `active=true` e `monitoring_status=pending`;
- limite 1;
- ordenação por prioridade;
- Bright Data voltou ao trigger dinâmico usando o username vindo do Supabase.

### Escopo

Não foram implementados:

- posts em banco;
- tabela posts;
- profile snapshots;
- post snapshots;
- IA;
- Trend Score;
- Brazil Gap;
- Trend Engine;
- publicação do workflow;
- schedule recorrente.

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
