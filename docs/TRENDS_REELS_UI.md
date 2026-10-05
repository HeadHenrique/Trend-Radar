# Tendências — Reels Brasil / EUA

## Etapa 5.0

A rota `/trends` passou de um empty state de Trend Engine para uma experiência de descoberta baseada em Reels reais.

Esta etapa não implementa:

- Trend Score;
- TrendCandidate;
- velocity;
- acceleration;
- maturity;
- Brazil Gap;
- classificação semântica por IA.

## Fonte de dados

`trendsRepository` faz quatro leituras em lote:

1. `instagram_posts` filtrado por `content_type=reel`;
2. `monitored_profile_posts`;
3. `monitored_profiles`;
4. `post_metric_snapshots`.

Não existe query por card.

O mercado vem exclusivamente de:

`monitored_profiles.primary_market_code`

Mercados preparados:

- BR;
- US.

## Estado real auditado em 03/10/2026

Perfis:

- 3 BR;
- 0 US.

Reels associados a BR:

- 40 Reels canônicos;
- 3 perfis monitorados;
- 32/40 com likes observados;
- 40/40 com comments observados;
- 0/40 com views observadas.

Reels US:

- 0.

Nenhum dado foi criado para preencher lacunas.

## Latest metrics

O repository agrupa snapshots por:

`post_id + monitored_profile_id`

Somente o snapshot mais recente daquele contexto entra na apresentação.

Histórico nunca é somado.

Quando existem múltiplos contextos para o mesmo post:

- todos permanecem nas associations;
- a UI escolhe um contexto primário somente para ordenação/apresentação de métricas;
- contexto com likes + comments completos tem precedência;
- em empate, vence a observação mais recente.

## Observed interactions

```text
observed_interactions =
likes_count + comments_count
```

Somente quando:

```text
likes_count != NULL
AND
comments_count != NULL
```

Caso contrário:

`observed_interactions = NULL`

NULL nunca vira zero.

## Ranking provisório "Em destaque"

"Em destaque" não é Trend Score.

A ordenação é uma tupla determinística, nesta ordem:

1. Reel acima do baseline de interações;
2. Reel publicado nos últimos 7 dias;
3. likes + comments completos;
4. maior `observed_interactions`;
5. publicação mais recente.

Não existe peso oculto ou IA.

### Outras ordenações

- Mais engajados = `observed_interactions DESC`, NULL por último;
- Mais curtidos = likes DESC, NULL por último;
- Mais comentados = comments DESC, NULL por último;
- Mais recentes = `published_at DESC`;
- Mais visualizados = views DESC, somente quando existe ao menos uma view observada no mercado selecionado.

No estado atual BR:

"Mais visualizados" fica desabilitado.

## Baseline

Baseline é calculado por:

`monitored_profile_id + content_type=reel`

Estatística:

mediana.

O Reel atual é excluído da amostra de peers.

Amostra mínima:

`5`

Métricas possíveis:

- median likes;
- median comments;
- median observed interactions.

"Acima do baseline" exige:

`observed_interactions > median_observed_interactions`

"Alta interação" exige:

`observed_interactions / median_observed_interactions >= 1.5`

quando a mediana é maior que zero.

Sem amostra suficiente:

- nenhum lift é mostrado;
- nenhuma classificação acima do baseline é inventada.

## Nichos

Filtros visuais:

- Todos;
- Gestão;
- Financeiro;
- Vendas;
- Liderança;
- Empreendedorismo;
- Estratégia;
- Comercial;
- Marketing;
- Outros.

Eles usam exclusivamente:

- `monitored_profiles.niche`;
- `monitored_profiles.category`;
- `monitored_profiles.tags`.

Caption não é classificada.

"Outros" inclui perfis sem metadata de nicho ou sem correspondência com os termos explícitos.

## Mercado EUA

A UI já suporta US.

Estado atual:

nenhum perfil US.

Empty state:

`Nenhuma referência dos EUA monitorada ainda.`

Descrição:

`Adicione referências e trendsetters americanos para começar a acompanhar sinais do mercado dos EUA.`

