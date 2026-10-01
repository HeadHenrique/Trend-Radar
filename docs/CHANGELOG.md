# Changelog

## 2026-10-01 — Etapa 3.3.3

### Execução real

- execução n8n `8`;
- novo collection_run `7eba4bbb-b7b8-4e4b-b2a5-ee59685f2add`;
- novo provider_run_id `sd_mupzulxc2bedzsf3mn`;
- perfil selecionado dinamicamente: leonardofroese;
- run histórico não reutilizado nem alterado.

### Provider

- status `ready`;
- records = 0;
- errors = 0;
- download HTTP 200 com array vazio;
- provider informou `No records found...`.

### Resultado

Novo run:

- status = error;
- received = 0;
- inserted = 0;
- updated = 0.

Banco permaneceu:

- instagram_posts = 19;
- monitored_profile_posts = 19;
- post_metric_snapshots = 19;
- profile_metric_snapshots = 0.

Associações permaneceram:

- author = 19;
- collaborator = 0;
- discovered = 0.

`Dc9H9yExV6q` continua não persistido.

### Escopo

- apenas uma coleta real;
- nenhuma segunda execução;
- nenhum Reels enrichment;
- run histórico não reparado;
- workflow não publicado;
- sem Schedule Trigger;
- sem UI /posts;
- sem IA/Trend Engine.

## 2026-10-01 — Etapa 3.3.2

### Database

- migration `20261001201951_create_post_profile_associations`;
- criada `monitored_profile_posts`;
- `instagram_posts` convertido para modelo canônico global;
- removido `instagram_posts.monitored_profile_id`;
- adicionados author username, author external ID e hashtags;
- 19 posts legados backfilled como author;
- 19 posts preservados;
- 19 snapshots preservados;
- nova FK snapshot → associação;
- IDs preservados.

### Performance

- advisor detectou falta de índice de cobertura na nova FK;
- aplicada `20261001202104_index_post_snapshot_profile_post_fk`;
- finding novo removido.

### Security

- RLS/grants de monitored_profile_posts validados;
- authenticated apenas SELECT;
- service_role SELECT/INSERT/UPDATE;
- sem DELETE;
- role inválida sem leitura.

### n8n

- Posts Collector adaptado sem execução;
- post upsert agora é global;
- author/collaborator/discovered implementados;
- coauthor_producers usado como evidência explícita;
- associação obrigatória antes do snapshot;
- evidence type não sofre downgrade;
- terminal replay bloqueado antes de upsert;
- finalizadores só alteram runs running;
- orchestrator_run_id original permanece preservado.

### Escopo respeitado

- workflow não executado;
- Bright Data não chamada;
- Dc9H9yExV6q não inserido;
- counters históricos não reparados;
- nenhuma UI /posts;
- nenhum Reels enrichment;
- nenhuma IA/Trend Engine.

## 2026-10-01 — Etapa 3.3

### n8n

- criado `Trend Radar — Posts Collector POC`;
- workflow ID `q9XBNlb3PsxsyULl`;
- Manual Trigger;
- permanece DRAFT / active=false;
- sem Schedule Trigger;
- perfil selecionado dinamicamente do Supabase.

### Bright Data

- Instagram Posts dataset `gd_lk5ns7kz21pck8jpis`;
- discovery por URL de perfil;
- `num_of_posts=20` aplicado na origem;
- uma única chamada de discovery;
- provider_run_id real persistido;
- job retornou 20 registros, 0 errors reportados pelo provider;
- duração observada ~104s.

### Ingestão

- 20 registros considerados;
- 1 registro de outro `user_posted` rejeitado;
- 19 posts reais persistidos;
- 19 post metric snapshots;
- 0 profile metric snapshots;
- content types: 15 reel, 2 image, 2 carousel.

### Métricas

- comments observados nos 19 posts persistidos;
- likes observados em 7;
- views/plays/shares/saves indisponíveis neste batch;
- NULL não convertido em zero;
- zeros reais de comments preservados.

### Idempotência

- recovery reutilizou o mesmo collection_run/provider_run_id;
- adicionado processamento item-a-item;
- adicionado lookup de snapshot antes do INSERT;
- replay final: 0 inserts, 19 updates;
- total final permaneceu 19 posts / 19 snapshots;
- duplicatas por media ID, shortcode e snapshot/run: 0.

### Falhas/correções

- polling inicial de 80s foi insuficiente para job de ~104s; workflow final ajustado para 4x30s;
- lookup em batch perdeu item pairing; corrigido com Loop Over Items batchSize=1;
- URL() não funcionou como esperado no sandbox do Code; permalink passou a ser canonicalizado por string/regex;
- duração passou a usar `videos_duration[0].video_duration`;
- idempotência de snapshot passou a consultar `post_id + collection_run_id` antes do INSERT.

### Escopo

- nenhum schema/migration novo;
- Profile Collector não alterado;
- nenhuma UI de Posts;
- nenhum Reels Scraper complementar;
- nenhuma IA;
- nenhum Trend Engine;
- workflow não publicado.

## 2026-10-01 — Etapa 3.2

### Database

- migration `20261001041950_create_posts_snapshots_foundation` aplicada;
- criadas `collection_runs`, `instagram_posts`, `post_metric_snapshots`, `profile_metric_snapshots`;
- adicionada consistência `status ↔ finished_at` em collection_runs;
- FKs compostas impedem snapshots cross-profile;
- snapshots exigem ao menos uma métrica observada;
- NULL e zero permanecem semanticamente distintos;
- quatro novas tabelas encerraram a etapa vazias.

### Segurança

- RLS habilitado nas quatro tabelas;
- collection_runs permanece server-side only;
- REVOKE ALL explícito antes dos grants mínimos;
- service_role sem DELETE;
- service_role sem UPDATE nos snapshots;
- frontend com SELECT apenas em posts/snapshots via role válida;
- função de updated_at sem EXECUTE direto para clientes/service_role.

### Validação

- status/finished_at testado com rollback;
- cross-profile testado com rollback;
- trigger updated_at testado;
- RLS testado para viewer/editor/admin e role inválida;
- database.types.ts regenerado;
- advisors executados.

### Escopo

- n8n não alterado;
- Bright Data não chamada;
- nenhum post coletado;
- nenhum snapshot real inserido;
- IA/Trend Engine não iniciados.

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

### Frontend

- `/profiles` validado após a coleta real;
- avatar real exibido;
- nome e username reais exibidos;
- seguidores exibidos como `2,8 mil`;
- status exibido como `Saudável`;
- última coleta exibida como `01/10/2026, 00:44`;
- grupo `Próprio`, mercado `Brasil` e prioridade `Média` preservados.

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
