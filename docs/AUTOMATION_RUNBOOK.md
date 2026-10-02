# Automation Runbook — Etapa 4.7

## Estado de produção

Collectors operacionais publicados:

- Trend Radar — Profile Collector POC
- Trend Radar — Posts Collector POC

Mantidos fora de produção:

- Trend Radar — Reels Enrichment POC
- Trend Radar — Reels Views Discovery Diagnostic

Timezone explícito:

`America/Sao_Paulo`

## 1. Profile Collector

Workflow ID:

`BijTnAz2cSLTMzva`

Triggers:

- Manual Trigger preservado;
- Schedule Trigger v1.4.

Schedule:

```text
cron: 0 10 * * * *
timezone: America/Sao_Paulo
```

Executa uma vez por hora:

`HH:10`

O schedule não define regra de negócio.

O workflow continua decidindo internamente se algum perfil está due por:

- `active`;
- `monitoring_status`;
- `next_collection_at`;
- `priority`.

Se `Selecionar Perfil Elegível` não retornar item, o fluxo encerra antes de criar `collection_run`.

## 2. Posts Collector

Workflow ID:

`q9XBNlb3PsxsyULl`

Triggers:

- Manual Trigger preservado;
- Schedule Trigger v1.4.

Schedule:

```text
cron: 0 40 */4 * * *
timezone: America/Sao_Paulo
```

Horários esperados:

- 00:40;
- 04:40;
- 08:40;
- 12:40;
- 16:40;
- 20:40.

O Schedule Trigger não substitui `due_at`.

O selector interno continua usando:

- priority 1 = 24h;
- priority 2 = 72h;
- priority 3 = 7d;
- posts_snapshot success/partial;
- error backoff de 6h.

## 3. Controle de concorrência

Máximo operacional:

`1 perfil por workflow execution`

Não existe batch paralelo.

Schedules foram desencontrados:

- Profile em XX:10;
- Posts em XX:40 nos horários de 4h.

## 4. Guard contra execução duplicada

Antes de criar provider job, ambos os collectors consultam `collection_runs`.

### Profile

Bloqueia novo run quando já existe:

```text
monitored_profile_id = perfil selecionado
collection_purpose = profile_metadata
status = running
```

Terminal limpo:

`Coleta de perfil já em andamento`

### Posts

Bloqueia novo run quando já existe:

```text
monitored_profile_id = perfil selecionado
collection_purpose = posts_snapshot
status = running
```

Terminal limpo:

`Coleta de posts já em andamento`

Esse guard também protege contra running stale.

Running antigo não é convertido automaticamente em error.

## 5. No due

### Profile

O Code node `Selecionar Perfil Elegível` retorna lista vazia quando não existe perfil due.

Sem item:

- não cria run;
- não chama provider;
- execução termina naturalmente.

### Posts

Caminho explícito existente:

```text
Perfil elegível?
→ FALSE
→ Nenhum perfil elegível para coleta de posts
```

Sem:

- collection_run;
- Bright Data;
- error operacional.

## 6. Collection purpose

Produção deve gerar:

Profile:

```text
collection_type = profile
collection_purpose = profile_metadata
```

Posts:

```text
collection_type = posts
collection_purpose = posts_snapshot
```

`collection_purpose` permanece NOT NULL no banco.

## 7. Error / backoff

### Profile

Erro preserva regra atual:

- monitoring_status = error;
- last_collection_error preenchido;
- next_collection_at = agora + 6h.

### Posts

Error `posts_snapshot`:

- não conclui onboarding;
- não avança due_at;
- cria backoff operacional de 6h quando é o error mais recente.

## 8. Observabilidade

Fontes operacionais oficiais:

1. `collection_runs`;
2. n8n Executions.

Campos principais:

- collection_purpose;
- status;
- monitored_profile_id;
- provider_run_id;
- orchestrator_run_id;
- started_at;
- finished_at;
- error_message.

### Investigar error

1. localizar `collection_runs.status=error`;
2. verificar `error_message`;
3. usar `orchestrator_run_id` para abrir execution correspondente no n8n;
4. identificar último node executado;
5. verificar se existe `provider_run_id`;
6. não disparar retry manual sem autorização.

