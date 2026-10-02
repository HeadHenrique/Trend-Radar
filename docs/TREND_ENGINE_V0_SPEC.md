# Trend Engine V0 Spec

## Status

Etapa 4.5 é exclusivamente de especificação.

Não existe Trend Engine implementado nesta etapa.

Não foram criados:

- tabelas;
- views;
- functions;
- RPC;
- Edge Functions;
- workflows;
- UI;
- jobs de IA;
- Trend Score persistido.

## Objetivo do V0

O Trend Engine V0 deve transformar evidências observáveis em candidatos a tendência sem confundir:

- popularidade estática com tendência;
- ausência de métrica com zero;
- publicação com coleta;
- perfil com post;
- sinal quantitativo com interpretação semântica;
- um post viral isolado com adoção de mercado.

Uma tendência, no V0, exige três dimensões distintas:

1. um sinal identificável;
2. breadth/adoption entre perfis elegíveis;
3. evidência temporal de mudança ou persistência.

Sem dimensão temporal, existe um **sinal observado**, não uma tendência confirmada.

## 1. Definições centrais

### Signal

Signal é uma característica normalizada que pode ser identificada em um ou mais posts.

Exemplos observáveis sem IA:

- `content_type:reel`;
- `content_type:carousel`;
- `association:collaborator`;
- `hashtag:#tbt`;
- `duration_bucket:short`;
- `publication_hour:18`.

Exemplos semânticos futuros:

- `topic:gestao_financeira`;
- `hook:contrarian`;
- `pain:lucro_baixo`;
- `cta:comment_keyword`.

### Trend

Trend é um signal cuja adoção muda ou persiste de forma relevante ao longo de janelas temporais comparáveis.

Um signal não vira Trend somente porque:

- aparece muitas vezes;
- tem muitos likes;
- foi usado por um perfil grande;
- está presente em um único snapshot.

### Adoption

Para um escopo de perfis e uma janela:

```text
adoption =
distinct_profiles_using_signal
/
eligible_profiles_in_scope
```

Range:

`0..1`

Na tela de concorrentes, o escopo padrão deve ser:

`profile_group = competitor`

Leonardo, como `own`, não entra no denominador de adoção de concorrentes.

### Creator breadth

`creatorCount` é a quantidade absoluta de perfis distintos que usaram o signal.

Adoption é a versão normalizada por perfis elegíveis.

Com somente dois concorrentes atuais, adoption de concorrentes muda em degraus de:

- 0%;
- 50%;
- 100%.

Por isso breadth atual é descritivo, mas ainda possui baixa resolução estatística.

### Competitor overlap

```text
competitor_overlap =
distinct_competitor_profiles_using_signal
```

Pode ser acompanhado por:

```text
competitor_overlap_rate =
competitor_overlap
/
eligible_competitor_profiles
```

Overlap de tendência significa dois ou mais concorrentes usando o mesmo signal.

Não exige o mesmo media ID ou o mesmo post.

Cross-profile canonical duplication é outro conceito.

### Velocity

Velocity mede mudança de adoção entre duas janelas equivalentes.

Definição V0:

```text
velocity =
adoption_current_window
-
adoption_previous_window
```

Range:

`-1..1`

Para componente positivo de Trend Score:

```text
positive_velocity = max(0, velocity)
```

Não usar "quantidade de posts recentes" como velocity.

### Persistence

Persistence mede em quantas janelas recentes o signal permaneceu presente.

```text
persistence =
windows_with_signal
/
windows_evaluated
```

Range:

`0..1`

Exige no mínimo duas janelas completas.

### Acceleration

Acceleration é mudança da própria velocity.

```text
acceleration =
velocity_current
-
velocity_previous
```

Exige no mínimo três janelas.

Não está disponível com a base atual.

## 2. Tempo e linhagem

### published_at

Momento em que o conteúdo foi publicado no Instagram.

Usos:

- recency do conteúdo;
- janela de adoção;
- cadência;
- firstSeen/lastSeen do signal pela publicação.

### captured_at

Momento em que uma métrica do post foi observada.

Usos:

- histórico de likes/comments;
- comparação de métrica em idades equivalentes do post;
- evolução de performance.

### collection_run.finished_at

Momento em que a coleta terminou.

