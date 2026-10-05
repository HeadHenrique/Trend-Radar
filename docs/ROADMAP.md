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


## Etapa 3.3.3 — Validação real

Concluído:

- [x] reinspecionar estado real;
- [x] confirmar perfil saudável = leonardofroese;
- [x] executar uma única nova coleta lógica;
- [x] criar novo collection_run/provider_run_id;
- [x] tratar provider `records=0` sem alterar conteúdo existente;
- [x] confirmar 19 posts / 19 associações / 19 snapshots;
- [x] confirmar nenhuma associação rebaixada;
- [x] rodar Security Advisor e Performance Advisor;
- [x] workflow permanece DRAFT/active=false/sem Schedule.

Ainda pendente por ausência de dados no batch:

- [ ] validar author em novo payload;
- [ ] validar collaborator em runtime;
- [ ] validar discovered em runtime;
- [ ] validar `Dc9H9yExV6q` na nova lógica;
- [ ] validar novos snapshots.

Nova coleta real requer nova autorização.


## Etapa 3.3.4 — Reprocessamento controlado

Concluído:

- [x] snapshot histórico ainda acessível;
- [x] 0 chamadas de discovery;
- [x] novo collection_run exclusivo do reprocessamento;
- [x] 20 registros reais processados;
- [x] 19 posts existentes atualizados;
- [x] 1 post colaborativo inserido;
- [x] 19 author preservados;
- [x] 1 collaborator validado em runtime;
- [x] 0 discovered neste batch;
- [x] hashtags persistidas;
- [x] 20 snapshots novos;
- [x] 0 duplicações;
- [x] runs históricos preservados;
- [x] caminho temporário removido;
- [x] workflow restaurado DRAFT/active=false/sem Schedule.

Antes de Reels enrichment:

- avaliar necessidade real de views/plays;
- decidir data repair do run histórico separadamente;
- definir próxima etapa da UI /posts somente com autorização.


## Etapa 3.4 — Reels Enrichment POC

Concluído:

- [x] workflow separado DRAFT;
- [x] dataset Reels atual confirmado;
- [x] 3 Reels selecionados dinamicamente;
- [x] um único provider job;
- [x] output real inspecionado;
- [x] mapping campo a campo documentado;
- [x] 3 snapshots novos;
- [x] Posts Collector preservado;
- [x] sem Schedule/publicação/schema change.

Resultado:

- [ ] views úteis disponíveis — **não**;
- [ ] plays úteis disponíveis — **não**;
- [x] likes/comments disponíveis;
- [ ] audio_name disponível — **não**.

Decisão atual:

**não escalar enrichment para os demais Reels.**

Reavaliar somente após confirmar uma fonte/configuração que entregue views de forma real.


## Etapa 3.4.2 — Último diagnóstico de views

Concluído:

- [x] workflow diagnóstico separado;
- [x] 1 profile discovery;
- [x] num_of_posts=1;
- [x] 1 provider job;
- [x] 1 record recebido;
- [x] match com post existente;
- [x] 1 snapshot novo;
- [x] views NULL;
- [x] video_play_count NULL;
- [x] likes/comments presentes;
- [x] followers observado sem atualizar perfil;
- [x] nenhuma segunda execução;
- [x] modalidade A não executada;
- [x] modalidade C não executada;
- [x] workflows existentes preservados.

Decisão final:

**ENCERRAR INVESTIGAÇÃO DE VIEWS NESTA FASE.**

Próximos focos possíveis, sob nova autorização:

- frontend /posts;
- detalhe de perfis;
- concorrentes;
- recorrência do Profile Collector;
- analytics com likes/comments/followers.


## Etapa 4.0 — UX de Perfis + Cadastro de Concorrentes

Concluído:

