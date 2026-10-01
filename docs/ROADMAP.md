# Roadmap

## Concluído

- [x] monitored_profiles
- [x] Profile Collector POC
- [x] posts/snapshots foundation
- [x] primeira ingestão real de posts
- [x] arquitetura de associações
- [x] migration de associações
- [x] post canônico global
- [x] monitored_profile_posts
- [x] backfill 19/19
- [x] nova FK de snapshots
- [x] índice de cobertura da nova FK
- [x] database.types.ts regenerado
- [x] Posts Collector adaptado
- [x] author/collaborator/discovered
- [x] regra de não downgrade
- [x] replay terminal protegido
- [x] workflow permanece DRAFT

## Etapa 3.3.2

Implementação estrutural concluída.

Não executado:

- Posts Collector
- Bright Data
- 20º post
- data repair de counters

## Próxima etapa

Validação controlada do collector novo.

Pendências:

- executar uma coleta/reprocessamento autorizado;
- validar comportamento de Dc9H9yExV6q;
- decidir data repair histórico;
- depois avaliar Reels enrichment;
- depois UI /posts;
- depois Trend Engine.


## Etapa 3.3.3 — Validação real

Concluído:

- [x] reinspecionar estado real;
- [x] confirmar perfil saudável = leonardofroese;
- [x] executar uma única nova coleta lógica;
- [x] criar novo collection_run;
- [x] criar novo provider_run_id;
- [x] confirmar tratamento de provider `records=0`;
- [x] confirmar 0 alterações em posts/associações/snapshots;
- [x] confirmar nenhuma associação rebaixada;
- [x] rodar Security Advisor;
- [x] rodar Performance Advisor;
- [x] workflow continua DRAFT/active=false/sem Schedule.

Inconclusivo por ausência de dados no batch:

- [ ] validar author em novo payload;
- [ ] validar collaborator em runtime;
- [ ] validar discovered em runtime;
- [ ] validar `Dc9H9yExV6q` na nova lógica;
- [ ] validar snapshots da nova coleta.

Próxima coleta real requer nova autorização. Não executar automaticamente.