Não existem mocks ou fallback BR para US.

## Cards

Cada Reel exibe, quando observado:

- thumbnail;
- autor canônico;
- perfil monitorado relacionado;
- avatar do perfil;
- mercado;
- data de publicação;
- caption curta;
- nicho/categoria;
- likes;
- comments;
- views somente se não-NULL;
- Collab quando associação explícita;
- badges determinísticos Recente / Alta interação / Acima do baseline.

Autoria canônica e perfil monitorado não são confundidos.

## Drawer

`PostDetailDrawer` foi evoluído e reutilizado pela página Tendências.

No modo Tendências ele ganha:

- layout maior;
- player/embed;
- contexto de mercado;
- perfil monitorado;
- nicho/categoria;
- associação;
- duração;
- conteúdo completo;
- associations;
- última observação;
- bloco "Por que está em destaque?";
- baseline quando suficiente.

A rota `/posts` mantém o comportamento existente.

## Player / embed

Estratégia:

- não persiste `video_url`;
- não usa CDN temporária como player;
- não faz scraping no frontend;
- usa permalink canônico;
- tenta renderizar o embed oficial do Instagram via `https://www.instagram.com/embed.js`;
- se um iframe oficial não aparecer, cai para thumbnail + botão "Abrir Reel no Instagram".

Referência Meta:

`https://developers.facebook.com/docs/instagram-platform/oembed/`

A documentação da Meta informa que Instagram oEmbed suporta photo, video e Reel posts e que conteúdo privado, inativo, age-restricted ou com embeds desabilitados não é suportado.

Nenhuma alteração de backend foi necessária para a estratégia atual.

## Busca

Busca local cobre:

- caption;
- autor;
- username de perfil monitorado;
- display name;
- shortcode;
- hashtags.

## Período

Usa somente:

`instagram_posts.published_at`

Opções:

- 7 dias;
- 30 dias;
- 90 dias;
- Todo período.

Collection time não é usado como publicação.

## Próximos passos

Antes de Brazil Gap:

1. adicionar referências/trendsetters US de forma autorizada;
2. acumular Reels US reais;
3. deixar a recorrência criar série temporal;
4. reavaliar coverage de views;
5. somente depois conectar Trend Engine temporal e comparação BR × US.


## Etapa 5.1 — metadata de nicho + fundação US

A UI de /trends não precisou ser alterada.

O helper existente:

`matchesTrendNiche`

já usa:

- profile.niche;
- profile.category;
- profile.tags;

com normalização de acentos/case.

### Curadoria BR

Raphael:

- niche = Gestão
- category = Gestão Estratégica
- tags = gestão, estratégia, processos, cultura, empreendedorismo

Hélio:

- niche = Gestão
- category = Gestão Empresarial
- tags = vendas, financeiro, liderança, cultura, processos

Leonardo foi preservado:

- niche = Gestão
- category = Gestão Empresarial

### US

Foram cadastrados exatamente 2 perfis:

- @leilahormozi — trendsetter — Liderança
- @codiesanchez — reference — Empreendedorismo

Ambos:

- market = US
- priority = 2
- active = true
- monitoring_status = pending
- provider fields = NULL

Até o onboarding automático ocorrer, /trends > EUA pode continuar em empty state.

Nenhum mock foi adicionado.


## Player nativo + cache estável de vídeo

A experiência de /trends agora prefere vídeo cacheado no Supabase Storage.

Fluxo:

```text
Posts Collector
→ URL MP4 temporária do payload
→ cache-reel-media Edge Function
→ bucket privado reel-media-cache
→ instagram_posts.video_storage_path
→ trendsRepository cria signed URLs em lote
→ CachedReelPlayer usa <video>
→ InstagramReelEmbed somente como fallback
```

### Semântica do vídeo

A URL temporária do Instagram nunca é salva em `instagram_posts`.

Ela existe somente durante a execution do Posts Collector para alimentar a função de cache.

Campos persistidos:

- video_storage_path;
- video_cached_at.

O player recebe signed URL de 1 hora para o arquivo privado.

### Player

Quando há vídeo cacheado:

