# Roadmap

## Até Etapa 3.3

- [x] monitored profiles;
- [x] Profile Collector;
- [x] posts/snapshots foundation;
- [x] primeira ingestão real de posts;
- [x] 19 posts / 19 snapshots;
- [x] idempotência técnica comprovada.

## Etapa 3.3.1 — Correção pós-POC

Arquitetura concluída, implementação não autorizada:

- [x] identificar limitação 1 post → 1 perfil;
- [x] projetar post canônico global;
- [x] projetar `monitored_profile_posts`;
- [x] definir association_type;
- [x] reinspecionar `Dc9H9yExV6q`;
- [x] confirmar colaboração explícita via `coauthor_producers`;
- [x] projetar nova integridade de snapshots;
- [x] definir migração dos 19 posts;
- [x] definir tratamento do 20º post;
- [x] corrigir semântica de collection run counters;
- [x] definir replay de run terminal;
- [x] definir recovery de error;
- [x] definir semântica de orchestrator_run_id;
- [x] recomendar hashtags TEXT[] nullable;
- [x] manter likes/comments em snapshots;
- [x] adiar views/plays enrichment;
- [x] SQL draft criado;
- [ ] migration autorizada;
- [ ] schema alterado;
- [ ] workflow ajustado;
- [ ] 20º post reprocessado.

## Próxima autorização necessária

Antes de qualquer implementação:

1. aprovar a fundação de associações;
2. autorizar migration corretiva;
3. autorizar separadamente mudança do Posts Collector;
4. autorizar eventual data repair do collection run atual.

Não iniciar Reels enrichment, UI /posts ou Trend Engine antes disso.