Usos:

- auditoria operacional;
- freshness da ingestão;
- linhagem.

Nunca substituir `published_at` por collection time em análise de tendência.

## 3. Baseline de performance

Baseline primário:

```text
profile_id + content_type + metric_basis
```

Não misturar diretamente:

- Reel;
- Image;
- Carousel;
- Video.

### Estatística escolhida

**Mediana** é o baseline padrão.

Motivo observado na base real:

Para Leonardo + Reel:

- median likes = 13;
- mean likes = 643.50.

A média é dominada por outlier.

Mediana reduz a influência de virais isolados e representa melhor o desempenho típico.

Média pode ser mostrada como diagnóstico, mas não deve ser baseline primário.

### Baseline set futuro

Para cada post candidato:

1. mesmo perfil;
2. mesmo content_type;
3. posts anteriores ao candidato;
4. mesma metric_basis;
5. preferencialmente mesma faixa de idade da métrica;
6. máximo recomendado inicial: 10 observações anteriores;
7. horizonte máximo inicial proposto: 90 dias;
8. exigir mínimo de amostra conforme data_confidence.

Esses parâmetros são proposta de V0, não implementação.

## 4. Observed interactions

Views, plays, shares e saves não possuem cobertura útil hoje.

O V0 não deve depender delas.

### Regra principal

```text
observed_interactions =
likes_count + comments_count
```

**somente se likes e comments estiverem observados.**

Exemplo:

```text
likes = NULL
comments = 7
observed_interactions = NULL
```

Não declarar `7` como total de interações.

Comments continuam disponíveis individualmente para uma análise `comments_only`.

### Metric coverage

Cada valor deve carregar cobertura explícita.

Exemplo conceitual:

```ts
{
  likesObserved: true,
  commentsObserved: true,
  viewsObserved: false,
  playsObserved: false,
  sharesObserved: false,
  savesObserved: false,
  completeInteractionBasis: true
}
```

Para `observed_interactions`:

- coverage = 1 quando likes + comments existem;
- coverage = 0 quando qualquer um dos dois está ausente.

Não usar soma parcial como se fosse completa.

## 5. Followers normalization

Pode existir uma métrica diagnóstica:

```text
current_follower_proxy_rate =
observed_interactions
/
current_followers_count
```

Mas ela deve ser rotulada como **proxy atual**.

Motivo:

`monitored_profiles.followers_count` representa followers atuais, não followers no momento histórico da publicação.

Decisão V0:

- não usar esse proxy no Trend Score;
- pode ser exibido futuramente como contexto;
- engagement histórico normalizado só será confiável quando houver snapshot de followers próximo da data de observação relevante.

## 6. Performance lift

Quando existe metric basis completa:

```text
performance_lift_ratio =
post_metric
/
median_baseline_metric
```

Exemplo:

- 1.00 = baseline;
- 1.50 = 50% acima;
- 2.00 = 2x baseline.

Pré-requisitos:

- mesmo profile;
- mesmo content_type;
- mesma metric_basis;
- baseline median > 0;
- baseline com amostra suficiente;
- cobertura de métricas compatível.

Se mediana = 0:

- ratio fica `NULL`;
- pode existir `performance_delta = post_metric - median`;
- não inventar divisor/floor apenas para gerar score.

### Post age

Performance bruta de um post publicado há horas não é diretamente comparável com um post publicado há meses.

Para performance lift robusto, V0 deve distinguir:

- `mature_lift`: posts observados após idade mínima;
- `early_lift`: somente quando recorrência permitir snapshots em idades comparáveis.

Proposta inicial:

- mature: post com pelo menos 7 dias no momento da observação;
- early: checkpoints futuros de 24h / 72h / 7d.

Hoje a base não possui checkpoints consistentes para early lift.

## 7. Small sample / data confidence

Thresholds V0 propostos com base na distribuição real:

| n elegível | sample confidence |
|---:|---|
| 0–2 | insufficient |
| 3–4 | low |
| 5–7 | medium |
| >= 8 | strong sample |

Esses thresholds não tornam a tendência automaticamente confiável.

Data confidence deve considerar também cobertura e tempo.

### Confidence dimensions