```html
<video controls playsInline preload="metadata" poster="..." />
```

No card, o vídeo inicia após o clique no Play e continua respeitando `playingReelId`, portanto apenas um Reel fica ativo por vez.

Se o arquivo não estiver cacheado ou a signed URL falhar:

- InstagramReelEmbed;
- depois o fallback já existente para abrir no Instagram.

### Backfill inicial

Foi usado somente histórico retido de executions do Posts Collector, sem nova chamada Bright Data.

- URLs históricas únicas tentadas: 56;
- vídeos cacheados: 32;
- URLs expiradas/HTTP error: 24;
- Reels atuais no banco: 57;
- Reels ainda sem cache: 25.

Nenhum job de discovery foi criado para completar os 25 restantes.

Eles serão cacheados naturalmente quando aparecerem em coletas automáticas futuras.

### Volume inicial

- arquivos: 32;
- total: ~131,2 MiB;
- média: ~4,1 MiB;
- maior: ~11,5 MiB;
- limite por arquivo no bucket: 64 MiB.

### Métricas

O player não altera métricas.

Cards continuam lendo somente o latestMetrics do contexto.

No momento da implementação:

- views observadas = 0;
- plays observados = 0;
- shares observados = 0.

NULL permanece —.


## Correção — player nativo para todos os Reels recuperáveis

Estado antes:

- Reels canônicos: 67
- com video_storage_path: 43
- sem video_storage_path: 24

Foi executado backfill controlado de mídia usando o endpoint já validado do ScrapeCreators:

`GET /v1/instagram/post`

A URL temporária `data.xdt_shortcode_media.video_url` foi usada somente em memória para alimentar:

`cache-reel-media`

Nunca foi persistida em `instagram_posts`.

### Backfill

Lote 1:

- requests: 10
- identidades válidas: 10
- cacheados: 9
- falha: DbLadvXBHYU → storage_upload_failed

Lote 2:

- requests: 10
- cacheados: 10

Lote 3:

- requests: 4
- cacheados: 4

Total:

- requests/créditos: 24
- sucessos de cache: 23
- falhas: 1
- Reels cacheados: 66/67
- faltantes: 1

Nenhum post_metric_snapshot foi criado pelo backfill.

### Signed URLs

Foi validada geração de signed URLs para todos os 66 paths cacheados:

- 66/66 URLs assinadas;
- 0 erros;
- 0 paths registrados sem objeto.

Quatro MP4s foram testados por HTTP HEAD e responderam 200 / video/mp4 / Accept-Ranges: bytes:

- Raphael: DbEfPaWp6mU
- Hélio: Dd9rGewjfVK
- Leonardo: DXjjjjZB1SM
- controle já cacheado: DeCkDcCFFJC

### Fallback visual

`CachedReelPlayer` não carrega mais `InstagramReelEmbed` como fallback padrão.

Agora:

```text
playbackUrl disponível
→ <video>

playbackUrl ausente ou player nativo falhou
→ thumbnail
→ “Vídeo indisponível no momento”
→ “Abrir no Instagram”
```

Essa regra vale para inline e drawer.

O componente `InstagramReelEmbed` permanece no repositório, mas não é mais utilizado pelo player padrão.


## Reproduções — latest observed value

O bloco `Reproduções` continua usando:

`latestMetrics.playsCount`

A diferença é semântica:

`latestMetrics` agora agrega a observação mais recente não-NULL por métrica.

Exemplo:

```text
ScrapeCreators:
plays = 10.000
likes = 500

Bright Data posterior:
plays = NULL
likes = 510
```

Resultado da UI:

```text
plays = 10.000
likes = 510
```

O mesmo vale para:

- comments;
- views;
- shares;
- saves.

NULL posterior nunca apaga uma observação válida anterior.

Após o backfill controlado:

- 66/67 Reels possuem plays_count;
- cobertura = 98,51%;
- único Reel sem plays: DeEQ2SzOYLs.

`Mais reproduzidos` usa o `playsCount` agregado, portanto não cai para NULL por causa de snapshots posteriores de outro provider.
