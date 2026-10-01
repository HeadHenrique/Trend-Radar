# Roadmap

## Fases concluídas

### Fase 1

- [x] frontend foundation.

### Fase 2

- [x] monitored_profiles;
- [x] Auth/RLS;
- [x] data access.

### Fase 2.5

- [x] hardening;
- [x] primeiro admin/perfil real.

### Fase 3

- [x] Profile Collector POC;
- [x] primeira coleta real de perfil;
- [x] frontend validado.

## Fase 3.1 — Fundação de Posts e Snapshots

Arquitetura inicial concluída.

## Fase 3.1.1 — Correção arquitetural

Concluído em documentação:

- [x] REVOKE explícito de service_role no SQL draft;
- [x] grants mínimos por tabela;
- [x] collection_runs server-side only;
- [x] provider_key separado de orchestrator;
- [x] provider_run_id provider-neutral;
- [x] orchestrator_run_id opcional;
- [x] collection run criado antes do provider;
- [x] retry/recovery reutiliza o mesmo run/job;
- [x] FKs compostas impedem cross-profile snapshots;
- [x] snapshots imutáveis;
- [x] NULL versus ZERO preservado;
- [x] frequência de snapshots marcada como conceitual;
- [x] limite de 20 posts marcado como configuração, não constraint;
- [x] função updated_at sem EXECUTE direto inclusive para service_role;
- [x] SQL DRAFT corrigido;
- [ ] migration autorizada;
- [ ] Supabase alterado;
- [ ] workflow de posts implementado;
- [ ] coleta real de posts.

## Próxima autorização necessária

Antes da implementação:

1. aprovar modelo corrigido;
2. autorizar migration;
3. depois autorizar alterações n8n e POC de posts.

## Futuro

- snapshots reais;
- baseline;
- Trend Engine;
- scores;
- oportunidades;
- IA.