```ts
type DataConfidence = {
  level: 'insufficient' | 'low' | 'medium' | 'high'
  score: number // 0..1
  sampleSize: number
  sampleFactor: number
  metricCoverage: number
  temporalCoverage: number
  creatorCoverage: number
  lineageQuality: number
  reasons: string[]
}
```

Proposta:

```text
confidence =
0.30 * sampleFactor
+ 0.25 * metricCoverage
+ 0.20 * temporalCoverage
+ 0.15 * creatorCoverage
+ 0.10 * lineageQuality
```

Levels:

- < 0.40: insufficient;
- 0.40–0.59: low;
- 0.60–0.79: medium;
- >= 0.80: high.

Enquanto não houver recorrência, `temporalCoverage` impede high confidence para trend temporal.

## 8. Observable signals sem IA

Podem ser derivados deterministicamente:

- content_type;
- association_type;
- collaborator flag;
- hashtags estruturadas;
- duration_seconds;
- duration bucket;
- published_at;
- weekday;
- publication hour;
- post age;
- cadence por perfil;
- current format mix;
- metric availability;
- likes;
- comments;
- observed_interactions quando completo;
- baseline mediano;
- performance lift quando elegível;
- profile_group;
- market;
- priority;
- current followers;
- profile snapshot deltas quando houver histórico.

## 9. Semantic signals que exigem classificação

Não extrair na Etapa 4.5.

Contrato futuro pode incluir:

- topic;
- subject;
- angle;
- hook;
- CTA;
- pain;
- promise;
- narrative format;
- persona;
- content objective;
- offer type;
- objection;
- emotional frame.

A IA deve gerar features estruturadas.

O Trend Engine quantitativo consome essas features.

LLM não deve produzir Trend Score diretamente.

## 10. Hashtags

Cobertura real global:

- 13/60 posts com hashtags estruturadas não vazias;
- 47/60 sem hashtags estruturadas.

Entre concorrentes:

- apenas `#tbt` apareceu estruturado;
- creator breadth = 1/2;
- post count = 1.

Conclusão:

- hashtag pode ser signal opcional;
- não pode ser requisito de Trend Engine;
- não inferir hashtags da caption.

## 11. TrendCandidate

Contrato conceitual V0:

```ts
type TrendSignalType =
  | 'content_type'
  | 'association'
  | 'hashtag'
  | 'duration_bucket'
  | 'publication_pattern'
  | 'semantic_topic'
  | 'semantic_angle'
  | 'semantic_hook'
  | 'semantic_cta'
  | 'semantic_pain'
  | 'semantic_promise'

type MetricBasis =
  | 'likes_comments'
  | 'likes'
  | 'comments'

type TrendCandidate = {
  signalKey: string
  signalType: TrendSignalType
  label: string

  scope: {
    marketCode: string | null
    profileGroup: 'own' | 'competitor' | 'reference' | 'trendsetter' | 'all'
    contentType: 'reel' | 'carousel' | 'image' | 'video' | 'unknown' | null
  }

  firstSeenAt: string | null
  lastSeenAt: string | null

  postCount: number
  creatorCount: number
  eligibleCreatorCount: number
  competitorCount: number

  adoption: number | null
  competitorOverlap: number | null
  competitorOverlapRate: number | null

  velocity: number | null
  acceleration: number | null
  persistence: number | null
  recency: number | null

  performance: {
    metricBasis: MetricBasis | null
    medianBaseline: number | null
    baselineN: number
    liftRatio: number | null
    delta: number | null
  }

  confidence: DataConfidence

  score: {
    value: number | null
    availableWeight: number
    reasonUnavailable: string | null
  }

  maturity:
    | 'emerging'
    | 'accelerating'
    | 'established'
    | 'saturating'
    | 'unclassified'

  evidencePostIds: string[]
}
```

Nada disso é persistido nesta etapa.

## 12. Trend Score V0

Trend Score mede força de tendência, não apenas performance.

### Componentes de força

| componente | range | peso base |
|---|---:|---:|
| adoption | 0..1 | 0.30 |
| recency | 0..1 | 0.15 |
| positive velocity | 0..1 | 0.20 |
| performance lift | 0..1 | 0.20 |
| persistence | 0..1 | 0.15 |

Confidence não é força.

Ele atua como fator de confiabilidade.

### Recency V0

