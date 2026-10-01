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
- [x] Auth e-mail + senha;
- [x] proteção de rotas;
- [x] tipos gerados;
- [x] data access;
- [x] normalização Instagram;
- [x] cadastro/listagem/edição/pausa;
- [x] busca e filtros;
- [x] sem dados fake.

## Fase 2.5 — Validação e hardening

- [x] primeiro admin real;
- [x] smoke test de Auth;
- [x] variáveis Vercel;
- [x] guard global de role;
- [x] primeiro perfil real;
- [x] edição/auditoria;
- [x] pausa/reativação;
- [x] advisors.

## Fase 3 — Primeira coleta real de perfil

- [x] inspecionar n8n;
- [x] configurar credenciais server-side;
- [x] criar `Trend Radar — Profile Collector POC`;
- [x] integrar Supabase;
- [x] integrar Bright Data Instagram Profiles;
- [x] coletar `leonardofroese` de forma real;
- [x] normalizar provider adapter;
- [x] validar identidade;
- [x] preencher provider fields reais;
- [x] marcar `monitoring_status = healthy`;
- [x] preencher `last_collected_at`;
- [x] definir `next_collection_at`;
- [x] tratamento de erro sanitizado;
- [x] polling/retry limitado;
- [x] generalizar draft sem username hardcoded;
- [x] manter workflow não publicado;
- [x] não persistir posts em tabelas de negócio.

## Próxima etapa — Etapa 3.1

Ainda não iniciada:

- [ ] modelar posts;
- [ ] criar snapshots iniciais;
- [ ] definir estratégia de ingestão de posts;
- [ ] validar primeira carga real de posts.

## Futuro

- Trend Engine;
- scores;
- oportunidades;
- alertas;
- relatórios;
- IA.
