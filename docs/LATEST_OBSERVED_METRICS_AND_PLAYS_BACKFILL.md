# Latest Observed Metrics + Reel Plays Backfill

## Objetivo

Corrigir definitivamente dois problemas:

1. uma coleta posterior com NULL não pode apagar uma métrica observada antes;
2. Reels sem qualquer `plays_count` observado precisam de backfill controlado.

## Regra de agregação

A agregação é feita por:

`post_id + monitored_profile_id`

Os snapshots são percorridos do mais novo para o mais antigo.

Cada métrica é resolvida de forma independente:

- likesCount → último likes_count não-NULL;
- commentsCount → último comments_count não-NULL;
- viewsCount → último views_count não-NULL;
- playsCount → último plays_count não-NULL;
- sharesCount → último shares_count não-NULL;
- savesCount → último saves_count não-NULL.

NULL significa:

`não observado nesta coleta`

e nunca:

`apague a observação anterior`.

Zero real continua sendo zero.

Se nenhuma row do contexto observou qualquer métrica, o agregado é NULL.

`capturedAt` representa o timestamp mais recente entre as métricas efetivamente usadas no agregado.

Implementação compartilhada:

`src/features/posts/metrics.ts → aggregateObservedMetrics`

Consumidores:

- `src/features/posts/repository.ts`;
- `src/features/trends/repository.ts`.

## Estado inicial

Auditado antes do backfill:

- Reels canônicos: 67;
- Reels com ao menos um plays_count: 5;
- Reels sem plays_count: 62;
- snapshots com plays_count: 5;
- duplicidades canônicas: 0;
- runs de enrichment em andamento: 0.

## Workflow temporário

Nome:

`Caliber Orbit — Reel Plays Backfill`

ID:

`pzajlzNlQhhizNgK`

Características:

- Manual Trigger;
- active=false;
- sem Schedule Trigger;
- máximo 20 requests por execução;
- mesma credential ScrapeCreators;
- collection_type=posts;
- collection_purpose=post_metrics_enrichment;
- provider_key=scrapecreators;
- associação única por post com prioridade:
  author → collaborator → discovered;
- seleção equivalente a NOT EXISTS plays_count;
- sem retry automático de falhas;
- cache de vídeo best-effort com a mesma resposta, sem request extra.

## Backfill

### Lote 1 — execution 115

- requests: 20;
- créditos: 20;
- sucessos: 20;
- falhas: 0;
- snapshots inseridos: 20;
- cobertura após lote: 25/67;
- runs: 5, todos success.

### Lote 2 — execution 116

- requests: 20;
- créditos: 20;
- sucessos: 20;
- falhas: 0;
- snapshots inseridos: 20;
- cobertura após lote: 45/67;
- runs: 4, todos success.

### Lote 3 — execution 117

- requests: 20;
- créditos: 20;
- sucessos: 20;
- falhas: 0;
- snapshots inseridos: 20;
- cobertura após lote: 65/67;
- runs: 4, todos success.

### Lote 4 — execution 118

- requests: 2;
- créditos: 1;
- sucessos: 1;
- falhas: 1;
- snapshots inseridos: 1;
- run: partial.

Falha:

`DeEQ2SzOYLs → provider_unsuccessful`

A resposta informou `success=false`, sem identidade ou video_play_count válidos.

Não houve retry.

## Resultado final

- requests totais: 62;
- créditos consumidos: 61;
- snapshots novos: 61;
- Reels com plays observado: 66/67;
- Reels sem plays: 1/67;
- cobertura: 98,51%;
- snapshots totais com plays_count: 66;
- views_count non-NULL nos snapshots do backfill: 0;
- shares_count non-NULL: 0;
- saves_count non-NULL: 0;
- duplicidades de snapshot no mesmo run/post: 0;
- duplicidades de instagram_posts: 0;
- duplicidades de monitored_profile_posts: 0.

Único Reel sem plays:

`DeEQ2SzOYLs`

## Teste de regressão latest-non-null

No momento da correção não existia ainda no banco um caso real com:

1. plays_count observado;
2. snapshot posterior com plays_count NULL.

Portanto o teste obrigatório foi executado em memória, sem gravar dados fake no Supabase, usando o mesmo helper `aggregateObservedMetrics`.

Cenário:

- snapshot antigo:
  - plays=44.888
  - likes=2.168
  - comments=1.229
  - views=50.000
  - shares=321
  - saves=12
- snapshot mais novo:
  - plays=NULL
  - likes=2.200
  - comments=NULL
  - views=NULL
  - shares=NULL
  - saves=15

Resultado:

- plays=44.888;
- likes=2.200;
- comments=1.229;
- views=50.000;
- shares=321;
- saves=15;
- capturedAt = timestamp mais recente entre valores usados.

Teste adicional:

- comments posterior = 0;
- resultado agregado = 0.

Outro teste:

- contexto com todas as métricas NULL → agregado NULL.

Conclusão:

NULL posterior não apaga valor real anterior; zero real não vira ausência.

## Impacto na UI

O card continua lendo:

`latestMetrics.playsCount`

Mas `latestMetrics` agora significa:

`última observação não-NULL de cada métrica no contexto`.

Consequências:

- Reproduções aparecem sempre que existe plays_count no histórico;
- Mais reproduzidos usa o último playsCount observado;
- likes/comments/views/shares/saves seguem a mesma semântica;
- NULL só vira “—” quando a métrica nunca foi observada.