Proposta:

```text
recency =
2 ^ (-days_since_last_seen / 7)
```

7 dias funciona como half-life inicial para conteúdo social rápido.

Deve ser calibrado posteriormente com dados reais recorrentes.

### Performance component

Quando lift ratio existe:

```text
performance_component =
clamp(
  0.5 + log2(performance_lift_ratio) / 4,
  0,
  1
)
```

Comportamento:

- 0.5x baseline → 0.25;
- 1x → 0.50;
- 2x → 0.75;
- 4x → 1.00.

Sem lift válido, componente indisponível.

### Fórmula

```text
available_weight =
sum(weights of available components)

core =
sum(component * base_weight)
/
available_weight

trend_score =
100 * core * confidence
```

### Gates

Score é `NULL` se qualquer condição ocorrer:

1. adoption indisponível;
2. recency indisponível;
3. confidence insufficient;
4. available_weight < 0.60;
5. nenhum componente temporal válido entre velocity/persistence.

Essa quinta regra é essencial:

**sem evidência temporal não existe Trend Score, apenas Signal Strength descritivo.**

### Missing components

Não transformar NULL em zero.

Quando um componente opcional estiver ausente:

- remover seu peso do denominador;
- renormalizar os pesos restantes;
- reduzir confidence por cobertura;
- respeitar os gates.

Views/plays podem ficar permanentemente ausentes sem quebrar o score.

## 13. Maturity

Não classificar tendências atuais ainda.

Contrato futuro:

### emerging

- signal apareceu recentemente;
- adoption ainda baixa/moderada;
- velocity positiva;
- persistence ainda curta.

### accelerating

- velocity positiva em janelas consecutivas;
- adoption crescendo;
- creator breadth aumentando.

### established

- adoption alta;
- persistence alta;
- velocity próxima de zero;
- sinal continua recorrente.

### saturating

- adoption alta;
- persistence alta;
- velocity zero ou negativa;
- pouca vantagem de novidade.

Sem pelo menos duas janelas completas:

`maturity = unclassified`

## 14. Dados mínimos para velocity

Mínimo técnico:

- duas janelas completas e equivalentes;
- mesmos signal definitions;
- mesmos critérios de perfis elegíveis;
- pelo menos 2 concorrentes elegíveis;
- coverage de coleta suficiente em ambas.

Recomendação operacional:

- mínimo: 2 janelas de 7 dias = 14 dias;
- preferível: 3 janelas de 7 dias = 21 dias;
- usar 14-day windows para grupos de menor frequência;
- 30-day windows para persistência/maturidade, não para detecção rápida.

A base atual não satisfaz isso porque os 20 posts por perfil vieram de uma coleta inicial truncada com spans históricos diferentes.

## 15. Profile signals

Separar de post signals.

Profile signals:

- followers_count;
- follower_delta;
- following_count;
- posts_count;
- profile collection freshness.

Post signals:

- content type;
- semantic features;
- association;
- publication time;
- metrics;
- performance lift.

Não somar diretamente profile + post em um score único sem normalização.

### Follower growth

Hoje cada perfil possui exatamente 1 `profile_metric_snapshot`.

Follower growth confiável não existe.

Mínimo para delta:

- 2 snapshots.

Preferível para slope/trend:

- 3+ snapshots com intervalo consistente.

Source of truth continua sendo Profile Collector.

Não usar followers observados por Reels/Posts scrapers para inventar histórico.

## 16. Collection run lineage

Problema real:

`collection_type='posts'` hoje mistura operações semanticamente diferentes.

Runs observados incluem:

- Posts Collector normal;
- reprocessamento histórico;
- Reels Enrichment;
- Views Diagnostic.

Isso pode confundir:

- onboarding;
- recorrência;
- freshness;
- lineage de métricas;
- auditoria de custo.

### Proposta futura

Adicionar conceitualmente:

```text
collection_purpose
```

Valores V0 propostos:

- `profile_metadata`;
- `posts_snapshot`;
- `posts_reprocess`;
- `post_metrics_enrichment`;
- `post_metrics_diagnostic`.

Manter `collection_type` como agrupamento técnico coarse.

### Backfill conceitual

Pelos runs existentes:

