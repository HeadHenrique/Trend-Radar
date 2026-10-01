# Reels Enrichment POC — Etapa 3.4

## Objetivo

Validar se o Bright Data Instagram Reels Scraper adiciona métricas úteis, principalmente views, para Reels já existentes no Trend Radar.

A POC foi limitada a exatamente 3 Reels e um único provider job.

## Workflow

Nome:

`Trend Radar — Reels Enrichment POC`

ID:

`CWMacm8bwxDXue4w`

Estado final:

- DRAFT;
- active=false;
- sem versão publicada;
- Manual Trigger;
- sem Schedule Trigger.

O workflow de Posts `q9XBNlb3PsxsyULl` não foi alterado.

## Provider

Bright Data:

`Instagram - Reels`

Dataset confirmado:

`gd_lyclm20il4r5helnj`

Input:

3 URLs diretas de Reels existentes, sem discovery por perfil e sem `num_of_posts`.

Provider job:

`sd_muq13pi7261wn2p4gs`

n8n execution:

`11`

Collection run:

`ed974031-71de-4e75-89e6-3c5dbf32cb41`

## 3 Reels selecionados

Seleção dinâmica por:

- content_type = reel;
- posts mais recentes;
- associação existente ao perfil monitorado.

Reels:

1. `https://www.instagram.com/reel/DdK2zkTNQXJ`
2. `https://www.instagram.com/reel/DdHNxtQO0Zp`
3. `https://www.instagram.com/reel/Dc9H9yExV6q`

Nenhuma URL permanece hardcoded na versão final do workflow.

## Volume

- enviados ao provider: 3;
- recebidos: 3;
- matched com posts canônicos: 3;
- unmatched: 0;
- provider jobs criados: 1;
- execuções do workflow: 1.

## Campos reais observados

O output do Reels Scraper continha:

- url;
- user_posted;
- description;
- hashtags;
- num_comments;
- date_posted;
- likes;
- views;
- video_play_count;
- top_comments;
- post_id;
- thumbnail;
- shortcode;
- content_id;
- product_type;
- coauthor_producers;
- tagged_users;
- length;
- video_url;
- audio_url;
- posts_count;
- followers;
- following;
- user_profile_url;
- is_paid_partnership;
- partnership_details;
- is_verified;
- profile_image_link;
- timestamp;
- input.

## Mapping real

| Provider | Destino | Resultado na POC |
|---|---|---|
| post_id | match por instagram_media_id | 3/3 |
| shortcode | fallback de match | presente 3/3 |
| url | fallback por permalink | presente 3/3 |
| views | post_metric_snapshots.views_count | campo presente, valor NULL em 3/3 |
| video_play_count | post_metric_snapshots.plays_count | campo presente, valor NULL em 3/3 |
| likes | post_metric_snapshots.likes_count | 3/3 |
| num_comments | post_metric_snapshots.comments_count | 3/3 |
| shares/share_count | shares_count | campo não observado |
| saves/save_count | saves_count | campo não observado |
| audio_name/audio_title/music/audio | instagram_posts.audio_name | nenhum título/nome observado |
| audio_url | não mapeado para audio_name | URL de mídia, não nome/título |
| length | não persistido nesta POC | campo observado |

### Views

Campo exato:

`views`

Valores:

- DdK2zkTNQXJ → NULL;
- DdHNxtQO0Zp → NULL;
- Dc9H9yExV6q → NULL.

Views disponíveis:

`0/3`.

Nenhum valor foi inventado.

### Plays

Campo real observado:

`video_play_count`

Ele aparece separado de `views`, portanto o workflow foi ajustado depois da inspeção para tratá-lo como plays quando vier não-NULL em uma futura execução.

Nesta POC:

`video_play_count = NULL` em 3/3.

Logo:

`plays_count = NULL` em 3/3.

O workflow não foi reexecutado depois desse ajuste.

### Likes

- DdK2zkTNQXJ → 108;
- DdHNxtQO0Zp → 3;
- Dc9H9yExV6q → 62.

### Comments

- DdK2zkTNQXJ → 6;
- DdHNxtQO0Zp → 0;
- Dc9H9yExV6q → 1.

ZERO continuou semanticamente diferente de NULL.

### Shares e saves

Não foram observados campos utilizáveis.

Persistidos como NULL.

### Áudio

O output trouxe `audio_url`, mas não nome/título de áudio confiável.

Por isso:

- `audio_name` não foi atualizado;
- `updated_count = 0`.

## Snapshots

Antes:

`39`

Criados nesta POC:

`3`

Depois:

`42`

Cada snapshot foi vinculado ao novo collection_run e contém:

- likes;
- comments;
- views NULL;
- plays NULL;
- shares NULL;
- saves NULL.

Nenhum snapshot anterior foi alterado.

## Collection run

```text
id = ed974031-71de-4e75-89e6-3c5dbf32cb41
collection_type = posts
provider_key = bright_data
orchestrator = n8n
provider_run_id = sd_muq13pi7261wn2p4gs
orchestrator_run_id = 11
received_count = 3
inserted_count = 0
updated_count = 0
status = success
```

Semântica da POC:

- inserted_count sempre 0, pois enrichment não cria posts;
- updated_count contabiliza somente posts canônicos realmente alterados;
- snapshots não entram em updated_count.

## Integridade

Confirmado:

- nenhum post novo;
- nenhuma associação nova;
- nenhum post duplicado;
- nenhuma associação duplicada;
- nenhum snapshot duplicado dentro do novo run.

## Advisors

Security Advisor:

- INFO intencional: collection_runs com RLS e sem policy frontend;
- WARN pré-existente: leaked password protection desabilitado;
- nenhum finding novo causado pela POC.

Performance Advisor:

- 2 INFOs antigos de FKs run/profile sem covering index;
- unused indexes já conhecidos;
- nenhuma migration criada.

## Conclusão técnica

**Não escalar o Reels enrichment para todos os Reels neste momento.**

Motivos baseados nos dados reais:

1. o objetivo principal era obter views;
2. views veio NULL em 3/3;
3. video_play_count veio NULL em 3/3;
4. likes/comments já eram obtidos no pipeline de Posts;
5. audio_url não resolve o campo canônico audio_name;
6. executar enrichment em todos os Reels aumentaria custo sem demonstrar ganho de informação nesta amostra.

Próximo passo recomendado antes de escalar:

- investigar se existe configuração/variante atual do Reels Scraper que efetivamente entregue views para estes tipos de Reels;
- ou validar com a Bright Data por que `views` e `video_play_count` vieram nulos.

Não executar enrichment em massa até haver evidência de ganho.
