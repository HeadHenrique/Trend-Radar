# Collection Purpose Migration — Etapa 4.6

## Objetivo

Separar o propósito operacional real de cada `collection_run` da classificação técnica coarse `collection_type`.

A Etapa 4.6 adicionou:

`collection_purpose`

em:

`public.collection_runs`

## Migration A

Arquivo:

`20261002151345_add_collection_purpose_nullable.sql`

Mudanças:

- adiciona `collection_purpose text NULL`;
- adiciona CHECK dos valores permitidos;
- não contém IDs históricos;
- não executa backfill específico.

Valores permitidos:

- `profile_metadata`;
- `posts_snapshot`;
- `posts_reprocess`;
- `post_metrics_enrichment`;
- `post_metrics_diagnostic`.

## Backfill operacional auditado

O backfill foi executado fora das migrations versionadas, somente após reinspeção dos 10 runs reais.

Mapping validado:

| execution | collection_type | collection_purpose |
|---:|---|---|
| 4 | posts | posts_snapshot |
| 8 | posts | posts_snapshot |
| 9 | posts | posts_reprocess |
| 11 | posts | post_metrics_enrichment |
| 12 | posts | post_metrics_diagnostic |
| 13 | profile | profile_metadata |
| 14 | profile | profile_metadata |
| 15 | posts | posts_snapshot |
| 16 | profile | profile_metadata |
| 17 | posts | posts_snapshot |

Resultado:

- profile_metadata = 3;
- posts_snapshot = 4;
- posts_reprocess = 1;
- post_metrics_enrichment = 1;
- post_metrics_diagnostic = 1;
- NULL = 0;
- total = 10.

Nenhum run inesperado existia antes do backfill.

## Migration B

Arquivo:

`20261002151409_enforce_collection_purpose.sql`

Mudanças:

- `collection_purpose SET NOT NULL`;
- adiciona compatibilidade semântica entre `collection_type` e `collection_purpose`.

Regra:

`profile_metadata`

só é válido com:

- `profile`;
- `profile_and_posts`.

Os purposes:

- `posts_snapshot`;
- `posts_reprocess`;
- `post_metrics_enrichment`;
- `post_metrics_diagnostic`;

só são válidos com:

- `posts`;
- `profile_and_posts`.

## Integridade final

Validado no banco:

- column is_nullable = NO;
- 0 rows com purpose NULL;
- todos os 10 históricos classificados;
- nenhum valor fora do CHECK;
- dois constraints de purpose ativos.

## Workflows

### Profile Collector

Novos runs:

```text
collection_type = profile
collection_purpose = profile_metadata
```

### Posts Collector

Coleta normal:

```text
collection_type = posts
collection_purpose = posts_snapshot
```

### Reels Enrichment

```text
collection_type = posts
collection_purpose = post_metrics_enrichment
```

### Views Diagnostic

```text
collection_type = posts
collection_purpose = post_metrics_diagnostic
```

### Reprocessamento futuro

Qualquer novo reprocessamento deverá usar:

```text
collection_type = posts
collection_purpose = posts_reprocess
```

Não foi criado workflow de reprocessamento nesta etapa.

## Advisors

Security Advisor não apontou regressão específica da nova coluna.

Findings preexistentes:

- collection_runs com RLS sem policy, intencionalmente server-side only;
- Leaked Password Protection desabilitado.

Performance Advisor manteve:

- 2 FKs sem covering index;
- 5 unused indexes.

Nenhum índice novo foi criado para `collection_purpose` sem evidência de necessidade.