- [x] followers exatos em /profiles;
- [x] linha de perfil clicável por mouse e teclado;
- [x] ações editar/pausar isoladas do drawer de detalhes;
- [x] ProfileDetailDrawer compartilhado;
- [x] cards reais de seguidores/conteúdos/Reels/collabs;
- [x] até 3 conteúdos recentes reais;
- [x] ProfileEditorDrawer compartilhado;
- [x] ProfileListTable compartilhada;
- [x] repository de detalhes usando monitored_profile_posts + instagram_posts;
- [x] /competitors usa monitored_profiles com profile_group=competitor;
- [x] botão Adicionar concorrente restrito a editor/admin;
- [x] formulário de concorrente com grupo travado em competitor;
- [x] lista real de concorrentes;
- [x] empty state contextual sem analytics inventados;
- [x] responsividade atualizada;
- [x] nenhum concorrente fake criado;
- [x] schema/RLS/n8n/provider inalterados.

Validação com dados reais atuais:

- Leonardo followers_count = 2766 → UI exibe 2.766;
- conteúdos monitorados = 20;
- Reels = 16;
- collabs = 1;
- concorrentes cadastrados = 0.

Próximas etapas candidatas, sob nova autorização:

- primeira experiência /posts;
- detalhe de concorrentes com histórico suficiente;
- recorrência do Profile Collector;
- analytics confiáveis sobre likes/comments/followers;
- somente depois Trend Engine.


## Etapa 4.1 — Profile Collector recorrente + histórico

Concluído:

- [x] remover dependência exclusiva de pending;
- [x] elegibilidade por next_collection_at;
- [x] pending/healthy/error na mesma fila;
- [x] 1 perfil por execução;
- [x] ordenação por prioridade/data;
- [x] collection_run antes do provider;
- [x] provider_run_id persistido;
- [x] trigger do provider sem retry automático;
- [x] polling limitado;
- [x] validação username/external ID;
- [x] NULL não apaga metadata anterior;
- [x] followers source of truth = Profile Scraper;
- [x] profile_metric_snapshot;
- [x] idempotência por profile+run;
- [x] success counters;
- [x] error backoff +6h;
- [x] execução real única;
- [x] healthy recurrence validada;
- [x] followers 2766 → 2767;
- [x] following=286;
- [x] posts_count=226;
- [x] profile snapshots 0 → 1;
- [x] workflow permanece DRAFT/active=false;
- [x] sem Schedule Trigger;
- [x] Posts/Reels workflows não executados.

Antes de automatizar:

- revisar custo;
- volume de perfis;
- frequência;
- errors;
- polling;
- cenário com múltiplos perfis/competitors.


## Etapa 4.2 — Biblioteca visual de posts e Reels

Implementado:

- [x] /posts substituído por biblioteca visual real;
- [x] grid responsivo de cards;
- [x] postsRepository dedicado;
- [x] queries em lote para posts, associações, perfis e snapshots;
- [x] 1 card por instagram_posts.id;
- [x] snapshot mais recente por contexto post + perfil;
- [x] busca por caption, autor, shortcode e hashtags;
- [x] filtros por tipo, perfil, associação e período;
- [x] ordenação por recentes, antigos, curtidas e comentários;
- [x] NULL preservado como dado indisponível;
- [x] views/plays ausentes não aparecem como zero;
- [x] PostDetailDrawer com autoria, associações, hashtags e métricas;
- [x] link para conteúdo original no Instagram;
- [x] collab Dc9H9yExV6q representado sem duplicação;
- [x] estados loading/error/empty sem mocks;
- [x] responsividade desktop/tablet/mobile;
- [x] nenhuma alteração de schema;
- [x] nenhuma alteração de n8n;
- [x] nenhuma chamada Bright Data;
- [x] nenhum Trend Score/IA/player interno.

Dados reais usados na validação:

- 20 posts;
- 16 Reels;
- 2 imagens;
- 2 carrosséis;
- 0 vídeos;
- 43 post metric snapshots;
- views NULL em 43/43 snapshots;
- plays NULL em 43/43 snapshots;
- 19 associações author;
- 1 associação collaborator.


## Etapa 4.3 — onboarding real de concorrente + multi-perfil

Concluído:

