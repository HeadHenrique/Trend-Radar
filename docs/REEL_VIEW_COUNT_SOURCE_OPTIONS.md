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

## Recomendação para próxima POC

Ordem sugerida:

1. ScrapeCreators Post/Reel Info em 3–5 Reels canônicos já conhecidos;
2. Bright Data Reels dedicado em exatamente os mesmos Reels;
3. comparar os valores com o Instagram visível manualmente;
4. somente então escolher a semântica interna:
   - views_count;
   - ou plays_count.

Não integrar duas fontes em produção ao mesmo tempo antes de definir precedência e semântica.

## Regra de segurança

Nenhuma opção desta lista foi integrada nesta etapa.

O Caliber Orbit continua exibindo:

`NULL → —`

para views, plays e shares ausentes.
