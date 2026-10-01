# Roadmap

## Fase 1–3

- [x] frontend foundation;
- [x] monitored_profiles;
- [x] Auth/RLS;
- [x] primeiro admin e perfil real;
- [x] Profile Collector POC;
- [x] primeira coleta real de perfil.

## Fase 3.1

- [x] arquitetura de posts/snapshots;
- [x] correção arquitetural 3.1.1.

## Fase 3.2 — Fundação real de Posts e Snapshots

- [x] migration versionada criada;
- [x] migration aplicada;
- [x] collection_runs;
- [x] instagram_posts;
- [x] post_metric_snapshots;
- [x] profile_metric_snapshots;
- [x] constraint status/finished_at;
- [x] FKs simples e compostas;
- [x] unique indexes de identidade;
- [x] índices temporais aprovados;
- [x] trigger updated_at;
- [x] REVOKE explícito de service_role;
- [x] grants mínimos;
- [x] RLS/policies;
- [x] collection_runs server-side only;
- [x] teste cross-profile com rollback;
- [x] teste RLS com rollback;
- [x] snapshots imutáveis pelo collector;
- [x] database.types.ts regenerado;
- [x] Security Advisor;
- [x] Performance Advisor;
- [x] typecheck/build;
- [x] novas tabelas terminam vazias.

## Próxima etapa — 3.3

Ainda não autorizada:

- [ ] workflow de posts;
- [ ] chamada ao provider de posts;
- [ ] primeira ingestão real de até 20 posts;
- [ ] primeiros snapshots reais.

Não iniciar sem autorização explícita.
