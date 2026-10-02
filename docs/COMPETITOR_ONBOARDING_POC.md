# Competitor Onboarding POC

## Etapa 4.3 — primeiro concorrente real

Data: 2026-10-02

Objetivo: validar ponta a ponta o onboarding real do primeiro concorrente monitorado e o comportamento multi-perfil do pipeline sem alterar schema, frontend ou publicar workflows.

## Estado inicial

Raphael:

- instagram_username: `raphaelcostaoficial`;
- profile_group: `competitor`;
- primary_market_code: `BR`;
- priority: `2`;
- active: `true`;
- monitoring_status: `pending`;
- followers_count: `NULL`;
- last_collected_at: `NULL`;
- next_collection_at: `NULL`;
- associações de posts: `0`;
- collection_runs de posts: `0`.

Leonardo:

- instagram_username: `leonardofroese`;
- profile_group: `own`;
- monitoring_status: `healthy`;
- followers_count: `2767`;
- runs de posts success/partial existentes: `4`.

Contagens iniciais:

- monitored_profiles: `2`;
- instagram_posts: `20`;
- monitored_profile_posts: `20`;
- post_metric_snapshots: `43`;
- profile_metric_snapshots: `1`;
- collection_runs: `6`.

## Profile Collector

Workflow:

`Trend Radar — Profile Collector POC`

ID:

`BijTnAz2cSLTMzva`

Execução manual única:

`14`

O seletor escolheu dinamicamente:

`raphaelcostaoficial`

Nenhum username foi forçado.

### Collection run

ID:

`a0300964-b92d-4b25-bb99-125dbd3ccf06`

Provider run:

`sd_muqfo65v17r8x2nvk1`

Resultado:

- status: `success`;
- received_count: `1`;
- inserted_count: `0`;
- updated_count: `1`.

### Metadata real

Provider retornou identidade válida:

- username: `raphaelcostaoficial`;
- instagram_external_id: `1526023890`;
- display_name: `Raphael Costa | Grupo 220🫡`;
- followers: `295953`;
- following: `1661`;
- posts_count: `6234`.

O perfil foi atualizado para:

- monitoring_status: `healthy`;
- last_collected_at: `2026-10-02T03:59:45.944Z`;
- next_collection_at: `2026-10-02T09:59:45.951Z`;
- last_collection_error: `NULL`.

Campos estratégicos foram preservados:

- profile_group = competitor;
- primary_market_code = BR;
- priority = 2;
- active = true.

### Profile snapshot

ID:

`d4829ad9-965c-4eea-91e4-bbc9cd82c982`

- followers_count: `295953`;
- following_count: `1661`;
- posts_count: `6234`;
- collection_run_id: `a0300964-b92d-4b25-bb99-125dbd3ccf06`.

## Correção do Posts Collector

Workflow:

`Trend Radar — Posts Collector POC`

ID:

`q9XBNlb3PsxsyULl`

Problema anterior:

`active=true + healthy + order priority + limit 1`

Com mais de um perfil healthy isso poderia selecionar Leonardo novamente.

Nova regra de onboarding inicial:

1. carregar até 50 perfis active=true e healthy;
2. carregar collection_runs de `collection_type=posts`;
3. considerar onboarding concluído somente quando existir run `success` ou `partial`;
4. excluir perfis já concluídos;
5. ordenar restantes por menor `priority`;
6. usar `created_at` como desempate;
7. selecionar exatamente um perfil.

Nodes adicionados:

- `Buscar Runs de Posts`;
- `Selecionar Perfil para Onboarding`.

A lógica foi mantida dinâmica, sem UUID/username hardcoded.

## Posts Collector

Execução manual única:

`15`

Perfil selecionado dinamicamente:

`raphaelcostaoficial`

### Collection run

ID:

`cf9f4140-4ea7-46f6-9f35-4c22a4e54de0`

Provider run:

`sd_muqfqf58187oezokgf`

Dataset:

`gd_lk5ns7kz21pck8jpis`

Input:

- discovery por URL do perfil;
- num_of_posts = 20;
- um único provider job.

Resultado do provider:

- records: `20`;
- errors: `0`.

Resultado do run:

- received_count: `20`;
- inserted_count: `20`;
- updated_count: `0`;
- status: `success`;
- snapshots novos: `20`;
- inválidos: `0`;
- missing published_at: `0`.

## Conteúdo associado a Raphael

Total:

`20`

Distribuição:

- Reels: `16`;
- Images: `0`;
- Carousels: `4`;
- Videos: `0`;
- Unknown: `0`.

Associações:

- author: `19`;
- collaborator: `1`;
- discovered: `0`.

A collab real observada confirma que o pipeline continua distinguindo autor canônico de perfil monitorado.

## Métricas

No batch de Raphael:

- likes disponíveis: `20/20`;
- comments disponíveis: `20/20`;
- views: `0/20`;
- plays: `0/20`;
- shares: `0/20`;
- saves: `0/20`.

Comments reais iguais a zero:

`5/20`

NULL permaneceu diferente de zero.

Nenhum Reels Enrichment foi executado.

## Hashtags

Cobertura nos 20 posts associados a Raphael:

