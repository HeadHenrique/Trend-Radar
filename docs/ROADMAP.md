# Roadmap

## Fase 1–3.2

- [x] frontend foundation;
- [x] monitored_profiles;
- [x] Auth/RLS;
- [x] primeiro perfil real;
- [x] Profile Collector POC;
- [x] fundação real de posts/snapshots.

## Fase 3.3 — Primeira ingestão real de posts

- [x] reinspecionar Supabase/GitHub/n8n;
- [x] validar credenciais existentes;
- [x] pesquisar Posts Scraper atual;
- [x] confirmar limite no provider;
- [x] criar `Trend Radar — Posts Collector POC`;
- [x] collection_run antes do provider;
- [x] salvar provider_run_id real;
- [x] polling limitado;
- [x] coletar exatamente 20 registros do provider;
- [x] normalizar batch;
- [x] validar proprietário;
- [x] ordenar por published_at;
- [x] deduplicar;
- [x] persistir 19 posts válidos;
- [x] persistir snapshots somente de métricas observadas;
- [x] preservar NULL vs ZERO;
- [x] provar idempotência reutilizando o mesmo provider job;
- [x] 0 posts duplicados;
- [x] 0 snapshots duplicados;
- [x] workflow restaurado genérico;
- [x] workflow permanece DRAFT/não publicado;
- [x] sem Schedule Trigger;
- [x] sem UI de Posts;
- [x] sem IA/Trend Engine.

## Próxima etapa

A próxima etapa deve ser definida após revisar estes dados reais.

Pendências candidatas, ainda não autorizadas:

- decidir tratamento de collaborative/coauthor posts;
- avaliar se Reels Scraper é necessário para views/plays;
- desenhar a primeira UI de biblioteca de posts;
- definir recorrência/scheduler apenas após medir consumo.
