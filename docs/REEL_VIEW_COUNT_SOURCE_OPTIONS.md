# Reel View Count Source Options

## Contexto

O pipeline atual do Posts Collector continua sem uma métrica pública confiável de views/plays.

Na execution automática 76, o payload real de Reels apresentou URLs de mídia e métricas de likes/comments, mas os campos auditados abaixo estavam ausentes ou NULL:

- views
- view_count
- video_views
- video_view_count
- play_count
- plays
- video_play_count
- ig_play_count
- fb_play_count
- shares
- shares_count

O banco permanece com:

- views_count observadas: 0
- plays_count observadas: 0
- shares_count observadas: 0

Nenhuma métrica foi inferida.

## Opção A — Bright Data Reels Scraper dedicado

Fonte pública:

https://brightdata.com/products/web-scraper/instagram/reels

A página do produto anuncia Reels com campos de Views e preço:

- Free Tier: 5K records/mês;
- Pay as you go: US$ 1,50 / 1.000 records;
- Scale: US$ 499/mês com 384K records incluídos.

### Pontos positivos

- mesmo fornecedor já usado no Orbit;
- integração HTTP/n8n conhecida;
- menor mudança operacional;
- billing por resultado entregue.

### Risco atual

O dataset/fluxo real já testado pelo Orbit não retornou views em POCs anteriores e o Posts Collector atual também não retornou qualquer campo numérico de view/play.

Portanto a página comercial não é evidência suficiente de que o dataset específico necessário retornará a métrica para os Reels monitorados.

### Decisão

Boa primeira POC futura, mas apenas com autorização explícita e poucos Reels.

## Opção B — ScrapeCreators Post/Reel Info

Fontes:

https://docs.scrapecreators.com/v1/instagram/post/
https://scrapecreators.com/blog/instagram-public-data-api

O endpoint de post/reel:

- recebe URL pública;
- custa 1 crédito por request;
- possui opção `include_play_count`;
- documenta `video_play_count`;
- informa que play count representa Instagram e pode divergir do número combinado Instagram + Facebook;
- suporta cache_max_age, com respostas cacheadas sem novo crédito segundo a documentação.

Preço publicado no comparativo do fornecedor em setembro de 2026:

- 100 créditos grátis;
- US$ 47 por 25.000 créditos;
- aproximadamente US$ 1,88 / 1.000 requests para endpoints de 1 crédito.

### Pontos positivos

- adequado para enriquecer Reels canônicos já conhecidos por URL;
- request por Reel simplifica matching;
- sem necessidade de redescobrir perfil;
- custo previsível em escala atual.

### Limitações

- API não oficial;
- play count pode representar somente Instagram;
- precisa de POC para confirmar estabilidade e semântica no nosso conjunto.

### Estimativa no Orbit

Se fossem consultados aproximadamente 1.000 Reels/mês:

- ordem de grandeza: ~US$ 1,88/mês antes de efeitos de cache e planos.

Isso é apenas estimativa de comparação, não contratação.

## Opção C — Apify: Instagram Reel Analytics

Fonte:

https://apify.com/thequietstack/instagram-reel-analytics

O Actor documenta:

- `playCount` como número exibido no app;
- `videoViewCount` separado e potencialmente NULL;
- sem estimar NULL;
- perfis públicos;
- até 12 posts recentes por perfil;
- preço publicado de US$ 2,50 / 1.000 posts retornados.

### Pontos positivos

- semântica explícita entre playCount e videoViewCount;
- regra de NULL alinhada ao Orbit;
- barato para POC.

### Limitações

- histórico limitado aos 12 posts mais recentes por perfil;
- Actor de marketplace, não endpoint oficial do Instagram;
- precisa validar estabilidade e match com nossos Reels canônicos.

## Opção D — Apify: Instagram Reels Scraper

Fonte:

https://apify.com/prodiger/instagram-reels-scraper

O Actor anuncia quatro contadores:

- videoPlayCount;
- igPlayCount;
- videoViewCount;
- fbPlayCount;

e `playCountSource` para indicar a origem efetiva do valor.

Preço anunciado:

- a partir de ~US$ 1 / 1.000 Reels em alguns tiers;
- no Free plan, a tabela publicada indica ~US$ 2,60 / 1.000 Reels, além de pequeno custo por início.

### Pontos positivos

- modelagem explícita da origem de play count;
- pode reduzir ambiguidade entre IG/FB;
- preço baixo.

### Limitações

- Actor muito recente e de comunidade;
- ainda precisa de POC de confiabilidade;
- não deve ser adotado sem comparar estabilidade com ScrapeCreators/Bright Data.

## Comparação resumida

| Opção | Campo útil | Custo publicado aproximado | Fit com n8n | Principal risco |
|---|---|---:|---|---|
| Bright Data Reels | Views anunciado pelo produto | US$1,50/1K, 5K free | Alto | pipeline real atual não entregou views |
| ScrapeCreators Post | video_play_count | ~US$1,88/1K requests | Alto | API não oficial; IG-only em alguns casos |
| Apify Reel Analytics | playCount | US$2,50/1K | Alto | só 12 recentes/perfil |
| Apify Reels Scraper | videoPlayCount/igPlayCount/etc. | ~US$1–2,60/1K | Alto | Actor recente/comunidade |

## POC ScrapeCreators — resultado 2026-10-05

A POC isolada com 5 Reels reais foi concluída com sucesso.

Resultado:

- 5/5 requests bem-sucedidos;
- 5 créditos consumidos;
- 0 cache hits;
- `video_play_count` numérico em 5/5;
- nenhum `video_view_count` numérico separado;
- nenhum contador de shares observado;
- nenhuma métrica persistida.

Valores observados:

- DeFiYZsprp8: 44.490
- DeEQ2SzOYLs: 7.807
- Dd99oCuxVjK: 2.708
- Dd9rGewjfVK: 1.972
- DdK2zkTNQXJ: 2.501

Classificação: **CASO A**.

Conclusão atual:

- ScrapeCreators é fonte validada para um `plays_count` candidate;
- não preencher `views_count` automaticamente;
- preferir label “Reproduções” até validar a semântica visualmente contra o Instagram;
- manter shares como NULL.

Detalhes completos em:

`docs/REEL_PLAY_COUNT_POC.md`

## Recomendação para próxima etapa

A opção com melhor evidência prática agora é ScrapeCreators para `plays_count`.

Antes de produção:

1. validar manualmente 3–5 valores contra o contador público visível no Instagram;
2. definir orçamento/frequência;
3. criar enrichment separado;
4. persistir somente `plays_count`;
5. manter `views_count` e `shares_count` NULL até fonte/semântica própria.

Não integrar duas fontes em produção ao mesmo tempo antes de definir precedência e semântica.

## Regra de segurança

Nenhuma fonte de play/view foi integrada em produção nesta etapa.

O Caliber Orbit continua exibindo:

`NULL → —`

para views, plays e shares ausentes.


## Estado após ativação do Reel Plays Enrichment

ScrapeCreators deixou de ser apenas POC e passou a ser provider controlado de:

`plays_count`

Fonte:

`data.xdt_shortcode_media.video_play_count`

Semântica interna:

- `plays_count`: preenchido pelo enrichment;
- `views_count`: continua independente;
- `shares_count`: continua independente.

A UI utiliza o label:

`Reproduções`

para `plays_count`.

Não houve reclassificação de `video_play_count` como view.

A busca por uma fonte separada de `views_count` só deve continuar se o produto realmente precisar diferenciar views de reproduções na interface.