- [x] primeiro competitor real já cadastrado pelo frontend;
- [x] Profile Collector selecionou Raphael dinamicamente;
- [x] metadata real persistida;
- [x] profile_metric_snapshot criado;
- [x] Raphael healthy;
- [x] seleção do Posts Collector corrigida para onboarding multi-perfil;
- [x] perfis com run posts success/partial são excluídos;
- [x] priority + created_at usados na seleção;
- [x] Posts Collector selecionou Raphael dinamicamente;
- [x] 1 provider job de posts;
- [x] 20 registros reais;
- [x] 20 posts canônicos novos;
- [x] 20 associações;
- [x] 20 post snapshots;
- [x] 19 author + 1 collaborator;
- [x] 0 duplicados por media ID/shortcode/permalink;
- [x] 0 posts compartilhados com Leonardo observados;
- [x] frontend validado estruturalmente sem alteração;
- [x] workflows permanecem DRAFT/active=false;
- [x] sem Schedule Trigger;
- [x] sem schema/migration;
- [x] sem Reels workflows;
- [x] sem Trend Engine/IA.

Pendências antes da automação recorrente:

- desenhar política de recorrência de posts;
- decidir frequência/custo por grupo e prioridade;
- definir tratamento de backlog quando vários perfis precisarem onboarding;
- definir retry/backoff operacional de runs de posts com error;
- avaliar batch sizing/polling conforme volume;
- testar cross-profile real quando um mesmo post for observado para dois perfis.

Observação concorrente:

Durante a execução foi cadastrado pelo frontend `helio.tatsuo`, competitor pending. Ele não foi processado nesta etapa.


## Etapa 4.4 — segundo concorrente real

Concluído:

- [x] Hélio pending sem runs/associações;
- [x] Profile Collector selecionou Hélio automaticamente;
- [x] metadata real + profile snapshot;
- [x] Hélio healthy;
- [x] Posts Collector selecionou Hélio automaticamente;
- [x] nenhuma alteração de seleção necessária;
- [x] 1 provider job por collector;
- [x] 20 posts reais, 20 inserts, 20 snapshots;
- [x] 8 Reels / 5 Images / 7 Carousels;
- [x] author=20;
- [x] 0 overlaps com Leonardo/Raphael;
- [x] 0 duplicados canônicos;
- [x] frontend validado estruturalmente sem alteração;
- [x] workflows DRAFT/active=false;
- [x] sem Schedule;
- [x] sem Reels workflows;
- [x] sem Trend Engine/IA.

Pendências antes da primeira versão do Trend Engine:

- definir sinais do score sem depender de views;
- definir baseline por perfil/nicho/formato;
- definir janela temporal mínima;
- separar sinal de perfil de sinal de post;
- tratar amostra pequena e métricas NULL;
- definir recorrência de posts antes de tendências temporais;
- ampliar número de perfis/referências para reduzir viés.


## Etapa 4.5 — Trend Engine V0 + Data Sufficiency

Concluído:

- [x] reinspeção read-only do Supabase real;
- [x] auditoria dos 60 posts;
- [x] cobertura real de likes/comments/views/plays/hashtags;
- [x] distribuição por formato/perfil;
- [x] auditoria de 83 post snapshots;
- [x] auditoria de 10 collection_runs;
- [x] baseline profile + content_type definido;
- [x] mediana escolhida como baseline robusto;
- [x] observed_interactions com coverage explícita;
- [x] current followers rate classificado apenas como proxy;
- [x] performance_lift especificado;
- [x] sinais observáveis separados de sinais semânticos;
- [x] adoption/overlap/velocity definidos;
- [x] data_confidence especificado;
- [x] TrendCandidate especificado;
- [x] Trend Score V0 proposto sem dependência de views;
- [x] gate temporal definido;
- [x] maturity stages especificados;
- [x] problema de lineage em collection_runs documentado;
- [x] collection_purpose proposto;
- [x] backfill conceitual desenhado;
- [x] política de recorrência proposta;
- [x] volume mensal de records estimado;
- [x] mapping /competitors, /trends e Dashboard;
- [x] papel da IA separado do motor quantitativo;
- [x] nenhuma implementação de engine/frontend/schema/n8n.

Próxima etapa técnica recomendada:

1. resolver collection_purpose;
2. desenhar/implementar recorrência de posts;
3. acumular ao menos 2 janelas completas;
4. validar coverage temporal;
5. somente depois implementar Trend Engine quantitativo;
6. semantic feature extraction entra depois como camada separada.