### Investigar stale running

1. localizar `status=running`;
2. comparar `started_at` com duração normal observada;
3. abrir n8n execution via `orchestrator_run_id`;
4. verificar provider_run_id e último polling;
5. não criar segundo provider job;
6. não transformar automaticamente em error;
7. resolver manualmente depois da auditoria.

## 9. Pausar toda automação

Para parar novos ticks:

- desativar/unpublish Profile Collector;
- desativar/unpublish Posts Collector.

Não é necessário:

- remover Schedule Trigger;
- apagar collection_runs;
- apagar posts;
- apagar snapshots;
- alterar schema.

Ao reativar, os schedules existentes voltam a operar usando o estado persistido.

## 10. Workflows que NÃO devem ser publicados

### Reels Enrichment

ID:

`CWMacm8bwxDXue4w`

Estado validado:

- active=false;
- activeVersionId=null;
- Manual Trigger only.

### Views Diagnostic

ID:

`0dnlSxCbcENJR4E4`

Estado validado:

- active=false;
- activeVersionId=null;
- Manual Trigger only.

## 11. n8n execution budget

Schedule Profile:

```text
24 executions/day
≈ 720/month
```

Schedule Posts:

```text
6 executions/day
≈ 180/month
```

Total aproximado:

```text
30 executions/day
≈ 900 scheduled executions/month
```

Cada tick conta como workflow execution mesmo quando nenhum perfil está elegível.

Wait/polling interno permanece dentro da mesma execution.

### Pricing oficial consultado em 2026-10-02

Fonte:

https://n8n.io/pricing/

Página pública observada:

- Starter: 20 EUR/month billed annually, 2.5K workflow executions;
- Pro: 50 EUR/month billed annually, 10K workflow executions;
- pricing baseado em workflow executions, com unlimited steps.

A conta/plano contratado do projeto não foi alterada nem auditada nesta etapa.

Os 900 ticks/mês cabem isoladamente abaixo de 2.5K, mas consumo total da conta inclui outros workflows.

## 12. Bright Data — hard cap do scheduler

Se TODO tick encontrasse trabalho:

Profile:

```text
24 jobs/day
× 1 record
× 30 days
= 720 successful records/month
```

Posts:

```text
6 jobs/day
× 20 records
× 30 days
= 3,600 successful records/month
```

Teto teórico:

```text
4,320 successful records/month
```

Isso não é projeção real.

## 13. Projeção operacional atual

Três perfis atuais estão priority 2.

### Profile metadata

Priority 2 atual:

`~6h`

Por perfil:

`~4 collections/day`

Três perfis:

```text
~12 records/day
~360 successful records/month
```

### Posts

Priority 2:

`72h`

Por perfil:

`~10 collections/month`

```text
10
× 20 records
× 3 profiles
= ~600 records/month
```

Total aproximado:

`~960 successful provider records/month`

## 14. Bright Data pricing

Fonte oficial consultada em 2026-10-02:

https://brightdata.com/pricing/web-scraper

e Instagram Scraper API:

https://brightdata.com/products/web-scraper/instagram

Valores públicos observados:

- Free Tier: 5K records/month;
- Pay as you go: USD 1.50 / 1K successful records;
- Scale: USD 499/month com 384K records incluídos;
- adicional Scale: USD 1.30 / 1K records;
- cobrança informada como somente successful deliveries.

Em isolamento, tanto a projeção atual de ~960 quanto o teto do scheduler de ~4.320 ficam abaixo dos 5K records publicados para o free tier.

Isso NÃO garante custo zero porque:

- o account pode ter outro plano/condição;
- free credits podem ser consumidos por outros scrapers;
- uso manual e outros projetos também entram no consumo;
- esta etapa não acessou billing privado da conta.

## 15. Estado após ativação

Profile Collector:

- active=true;
- activeVersionId=`d0327ad6-1327-4a56-938b-c010de5d89f1`.

Posts Collector:

- active=true;
- activeVersionId=`54ac82e5-8b01-499c-8980-b1012f76d821`.

Nenhuma execução manual foi feita na Etapa 4.7.

Após publicar, não foi aguardado nenhum tick automático.
