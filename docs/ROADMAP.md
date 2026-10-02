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