## Etapa 4.6 — collection purpose + recorrência controlada

Concluído:

- [x] reinspeção dos 10 collection_runs reais;
- [x] nenhum run inesperado;
- [x] Migration A com collection_purpose nullable + CHECK;
- [x] backfill operacional auditado fora de migration;
- [x] counts 3/4/1/1/1;
- [x] Migration B com NOT NULL;
- [x] constraint semântica type/purpose;
- [x] database.types.ts regenerado;
- [x] Profile Collector grava profile_metadata;
- [x] Posts Collector grava posts_snapshot;
- [x] Reels Enrichment grava post_metrics_enrichment;
- [x] Views Diagnostic grava post_metrics_diagnostic;
- [x] reprocess futuro documentado como posts_reprocess;
- [x] Posts Collector evoluído para onboarding + recorrência;
- [x] due_at derivado de finished_at;
- [x] priority 1 = 24h;
- [x] priority 2 = 72h;
- [x] priority 3 = 7d;
- [x] error backoff = 6h;
- [x] guard explícito de fila vazia;
- [x] execution 18 validou nenhum perfil elegível;
- [x] 0 novos collection_runs na validação;
- [x] 0 Bright Data calls;
- [x] 0 provider jobs;
- [x] 0 alterações em posts/snapshots;
- [x] workflows permanecem DRAFT/active=false;
- [x] sem Schedule Trigger.

Antes da automação:

- decidir frequência do scheduler/orquestrador;
- decidir quantidade máxima de perfis por tick;
- backlog e concorrência;
- limites de custo/provider;
- observabilidade e alertas;
- coverage states para Trend Engine;
- avaliar índice composto somente após workload real.


## Etapa 4.7 — automação controlada dos collectors

Concluído:

- [x] reinspeção real antes da publicação;
- [x] 3 profiles active/healthy;
- [x] 0 collection_runs running;
- [x] Schedule Trigger configurado pelo schema real do n8n;
- [x] timezone America/Sao_Paulo explícito;
- [x] Profile schedule HH:10;
- [x] Posts schedule a cada 4h no minuto 40;
- [x] Manual Trigger preservado nos dois;
- [x] no-due do Profile validado estruturalmente;
- [x] no-due do Posts preservado;
- [x] guard duplicate profile_metadata running;
- [x] guard duplicate posts_snapshot running;
- [x] stale running não gera segundo provider job;
- [x] máximo 1 profile por workflow execution;
- [x] Profile Collector publicado;
- [x] Posts Collector publicado;
- [x] Reels Enrichment permaneceu inativo;
- [x] Views Diagnostic permaneceu inativo;
- [x] nenhuma execução manual;
- [x] nenhuma chamada Bright Data manual;
- [x] nenhum schema/frontend/Trend Engine/IA;
- [x] runbook operacional criado;
- [x] pricing público atual documentado.

Próxima etapa:

- auditar primeiras executions automáticas reais;
- confirmar collection_runs gerados pelos schedules;
- medir executions no-due vs with-work;
- validar duplicate guards sob operação real;
- observar erros/stale running;
- acompanhar records Bright Data e budget n8n;
- só então avaliar escala/backlog.


## Etapa 5.0 — Tendências com Reels BR / US

Concluído:

- [x] /trends deixou o empty state antigo;
- [x] trendsRepository em lote;
- [x] domínio TrendReelItem tipado;
- [x] tabs Brasil / EUA;
- [x] filtro real por primary_market_code;
- [x] filtro de nicho por metadata de perfil;
- [x] busca por caption/autor/username/shortcode/hashtags;
- [x] período 7d/30d/90d/all por published_at;
- [x] foco exclusivo em Reels;
- [x] "Em destaque" determinístico sem Trend Score;
- [x] observed_interactions com NULL semantics;
- [x] baseline mediano por profile + reel, amostra mínima 5;
- [x] Mais visualizados condicionado a views reais;
- [x] grid vertical responsivo;
- [x] card acessível por teclado;
- [x] PostDetailDrawer reutilizado/evoluído;
- [x] embed oficial do Instagram + fallback;
- [x] estado vazio US sem mocks;
- [x] zero perfis US fake;
- [x] zero views fake;
- [x] zero alterações de schema;
- [x] zero alterações de n8n;
- [x] zero execução de collectors.

