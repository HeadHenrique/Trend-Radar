# Reels Views Diagnostic — Etapa 3.4.2

## Objetivo

Executar o último teste autorizado de views usando a modalidade B do Bright Data Instagram Reels:

`type=discover_new`
`discover_by=url`

com exatamente 1 record.

## Workflow

Nome:

`Trend Radar — Reels Views Discovery Diagnostic`

ID:

`0dnlSxCbcENJR4E4`

Estado final:

- DRAFT;
- active=false;
- sem versão publicada;
- Manual Trigger;
- sem Schedule Trigger;
- seleção dinâmica de perfil;
- sem username hardcoded na versão final.

Execução real única:

`12`

## Dataset e modalidade

Dataset:

`gd_lyclm20il4r5helnj`

Modalidade:

`InstagramSearchScraper.reels`

Parâmetros:

- type = discover_new;
- discover_by = url;
- profile URL derivada dinamicamente;
- num_of_posts = 1;
- sem start_date;
- sem end_date.

Input lógico real:

```json
[
  {
    "url": "https://www.instagram.com/leonardofroese/",
    "num_of_posts": 1
  }
]
```

Não foi usada URL direta de Reel nesta etapa.

Não foi usada `url_all_reels`.

## Provider job

provider_run_id:

`sd_muq29to011infdps9s`

collection_run:

`9f3cfbf2-ce7c-45bd-a7ce-d5a14eeece84`

orchestrator_run_id:

`12`

Foi criado exatamente 1 provider job.

## Resultado real

Records recebidos:

`1`

Reel retornado pelo provider:

- post_id = `3611560201699179022`;
- shortcode = `DIe1t5bN7oO`;
- URL retornada = `https://www.instagram.com/p/DIe1t5bN7oO/`;
- user_posted = `leonardofroese`;
- product_type = `clips`;
- is_paid_partnership = false;
- is_verified = true.

O post canônico existente usa:

`https://www.instagram.com/reel/DIe1t5bN7oO`

O match ocorreu por:

`instagram_media_id`

Post canônico:

`f8b444b3-2085-4e30-83fe-9483f2b9d166`

## Views

Campo:

`views`

Valor real:

`NULL`

Não foi inferido valor alternativo.

## Video play count

Campo:

`video_play_count`

Valor real:

`NULL`

`plays_count` permaneceu NULL.

Views não foi copiado para plays e plays não foi copiado para views.

## Campos alternativos pesquisados

Ausentes no payload:

- view_count;
- video_views;
- play_count;
- plays;
- clips_play_count;
- ig_play_count;
- reach;
- impressions.

Os únicos campos de performance relacionados a view/play observados no objeto foram:

- views;
- video_play_count.

Ambos NULL.

## Likes e comments

likes:

`4929`

num_comments:

`7`

Persistidos no snapshot como:

- likes_count = 4929;
- comments_count = 7.

## Followers

O payload retornou:

`followers = 2767`

`monitored_profiles.followers_count` permaneceu:

`2766`

Nenhuma atualização de perfil foi realizada.

## Snapshot

Como houve match seguro e métricas observadas de likes/comments, foi criado 1 snapshot novo.

Antes:

`42`

Depois:

`43`

Snapshot:

- views_count = NULL;
- plays_count = NULL;
- likes_count = 4929;
- comments_count = 7;
- shares_count = NULL;
- saves_count = NULL.

Nenhum snapshot antigo foi atualizado.

## Collection run

```text
id = 9f3cfbf2-ce7c-45bd-a7ce-d5a14eeece84
collection_type = posts
provider_key = bright_data
orchestrator = n8n
provider_run_id = sd_muq29to011infdps9s
orchestrator_run_id = 12
received_count = 1
inserted_count = 0
updated_count = 0
status = success
```

## Comparação modalidade A vs B

### A — URL direta

Etapa 3.4:

- 3 Reels;
- views NULL em 3/3;
- video_play_count NULL em 3/3.

### B — discovery de perfil

Etapa 3.4.2:

- 1 Reel;
- views NULL em 1/1;
- video_play_count NULL em 1/1.

Resultado combinado dos testes autorizados:

- views numérico: 0/4 observações;
- video_play_count numérico: 0/4 observações.

## Workflows existentes

Não foram alterados:

- `Trend Radar — Posts Collector POC` — `q9XBNlb3PsxsyULl`;
- `Trend Radar — Reels Enrichment POC` — `CWMacm8bwxDXue4w`.

## Decisão

**ENCERRAR INVESTIGAÇÃO DE VIEWS NESTA FASE.**

A modalidade B não resolveu a ausência de views/plays.

Não testar modalidade C agora.

Não gastar novas coletas A/B/C para views nesta fase.

Prosseguir com dados já confiáveis:

- likes;
- comments;
- followers;
- posts;
- associações;
- hashtags;
- duração.

Views/plays ficam opcionais/futuros até existir nova evidência ou mudança do provider.
