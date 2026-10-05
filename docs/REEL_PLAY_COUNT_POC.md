# Reel Play Count POC

## Status

POC concluída em 2026-10-05.

- Workflow n8n: `Caliber Orbit — Reel Play Count Diagnostic`
- Workflow ID: `jLpdN5CWnh7Nav1x`
- Execution única: `102`
- Estado do workflow: draft / não publicado
- Requests ao ScrapeCreators: 5
- Créditos consumidos: 5
- Cache hits: 0
- Cache misses: 5
- Alterações em produção: nenhuma
- Métricas persistidas: nenhuma

## Objetivo

Validar se o endpoint individual do ScrapeCreators para posts/Reels entrega uma contagem pública observável de plays/views suficientemente consistente para servir como segunda fonte de enriquecimento do Caliber Orbit.

Endpoint testado:

`GET https://api.scrapecreators.com/v1/instagram/post`

Parâmetros usados:

- `url=<permalink do Reel>`
- `include_play_count=true`
- `download_media=false`
- `trim=false`

`cache_max_age` foi omitido porque a documentação atual não aceita `0`; as opções documentadas começam em `1d`. Sem esse parâmetro, a POC fez leitura live.

Autenticação via credential n8n do tipo `httpHeaderAuth`, com header `x-api-key`.

## Amostra

Foram selecionados dinamicamente 5 Reels reais de perfis monitorados ativos:

| # | Perfil | Shortcode |
|---|---|---|
| 1 | @raphaelcostaoficial | DeFiYZsprp8 |
| 2 | @raphaelcostaoficial | DeEQ2SzOYLs |
| 3 | @helio.tatsuo | Dd99oCuxVjK |
| 4 | @helio.tatsuo | Dd9rGewjfVK |
| 5 | @leonardofroese | DdK2zkTNQXJ |

Distribuição: 2 Raphael, 2 Hélio, 1 Leonardo.

## Resultado real

Em 5/5 respostas, o ScrapeCreators retornou:

`data.xdt_shortcode_media.video_play_count`

com valor numérico.

Nenhuma das 5 respostas apresentou um campo numérico separado de `video_view_count`, `view_count`, `views`, `play_count`, `plays`, `ig_play_count` ou `fb_play_count`.

Também não foi observado contador real de shares.

| Shortcode | video_play_count | Likes ScrapeCreators | Comments ScrapeCreators |
|---|---:|---:|---:|
| DeFiYZsprp8 | 44.490 | 2.163 | 1.224 |
| DeEQ2SzOYLs | 7.807 | 151 | 0 |
| Dd99oCuxVjK | 2.708 | 51 | 3 |
| Dd9rGewjfVK | 1.972 | 19 | 0 |
| DdK2zkTNQXJ | 2.501 | 108 | 6 |

## Comparação com o último snapshot do Orbit

| Shortcode | Likes Orbit | Likes ScrapeCreators | Comments Orbit | Comments ScrapeCreators | Views Orbit | Plays Orbit |
|---|---:|---:|---:|---:|---:|---:|
| DeFiYZsprp8 | 2.143 | 2.163 | 1.218 | 1.224 | NULL | NULL |
| DeEQ2SzOYLs | 147 | 151 | 0 | 0 | NULL | NULL |
| Dd99oCuxVjK | 28 | 51 | 0 | 3 | NULL | NULL |
| Dd9rGewjfVK | 12 | 19 | 0 | 0 | NULL | NULL |
| DdK2zkTNQXJ | 108 | 108 | 6 | 6 | NULL | NULL |

As diferenças de likes/comments são compatíveis com observações realizadas em momentos diferentes e confirmam que a API respondeu para os mesmos Reels canônicos.

## Campos auditados

Campos/aliases procurados:

- `video_play_count`
- `video_view_count`
- `play_count`
- `plays`
- `view_count`
- `views`
- `ig_play_count`
- `fb_play_count`
- `shares`
- `share_count`

Resultado:

- `video_play_count`: numérico em 5/5
- demais campos de play/view acima: ausentes como contadores numéricos
- shares: não observado

O payload também contém `like_and_view_counts_disabled`, mas esse campo é booleano e não representa uma contagem de views.

## Classificação

**CASO A**

`video_play_count` foi numérico e consistente em 5/5 da amostra, sem um `video_view_count` numérico concorrente.

## Semântica

A documentação do ScrapeCreators descreve `video_play_count` como views de Reels, mas também alerta que esse valor pode representar apenas Instagram e divergir do número combinado Instagram + Facebook mostrado em alguns contextos do Instagram.

Por isso, tecnicamente a recomendação interna é:

- persistir inicialmente como `plays_count`;
- não preencher `views_count` com esse valor sem uma decisão explícita de produto;
- na UI, preferir o label **Reproduções** enquanto a semântica não for validada contra o contador visual do Instagram.

## Recomendação

A POC passou para `plays_count`.

Próxima etapa recomendada:

1. criar um enrichment separado e controlado;
2. consultar somente Reels elegíveis;
3. persistir `video_play_count` em `post_metric_snapshots.plays_count`;
4. manter `views_count` como NULL;
5. preservar `shares_count` como NULL;
6. definir frequência e orçamento antes de ativar qualquer schedule;
7. comparar manualmente uma pequena amostra com o contador público visível no Instagram antes de renomear a métrica para “Visualizações”.

## Segurança e invariantes

Durante esta POC:

- nenhum `post_metric_snapshot` foi criado;
- nenhum `instagram_post` foi atualizado;
- nenhuma migration foi criada;
- nenhum collector de produção foi alterado;
- nenhum schedule foi criado;
- o Posts Collector não foi executado;
- o Profile Collector não foi alterado;
- nenhuma métrica foi inventada.

A regra permanece:

`NULL → —`


## Continuação — validação de produção

A POC original permanece inalterada.

A rotina de produção foi validada posteriormente no workflow:

`Caliber Orbit — Reel Plays Enrichment`

ID:

`2rekO9lh9xpgH9lt`

### Tentativas técnicas antes da validação final

Execution 106:

- 0 requests ao ScrapeCreators;
- falha local antes do provider;
- 0 créditos;
- 0 collection_runs;
- 0 snapshots.

Execution 107:

- 5 requests;
- 5 respostas válidas;
- 5 créditos;
- persistência falhou por `pairedItem Multiple matches found`;
- 0 snapshots;
- run encerrado como error técnico.

Nenhuma segunda chamada foi feita durante a correção do pairing.

### Validação final autorizada

Execution 108:

- 5 requests;
- 5 sucessos;
- 5 créditos;
- identidade correta em 5/5;
- 5 snapshots persistidos;
- run success.

Valores:

| Shortcode | plays_count | likes_count | comments_count |
|---|---:|---:|---:|
| DIe1t5bN7oO | 196.472 | 4.929 | 7 |
| DXfQ250BxAc | 264 | 11 | 0 |
| DXjjjjZB1SM | 271 | 3 | 0 |
| DXotEFOBHCw | 709 | 3 | 0 |
| DXuLP_OBpuE | 314 | 3 | 0 |

Em todos:

- views_count = NULL;
- shares_count = NULL;
- saves_count = NULL.

Conclusão:

`video_play_count → plays_count → Reproduções`

continua sendo a decisão semântica adotada.