- executions 13, 14, 16 → profile_metadata;
- execution 4 → posts_snapshot;
- execution 8 → posts_snapshot;
- execution 9 → posts_reprocess;
- execution 11 → post_metrics_enrichment;
- execution 12 → post_metrics_diagnostic;
- executions 15, 17 → posts_snapshot.

Backfill deve usar IDs conhecidos/auditados, não heurística apenas por counters.

Nenhuma migration foi aplicada nesta etapa.

## 17. O que pode ser calculado hoje

### A — confiável agora

- perfil/grupo/mercado atuais;
- followers atuais;
- 60 posts canônicos;
- format mix;
- association type;
- publication timestamps;
- comments coverage;
- likes coverage explícita;
- structured hashtag coverage;
- duração quando observada;
- cross-profile canonical duplication;
- creator breadth estático de signals observáveis;
- adoption estática por formato dentro dos dois competitors.

### B — possível com baixa/média confiança

- median comments por profile + format;
- median complete interactions quando coverage suficiente;
- performance lift maduro em grupos elegíveis;
- current follower proxy rate;
- static competitor overlap de formato;
- cadence descritiva da amostra atual.

Limitações:

- spans históricos desiguais;
- posts recentes versus posts antigos;
- somente uma coleta inicial por competitor;
- apenas 2 competitors;
- missing likes em Leonardo.

### C — indisponível

- velocity confiável;
- acceleration;
- momentum;
- persistence temporal;
- follower growth;
- early performance lift em idade equivalente;
- Trend Score;
- maturity;
- semantic topics/hooks/pains/promises;
- Brasil × EUA;
- US gap.

## 18. Mapping /competitors

Cards atuais:

### Adoção

Dataset futuro:

- TrendCandidate por scope `competitor`;
- `creatorCount`;
- `eligibleCreatorCount`;
- `adoption`;
- evidence posts.

Hoje pode exibir somente breadth descritivo de signals observáveis.

### Velocidade

Dataset futuro:

- adoption current window;
- adoption previous window;
- velocity;
- acceleration quando houver 3 janelas.

Hoje deve continuar indisponível.

### Overlap

Dataset futuro:

- `competitorOverlap`;
- `competitorOverlapRate`;
- profiles/evidence que sustentam o signal.

Hoje formato já permite overlap estático, mas não overlap temporal de tendência.

## 19. Mapping /trends

Card/listagem futura deve conter no mínimo:

- signal label;
- signal type;
- market;
- profile group scope;
- format scope;
- adoption;
- creator count;
- competitor overlap;
- velocity;
- performance lift;
- confidence;
- maturity;
- first seen;
- last seen;
- trend score;
- evidence count;
- principal evidence post;
- metric basis;
- coverage warnings.

Filtros atuais podem evoluir para esses campos sem persistência obrigatória no primeiro protótipo.

## 20. Mapping Dashboard

### Tendências emergentes

Candidates com:

- maturity = emerging;
- recency alta;
- velocity positiva.

### Tendências acelerando

Candidates com:

- maturity = accelerating;
- maior positive velocity;
- confidence suficiente.

### Oportunidades

No futuro:

- sinais com performance/breadth relevante;
- baixa adoção do grupo own;
- maior adoção em referências/competidores.

Brasil × EUA continua indisponível porque não existem perfis US.

### Tendências saturando

Candidates com:

- maturity = saturating;
- adoption alta;
- velocity não positiva;
- persistence alta.

## 21. Papel exato da IA

Separação obrigatória:

```text
caption/post
→ semantic feature extractor
→ structured features
→ quantitative Trend Engine
→ TrendCandidate/score
```

A IA pode classificar:

- topic;
- hook;
- CTA;
- pain;
- promise;
- persona;
- narrative format;
- objective.

A IA não deve:

- decidir Trend Score diretamente;
- preencher métricas faltantes;
- inferir likes/views;
- transformar ausência em zero;
- criar tendência sem evidence IDs.

## 22. Estado atual

A base atual é suficiente para validar:

- modelagem canônica;
- sinais observáveis;
- baseline estatístico;
- contratos do engine.

Ainda não é suficiente para produzir uma tendência temporal confiável.

A próxima implementação deve começar somente após resolver lineage de collection runs e iniciar recorrência de posts com janelas comparáveis.
