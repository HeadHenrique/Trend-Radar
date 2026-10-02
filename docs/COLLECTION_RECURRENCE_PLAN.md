# Collection Recurrence Plan

## Status

A política de seleção recorrente foi implementada na Etapa 4.6.

Ainda não existe Schedule Trigger nem publicação automática.

## 1. Objetivo

Criar série temporal suficiente para:

- velocity;
- acceleration;
- persistence;
- momentum;
- follower growth;
- performance em idades equivalentes.

Sem elevar volume de coleta desnecessariamente.

## 2. Separar descoberta de conteúdo e observação de métricas

Uma coleta recorrente de posts cumpre dois papéis:

1. descobrir novos posts;
2. criar novas observações de métricas dos posts retornados.

Trend Engine precisa distinguir isso na lineage.

Por isso a futura `collection_purpose` é pré-requisito recomendado.

## 3. Cadência proposta por priority

### Priority 1

Posts collection:

`1x por dia`

Uso:

- sinais altamente estratégicos;
- detecção de janela de 7 dias;
- velocity mais rápida.

### Priority 2

Posts collection:

`a cada 3 dias`

Uso:

- concorrentes normais;
- custo/coverage equilibrado;
- 2–3 observações por semana.

Raphael e Hélio estão hoje em priority 2.

### Priority 3

Posts collection:

`1x por semana`

Uso:

- referências de menor importância;
- persistence;
- sinais de 14–30 dias.

## 4. Janelas de Trend Engine

Recomendação:

| priority | coleta | janela rápida | janela preferida |
|---|---|---|---|
| 1 | diária | 7 dias | 7 dias |
| 2 | 3 dias | 14 dias | 14 dias |
| 3 | semanal | 30 dias | 30 dias |

Para um Trend Engine global, usar somente janelas em que a cobertura esperada do perfil seja compatível.

Não comparar diretamente um perfil daily com um weekly sem normalizar coverage.

## 5. Mínimos temporais

### Velocity

Mínimo:

- 2 janelas completas.

Preferível:

- 3 janelas.

Exemplo priority 1:

- mínimo 14 dias;
- preferível 21 dias.

### Acceleration

Mínimo:

- 3 janelas completas.

### Persistence

Mínimo:

- 2 janelas.

Preferível:

- 3–4.

### Follower growth

Mínimo:

- 2 profile snapshots para delta.

Preferível:

- 3+ pontos com intervalo consistente.

## 6. Volume de records

Hipótese:

`20 records por posts collection`

Sem preço financeiro.

### Se todos os perfis forem coletados diariamente

30 collections/profile/mês.

`600 records/profile/mês`

| perfis | records/mês |
|---:|---:|
| 3 | 1.800 |
| 10 | 6.000 |
| 25 | 15.000 |
| 50 | 30.000 |

### Se todos forem coletados a cada 3 dias

10 collections/profile/mês.

`200 records/profile/mês`

| perfis | records/mês |
|---:|---:|
| 3 | 600 |
| 10 | 2.000 |
| 25 | 5.000 |
| 50 | 10.000 |

### Se todos forem coletados semanalmente

Aproximação de 30/7 = 4,29 collections/profile/mês.

Aproximadamente `85,7 records/profile/mês`.

| perfis | records/mês aproximados |
|---:|---:|
| 3 | 257 |
| 10 | 857 |
| 25 | 2.143 |
| 50 | 4.286 |

## 7. Mix de prioridades

Volume real deve ser calculado por:

```text
monthly_records =
sum(
  profiles_in_priority
  * collections_per_month(priority)
  * 20
)
```

Não assumir que todos os perfis têm a mesma prioridade.

## 8. Backlog e onboarding

O onboarding atual resolve:

`healthy profile sem posts run success/partial`

Recorrência futura precisa de regra distinta.

Não reutilizar somente esse critério.

Opções futuras:

### A. next_posts_collection_at

Campo operacional explícito por perfil.

Prós:

- seleção simples;
- backoff claro;
- prioridade direta.

Contras:

- exige migration;
- cria estado adicional.

### B. derivar pela última collection_run

Selecionar pelo último run `collection_purpose=posts_snapshot`.

Prós:

- menos estado duplicado.

Contras:

- depende de lineage correta;
- query mais complexa.

Recomendação preliminar:

preferir derivação pelo último run após existir `collection_purpose`.

Evita nova coluna até haver necessidade operacional comprovada.

## 9. Lineage necessária

Proposta futura:

```text
collection_purpose
```

Valores:

- profile_metadata;
- posts_snapshot;
- posts_reprocess;
- post_metrics_enrichment;
- post_metrics_diagnostic.

Recorrência de posts deve considerar somente:

`collection_purpose = posts_snapshot`

Enrichment/diagnostic não deve avançar relógio de recorrência.

## 10. Backfill conceitual

Runs atuais:

| execution | purpose proposto |
|---:|---|
| 4 | posts_snapshot |
| 8 | posts_snapshot |
| 9 | posts_reprocess |
| 11 | post_metrics_enrichment |
| 12 | post_metrics_diagnostic |
| 13 | profile_metadata |
| 14 | profile_metadata |
| 15 | posts_snapshot |
| 16 | profile_metadata |
| 17 | posts_snapshot |

O run 9 representa o reprocessamento lógico que teve continuação técnica na execution 10 sem novo collection_run.

Backfill futuro deve usar IDs auditados.

