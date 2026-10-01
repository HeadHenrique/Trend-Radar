# Roadmap

## Fase 1 — Frontend foundation

- [x] frontend base;
- [x] rotas;
- [x] estados;
- [x] CI;
- [x] conexão Supabase.

## Fase 1.5 — Arquitetura de Perfis

- [x] modelo;
- [x] mercado/grupo;
- [x] auditoria;
- [x] RLS;
- [x] SQL draft.

## Fase 2 — Perfis Monitorados

- [x] migration versionada;
- [x] `monitored_profiles`;
- [x] constraints;
- [x] índices;
- [x] triggers;
- [x] grants de coluna;
- [x] RLS;
- [x] Auth;
- [x] data access;
- [x] cadastro/listagem/edição/pausa.

## Fase 2.5 — Validação e hardening

- [x] primeiro admin real;
- [x] smoke test;
- [x] Vercel;
- [x] RLS/grants;
- [x] primeiro perfil real.

## Fase 3 — Primeira coleta real de perfil

- [x] n8n;
- [x] Bright Data;
- [x] provider adapter;
- [x] metadata real;
- [x] frontend validado;
- [x] workflow permanece DRAFT.

## Fase 3.1 — Fundação de Posts e Snapshots

Arquitetura concluída, implementação **não autorizada**:

- [x] reinspecionar estado real;
- [x] definir `instagram_posts`;
- [x] definir identidade/deduplicação;
- [x] definir `post_metric_snapshots`;
- [x] definir `profile_metric_snapshots`;
- [x] recomendar `collection_runs`;
- [x] definir idempotência por collection run;
- [x] definir RLS/grants propostos;
- [x] definir índices propostos;
- [x] definir contratos provider-neutral;
- [x] definir limite inicial de 20 posts;
- [x] definir frequência conceitual de snapshots;
- [x] documentar ajuste futuro do Profile Collector;
- [x] SQL draft documentado;
- [ ] migration autorizada;
- [ ] tabelas criadas;
- [ ] workflow de posts implementado;
- [ ] primeira ingestão de posts;
- [ ] snapshots reais.

## Futuro

- Trend Engine;
- scores;
- oportunidades;
- alertas;
- relatórios;
- IA.
