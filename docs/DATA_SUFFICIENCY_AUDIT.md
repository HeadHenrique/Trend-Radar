# Data Sufficiency Audit

## Etapa 4.5

Auditoria read-only do Supabase real.

Projeto:

`zqwlyqnwcpddmknjnune`

Nenhum dado foi alterado.

## 1. Estado real

| entidade | quantidade |
|---|---:|
| monitored_profiles | 3 |
| instagram_posts | 60 |
| monitored_profile_posts | 60 |
| post_metric_snapshots | 83 |
| profile_metric_snapshots | 3 |
| collection_runs | 10 |

Perfis:

| perfil | grupo | followers atuais | posts associados |
|---|---|---:|---:|
| helio.tatsuo | competitor | 340.070 | 20 |
| leonardofroese | own | 2.767 | 20 |
| raphaelcostaoficial | competitor | 295.953 | 20 |

Todos os três estão healthy.

## 2. Formatos globais

| formato | posts |
|---|---:|
| Reel | 40 |
| Carousel | 13 |
| Image | 7 |
| Video | 0 |
| Unknown | 0 |

Mix global:

- Reels: 66,7%;
- Carousels: 21,7%;
- Images: 11,7%.

## 3. Auditoria por perfil

### helio.tatsuo

- total: 20;
- Reels: 8;
- Images: 5;
- Carousels: 7;
- Videos: 0;
- oldest published_at: 2025-10-17T14:09:07Z;
- newest published_at: 2026-10-02T01:07:17Z;
- likes disponíveis: 19/20;
- comments disponíveis: 20/20;
- views: 0/20;
- plays: 0/20;
- hashtags não vazias: 0/20;
- hashtags NULL: 20/20.

### leonardofroese

- total: 20;
- Reels: 16;
- Images: 2;
- Carousels: 2;
- Videos: 0;
- oldest published_at: 2025-03-19T03:38:30Z;
- newest published_at: 2026-09-12T01:57:22Z;
- likes disponíveis: 9/20;
- comments disponíveis: 20/20;
- views: 0/20;
- plays: 0/20;
- hashtags não vazias: 12/20;
- hashtags NULL: 8/20.

### raphaelcostaoficial

- total: 20;
- Reels: 16;
- Images: 0;
- Carousels: 4;
- Videos: 0;
- oldest published_at: 2026-06-24T00:08:36Z;
- newest published_at: 2026-10-01T23:50:28Z;
- likes disponíveis: 20/20;
- comments disponíveis: 20/20;
- views: 0/20;
- plays: 0/20;
- hashtags não vazias: 1/20;
- hashtags NULL: 19/20.

## 4. Cobertura global das métricas atuais

Para cada contexto post + perfil foi usado somente o snapshot mais recente.

| métrica | cobertura |
|---|---:|
| likes | 48/60 = 80% |
| comments | 60/60 = 100% |
| likes + comments completos | 48/60 = 80% |
| views | 0/60 |
| plays | 0/60 |
| shares | 0/60 |
| saves | 0/60 |

Conclusão:

- comments é a métrica quantitativa mais completa;
- likes é útil, mas missingness precisa ser explícito;
- views/plays/shares/saves não devem entrar como requisito do V0.

## 5. Hashtags

Global:

- 13/60 posts possuem hashtags estruturadas não vazias;
- 47/60 não possuem hashtag estruturada;
- 0 arrays vazios observados.

Por competitors:

- Hélio: 0/20;
- Raphael: 1/20.

Única hashtag estruturada observada nos competitors:

`#tbt`

Creator breadth:

`1/2`

Conclusão:

hashtags não sustentam Trend Engine como feature obrigatória.

## 6. Duração

Cobertura observada:

| perfil + formato | n | duration disponível |
|---|---:|---:|
| Hélio Carousel | 7 | 1 |
| Hélio Image | 5 | 0 |
| Hélio Reel | 8 | 8 |
| Leonardo Carousel | 2 | 1 |
| Leonardo Image | 2 | 0 |
| Leonardo Reel | 16 | 16 |
| Raphael Carousel | 4 | 2 |
| Raphael Reel | 16 | 16 |

Duração é sinal confiável principalmente para Reels.

Não deve ser requisito para outros formatos.

## 7. Association signals

Competitors:

| associação | creators | posts |
|---|---:|---:|
| author | 2 | 39 |
| collaborator | 1 | 1 |

Formato entre competitors:

| formato | competitors | posts | adoption |
|---|---:|---:|---:|
| Reel | 2/2 | 24 | 100% |
| Carousel | 2/2 | 11 | 100% |
| Image | 1/2 | 5 | 50% |

Esses valores representam **adoção estática na amostra**, não velocity.

## 8. Canonical overlap

Posts canônicos associados a mais de um monitored profile:

`0`

Não existe atualmente cross-profile media duplication entre os três perfis monitorados.

Isso não impede overlap de signal.

## 9. Snapshots

Post metric snapshots:

`83`