Próximos passos:

- cadastrar referências/trendsetters US autorizados;
- acumular dados US reais;
- aguardar série temporal recorrente;
- reavaliar views;
- integrar Trend Engine apenas quando houver cobertura temporal suficiente;
- Brazil Gap continua fora de escopo.


## Etapa 5.1 — Curadoria BR + Fundação US

Concluído:

- [x] taxonomia controlada de nichos;
- [x] Raphael curado com niche/category/tags;
- [x] Hélio curado com niche/category/tags;
- [x] Leonardo preservado;
- [x] shortlist pública de 6 candidatos US;
- [x] usernames selecionados verificados;
- [x] exatamente 2 perfis US cadastrados;
- [x] @leilahormozi como trendsetter;
- [x] @codiesanchez como reference;
- [x] priority=2;
- [x] active=true;
- [x] provider fields NULL;
- [x] monitoring_status=pending;
- [x] capacidade do Profile Collector validada;
- [x] capacidade do Posts Collector validada;
- [x] /trends validado estruturalmente sem mudança de frontend;
- [x] zero collectors manuais;
- [x] zero provider jobs manuais;
- [x] zero n8n changes;
- [x] zero schema/migration;
- [x] zero IA;
- [x] zero Brazil Gap.

Próximo passo:

- deixar schedules existentes processarem os 2 US naturalmente;
- auditar onboarding automático;
- depois auditar primeira base real de Reels US;
- só então avaliar comparação BR × US.


## Player nativo de Reels + cache estável

Concluído:

- [x] payload real reinspecionado;
- [x] videos[0] confirmado como MP4 real;
- [x] fallback post_content Video URL;
- [x] fallback videos_duration URL;
- [x] URL temporária não persistida;
- [x] bucket privado reel-media-cache;
- [x] video_storage_path;
- [x] video_cached_at;
- [x] Edge Function idempotente;
- [x] limite de 64 MiB;
- [x] falha de cache não quebra ingestão;
- [x] Posts Collector atualizado sem mudança de schedule;
- [x] collection_purpose posts_snapshot preservado;
- [x] cache futuro automático;
- [x] backfill sem novo provider job;
- [x] signed URLs em lote;
- [x] player <video> no card;
- [x] embed virou fallback;
- [x] drawer prefere player nativo;
- [x] 32 Reels históricos cacheados;
- [x] auditoria de views/shares;
- [x] documento de opções de segunda fonte.

Pendências:

- 25 Reels sem cache aguardam nova aparição em coleta automática ou resolução futura autorizada;
- views/plays/shares permanecem sem fonte observada no pipeline atual;
- avaliar POC pequena de segunda fonte antes de qualquer integração.


## Reel Plays Enrichment

Concluído:

- [x] POC ScrapeCreators com video_play_count;
- [x] workflow separado de produção;
- [x] credential reutilizada sem hardcode;
- [x] fila adaptativa por idade;
- [x] limite manual 5;
- [x] limite produção 20;
- [x] guard de concorrência;
- [x] no-op barato;
- [x] validação de identidade;
- [x] snapshots imutáveis;
- [x] likes/comments da mesma observação;
- [x] views/shares/saves preservados como NULL;
- [x] execução manual 108 validada;
- [x] schedule 00:20 / 06:20 / 12:20 / 18:20;
- [x] /trends usa Reproduções;
- [x] sort por playsCount;
- [x] coverage por playsCount;
- [x] drawer preserva plays e views separados.

Teto operacional:

- 4 executions/dia;
- máximo 20 requests/execution;
- teto absoluto 80 requests/dia;
- aproximadamente 2.400 requests/mês antes de no-ops.

Próximo passo:

- auditar as primeiras executions automáticas;
- medir cobertura de plays por mercado/perfil;
- acompanhar consumo real de créditos.