- array não vazio: `1`;
- array vazio: `0`;
- NULL: `19`.

Nenhuma hashtag foi inventada.

## Deduplicação e cross-profile

Todos os 20 posts do batch foram novos canonicamente:

- inserted = `20`;
- updated = `0`.

Duplicados globais após a execução:

- instagram_media_id: `0`;
- shortcode: `0`;
- permalink: `0`.

Posts compartilhados entre Raphael e Leonardo neste batch:

`0`

A arquitetura N:N permanece pronta para manter um único `instagram_posts` e múltiplas linhas em `monitored_profile_posts` quando um compartilhamento real ocorrer.

## Frontend

Nenhum arquivo de frontend foi alterado.

Validação estrutural:

- `/competitors` consulta `monitored_profiles` com `profile_group=competitor`;
- Raphael agora possui foto, display_name, followers, status healthy e last_collected_at reais;
- `/posts` monta o filtro de perfis a partir de `monitored_profile_posts`;
- como Raphael possui 20 associações, ele pode aparecer no filtro e seus posts podem ser exibidos.

## Contagens finais

Após as duas execuções autorizadas:

- instagram_posts: `20 → 40`;
- monitored_profile_posts: `20 → 40`;
- post_metric_snapshots: `43 → 63`;
- profile_metric_snapshots: `1 → 2`;
- collection_runs: `6 → 8`.

`monitored_profiles` foi de `2 → 3`, mas essa terceira linha não foi criada pelos collectors desta etapa.

Durante a execução 15 foi cadastrado externamente pelo frontend:

`helio.tatsuo`

Ele permaneceu:

- profile_group = competitor;
- monitoring_status = pending.

Nenhum collector adicional foi executado para ele.

## Estado final dos workflows

Profile Collector:

- DRAFT;
- active=false;
- somente Manual Trigger;
- sem Schedule Trigger.

Posts Collector:

- DRAFT;
- active=false;
- somente Manual Trigger;
- sem Schedule Trigger;
- nova lógica de onboarding inicial multi-perfil mantida.

## Fora de escopo

Não foi feito:

- nova execução de collector;
- publicação de workflow;
- Schedule Trigger;
- recorrência completa de posts;
- Reels Enrichment;
- Views Diagnostic;
- schema/migration;
- alteração de frontend;
- Trend Engine;
- IA.


# Etapa 4.4 — segundo concorrente real

## Estado inicial
Hélio já existia no frontend como `helio.tatsuo`, competitor, active=true, priority=2, pending, sem followers, sem runs e sem associações.

Contagens iniciais: monitored_profiles=3, collection_runs=8, instagram_posts=40, monitored_profile_posts=40, post_metric_snapshots=63, profile_metric_snapshots=2.

## Profile Collector
Nenhuma alteração foi feita no workflow antes do teste. A fila real selecionou dinamicamente `helio.tatsuo`.

- execution: `16`
- collection_run: `9e52e3a3-5997-428e-b9f9-00c6821f75cf`
- provider_run_id: `sd_muqg4m8hdwpkf3ks`
- display_name: `Helio Tatsuo Yostsui`
- instagram_external_id: `9687447251`
- followers: `340070`
- following: `2173`
- posts_count: `2482`
- profile snapshot: `9f4a7c04-97d2-4ee5-b7c4-89b7d21f554e`
- status: `success`
- monitoring_status final: `healthy`

## Posts Collector
Nenhuma alteração foi feita na lógica de onboarding. A seleção dinâmica apontou Hélio como único healthy sem run posts success/partial.

- execution: `17`
- collection_run: `73d0fc24-f46f-423f-bf1d-93b1a8bf0a7c`
- provider_run_id: `sd_muqg6gla1ujharn7e5`
- records/received: `20`
- inserted: `20`
- updated: `0`
- snapshots: `20`
- status: `success`

Distribuição: 8 Reels, 5 Images, 7 Carousels, 0 Videos, 0 Unknown.

Associações: author=20, collaborator=0, discovered=0.

Posts canônicos preexistentes reutilizados: 0.

## Cross-profile e dedup
- compartilhados com Leonardo: 0
- compartilhados com Raphael: 0
- duplicados por media ID: 0
- duplicados por shortcode: 0
- duplicados por permalink: 0

## Métricas e hashtags
- likes: 19/20
- comments: 20/20
- views: 0/20
- plays: 0/20
- shares: 0/20
- saves: 0/20
- comments_count=0 reais: 5/20
- hashtags não NULL/não vazias: 0
- hashtags []: 0
- hashtags NULL: 20

## Estado final
- Leonardo: own, healthy, 20 posts associados
- Raphael: competitor, healthy, 20 posts associados
- Hélio: competitor, healthy, 20 posts associados

Contagens finais: monitored_profiles 3→3, collection_runs 8→10, instagram_posts 40→60, monitored_profile_posts 40→60, post_metric_snapshots 63→83, profile_metric_snapshots 2→3.

Nenhum bug bloqueante foi encontrado. Nenhum workflow ou frontend foi alterado. Ambos os collectors permanecem DRAFT, active=false, Manual Trigger e sem Schedule Trigger.