## 11. Snapshot age checkpoints

Para performance lift de posts recentes, recorrência deve permitir checkpoints comparáveis.

Proposta:

- ~24h;
- ~72h;
- ~7d.

Não é necessário criar exatamente três jobs por post.

O collector recorrente pode gerar snapshots naturais e o engine escolhe a observação mais próxima de cada checkpoint dentro de tolerância.

Exemplo futuro:

```text
24h checkpoint tolerance = ±12h
72h checkpoint tolerance = ±24h
7d checkpoint tolerance = ±48h
```

Parâmetros precisam ser calibrados.

## 12. Evitar distorção por top-20

O Posts Collector usa `num_of_posts=20`.

Em perfis de alta frequência, um post pode sair do top-20 antes de checkpoints longos.

Para Trend Engine V0:

- discovery pode continuar top-20;
- métricas de posts já conhecidos podem futuramente precisar fonte complementar ou lookup por permalink;
- não implementar isso até existir necessidade observada.

## 13. Error/backoff

Futuro posts recurrence:

- error não deve marcar onboarding/recurrence como concluído;
- retry deve reutilizar provider_run_id quando for recovery do mesmo job;
- novo job somente quando iniciar nova coleta lógica;
- backoff deve ser explícito;
- error não deve contaminar velocity como ausência de signal.

## 14. Coverage tracking

Cada janela deve conhecer:

- eligible profiles;
- profiles successfully collected;
- profiles failed;
- profiles stale.

Adoption denominator deve usar perfis elegíveis com coverage suficiente.

Nunca interpretar falha de coleta como "não adotou".

## 15. Ordem recomendada de implementação

1. collection_purpose;
2. política de posts recurrence;
3. 14–21 dias de dados recorrentes;
4. auditoria de coverage;
5. engine quantitativo de signals observáveis;
6. semantic feature extraction;
7. Trend Score/maturity;
8. frontend.

## 16. Critério para avançar ao Trend Engine temporal

Mínimo recomendado:

- 2 competitors recorrentes;
- pelo menos 2 janelas completas;
- collection_purpose resolvido;
- nenhuma janela crítica com coleta ausente sem marcação;
- signal definitions versionadas;
- NULL semantics preservada.

Preferível:

- 5+ competitors;
- 3 janelas completas;
- 21+ dias para janela de 7 dias;
- semantic features disponíveis para tema/hook/CTA.


## Etapa 4.6 — implementação da fila recorrente

O Posts Collector agora deriva recorrência exclusivamente de `collection_purpose=posts_snapshot`.

### Onboarding

Perfil healthy/active sem run `posts_snapshot` success/partial:

- é elegível imediatamente;
- exceto se houver error posts_snapshot em backoff de 6h.

### Recorrência

Para perfil onboardado:

```text
last_valid =
último posts_snapshot
status success|partial
ordenado por finished_at
```

```text
due_at =
last_valid.finished_at
+ intervalo(priority)
```

Intervalos implementados:

- priority 1 = 24 horas;
- priority 2 = 72 horas;
- priority 3 = 7 dias.

### Error backoff

Error posts_snapshot:

- não conclui onboarding;
- não avança o relógio;
- se for mais recente que o último success/partial, cria backoff de 6h.

Após 6h:

- onboarding volta a ser elegível imediatamente;
- recorrência continua respeitando due_at do último success/partial.

### Ordenação da fila

1. onboarding não concluído;
2. priority ASC;
3. due_at mais antigo;
4. created_at ASC.

### Purposes ignorados pelo relógio

- posts_reprocess;
- post_metrics_enrichment;
- post_metrics_diagnostic.

### Estado auditado em 02/10/2026

Todos os perfis estão priority 2.

Leonardo:

- último posts_snapshot válido: execution 4, partial;
- finished_at: 2026-10-01T16:00:47.708Z;
- due_at: 2026-10-04T16:00:47.708Z;
- error posterior: execution 8;
- backoff_until: 2026-10-02T02:36:20.689Z, já expirado.

Raphael:

- último posts_snapshot válido: execution 15;
- finished_at: 2026-10-02T04:02:24.504Z;
- due_at: 2026-10-05T04:02:24.504Z.

Hélio:

- último posts_snapshot válido: execution 17;
- finished_at: 2026-10-02T04:14:52.847Z;
- due_at: 2026-10-05T04:14:52.847Z.

Avaliação no banco:

- 2026-10-02T15:19:16Z;
- 0 perfis elegíveis.

### Validação manual

Posts Collector execution:

`18`

Resultado:

- selector retornou `eligible=false`;
- guard `Perfil elegível?` seguiu pelo FALSE;
- terminou em `Nenhum perfil elegível para coleta de posts`;
- `Criar Collection Run` não executou;
- Bright Data não executou;
- collection_runs 10 → 10;
- instagram_posts 60 → 60;
- post_metric_snapshots 83 → 83.

### Coverage futuro

Janelas do Trend Engine precisarão distinguir:

- eligible;
- collected_successfully;
- failed;
- stale.

Falha de coleta nunca poderá ser interpretada como ausência de signal.

### Próxima etapa de automação

A recorrência de seleção está pronta, mas ainda faltam decisões de scheduler:

- frequência do tick;
- número máximo de perfis por tick;
- backlog;
- concorrência;
- limite de provider jobs;
- controle de custo;
- observabilidade.