Contextos únicos post + perfil:

`60`

Distribuição:

- 40 contextos com 1 snapshot;
- 17 contextos com 2 snapshots;
- 3 contextos com 3 snapshots;
- mínimo: 1;
- máximo: 3;
- média: 1,38 snapshots/contexto.

Os 23 snapshots adicionais estão concentrados na fase de Leonardo/Reels diagnostics.

Isso não representa uma série uniforme de todos os perfis.

Profile snapshots:

- Hélio: 1;
- Leonardo: 1;
- Raphael: 1.

Follower growth não pode ser calculado confiavelmente.

## 10. Publication span

A amostra atual não possui janela homogênea.

Hélio:

- 17 posts nos últimos 7 dias;
- 3 posts muito mais antigos;
- oldest 2025-10-17.

Leonardo:

- 0 nos últimos 14 dias;
- 5 nos últimos 30 dias;
- oldest 2025-03-19.

Raphael:

- 15 nos últimos 7 dias;
- 16 nos últimos 14 dias;
- oldest 2026-06-24.

Consequência:

não comparar frequência ou performance temporal desses três conjuntos como se todos representassem a mesma janela.

## 11. Baselines observados

Último snapshot por contexto.

### Hélio

| formato | n posts | n complete interactions | mediana likes | média likes | mediana comments | mediana likes+comments |
|---|---:|---:|---:|---:|---:|---:|
| Carousel | 7 | 7 | 168 | 243,00 | 7 | 175 |
| Image | 5 | 4 | 975 | 1.368,75 | 8 | 981,5 |
| Reel | 8 | 8 | 47 | 59,63 | 1 | 48,5 |

### Leonardo

| formato | n posts | n complete interactions | mediana likes | média likes | mediana comments | mediana likes+comments |
|---|---:|---:|---:|---:|---:|---:|
| Carousel | 2 | 0 | indisponível | indisponível | 4,5 | indisponível |
| Image | 2 | 1 | 3 | 3 | 0 | 3 |
| Reel | 16 | 8 | 13 | 643,50 | 0 | 13 |

O contraste Reel median 13 versus mean 643,50 confirma forte sensibilidade da média a outlier.

### Raphael

| formato | n posts | n complete interactions | mediana likes | média likes | mediana comments | mediana likes+comments |
|---|---:|---:|---:|---:|---:|---:|
| Carousel | 4 | 4 | 120,5 | 106,50 | 85 | 221,5 |
| Reel | 16 | 16 | 105 | 129,94 | 1,5 | 108,5 |

## 12. Baseline readiness

### Melhor condição atual

- Hélio Carousel;
- Hélio Reel;
- Raphael Reel.

Possuem:

- n >= 7/8;
- complete interactions com cobertura completa.

Ainda assim existe limitação de post age.

### Low confidence

- Hélio Image: somente 4 complete interactions;
- Raphael Carousel: n=4.

### Insufficient / biased

- Leonardo Carousel;
- Leonardo Image;
- Leonardo Reel para complete interactions, porque likes existem em apenas 8/16 e missingness pode não ser aleatória.

Comments-only de Leonardo Reel possui cobertura 16/16, mas mediana 0 impede lift ratio baseado em divisão.

## 13. Collection runs

Existem 10 runs.

Profile runs:

- execution 13 — Leonardo;
- execution 14 — Raphael;
- execution 16 — Hélio.

Todos possuem `collection_type=profile`.

Runs `collection_type=posts` misturam:

- initial Posts Collector;
- failed Posts Collector;
- controlled reprocess;
- Reels Enrichment;
- Views Diagnostic;
- onboarding Raphael;
- onboarding Hélio.

Problema:

`collection_type` não identifica propósito semântico suficiente para Trend Engine/recorrência.

## 14. Sufficiency matrix

### A — confiável agora

- canonical post identity;
- profile/group;
- current followers;
- format mix;
- association type;
- published_at;
- latest comments;
- likes com coverage explícita;
- hashtags coverage;
- duration de Reels;
- current creator breadth;
- static format adoption;
- canonical duplicate audit.

### B — possível com baixa/média confiança

- median baselines por profile+format;
- comments-only baselines;
- complete interactions em grupos com coverage;
- mature performance lift;
- current follower proxy rate;
- static competitor overlap;
- cadence descritiva da amostra.

### C — ainda indisponível

- velocity;
- acceleration;
- momentum;
- temporal persistence;
- follower growth;
- early lift em checkpoints equivalentes;
- Trend Score temporal;
- maturity;
- semantic trend detection;
- Brasil × EUA.

## 15. Conclusão

Os dados atuais são suficientes para desenhar e testar contratos quantitativos.

Não são suficientes para declarar tendências temporais confiáveis.

O principal déficit não é quantidade total de rows.

É:

- baixa creator breadth;
- falta de recorrência homogênea;
- ausência de semantic features;
- lineage ambígua em collection_runs;
- missing likes em parte do histórico;
- ausência completa de views/plays.
