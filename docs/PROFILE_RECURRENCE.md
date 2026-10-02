# Profile Collector Recurrence — Etapa 4.1

## Estado

Implementado e validado em 02/10/2026.

Workflow:

`Trend Radar — Profile Collector POC`

ID:

`BijTnAz2cSLTMzva`

Estado final:

- DRAFT;
- active=false;
- Manual Trigger;
- sem Schedule Trigger;
- sem username hardcoded.

## Objetivo

Transformar o Profile Collector de uma POC que coletava apenas `pending` em um collector manual recorrente de metadata de perfil.

Fluxo final:

```text
perfil elegível
→ collection_run
→ Bright Data Instagram Profiles
→ provider_run_id
→ polling limitado
→ normalização
→ validação de identidade
→ monitored_profiles
→ profile_metric_snapshots
→ finalizar collection_run
```

## Elegibilidade

O workflow busca até 50 perfis `active=true` e escolhe apenas 1 por execução.

Status aceitos:

- pending;
- healthy;
- error.

Um perfil é elegível quando:

```text
active = true
AND monitoring_status IN ('pending','healthy','error')
AND (
  next_collection_at IS NULL
  OR next_collection_at <= agora
)
```

Perfis `active=false` nunca são coletados.

### Ordenação

1. menor valor de priority;
2. next_collection_at mais antigo, com NULL primeiro;
3. created_at como desempate.

## Pending

Perfil novo começa como `pending`.

Se estiver ativo e elegível, entra na mesma fila.

Após coleta válida:

`monitoring_status = healthy`

Não precisa voltar para pending para ser coletado novamente.

## Healthy

Perfil healthy volta a ser elegível quando:

`next_collection_at <= agora`.

Essa é a correção principal da Etapa 4.1.

## Error

Perfil error também pode voltar à fila quando next_collection_at vencer.

Sem exponential backoff nesta fase.

Backoff atual:

`erro → next_collection_at = agora + 6 horas`.

Em erro também são gravados:

- monitoring_status = error;
- last_collection_error sanitizado.

## Frequência provisória de sucesso

- priority 1 → +1 hora;
- priority 2 → +6 horas;
- priority 3 → +24 horas.

Essa política ainda não é de produção.

Não existe Schedule Trigger.

## Collection run

Antes de chamar Bright Data o workflow cria `collection_runs` com:

- monitored_profile_id;
- collection_type = profile;
- provider_key = bright_data;
- orchestrator = n8n;
- orchestrator_run_id = execution ID;
- status = running.

Após o provider devolver snapshot ID:

- provider_run_id é persistido no mesmo run.

O POST que cria o provider job não possui retry automático.

Polling e download podem repetir usando o mesmo provider_run_id.

## Provider

Provider mantido:

`Bright Data Instagram Profiles Scraper`

Dataset:

`gd_l1vikfch901nx3by4`

Credencial n8n:

`Trend Radar — Bright Data API`

Supabase:

`Supabase account`

Nenhum secret foi versionado.

## Contrato normalizado

```ts
type InstagramProviderProfileResult = {
  instagramUsername: string | null
  instagramExternalId: string | null
  displayName: string | null
  profilePictureUrl: string | null
  followersCount: number | null
  followingCount: number | null
  postsCount: number | null
  fetchedAt: string
}
```

ZERO é preservado somente quando realmente observado.

Campos ausentes permanecem NULL.

## Validação de identidade

Antes do update:

- username normalizado deve coincidir com monitored_profiles.instagram_username;
- se já existe instagram_external_id e o provider devolve external ID, ambos devem coincidir.

Conflito de identidade:

- não sobrescreve o perfil;
- marca erro;
- finaliza collection_run como error.

## Update de monitored_profiles

Em sucesso o collector altera somente:

- instagram_external_id;
- display_name;
- profile_picture_url;
- followers_count;
- monitoring_status;
- last_collected_at;
- next_collection_at;
- last_collection_error.

Não altera campos humanos/estratégicos.

### NULL não apaga valor válido

Se provider retornar NULL para:

- instagramExternalId;
- displayName;
- profilePictureUrl;
- followersCount;

o valor anterior do perfil é preservado.

## Followers source of truth

A fonte oficial de:

`monitored_profiles.followers_count`

é o Profile Scraper.

Posts Scraper e Reels Scraper não atualizam followers_count.

A observação anterior de followers=2767 via Reels foi apenas contextual.

Na Etapa 4.1 o Profile Scraper confirmou oficialmente 2767.

## Profile metric snapshot

Após coleta válida, se ao menos uma métrica estiver observada, o workflow cria:

`profile_metric_snapshots`

com:

- monitored_profile_id;
- collection_run_id;
- captured_at;
- followers_count;
- following_count;
- posts_count.

Antes do INSERT existe lookup por:

`(monitored_profile_id, collection_run_id)`

para respeitar idempotência.

Se as três métricas forem NULL, nenhum snapshot é criado.

## Finalização de sucesso

```text
status = success
received_count = 1
inserted_count = 0
updated_count = 1
error_message = NULL
```

O collector atualiza um monitored_profile existente; não cria perfil novo.

## Finalização de erro

Erros tratados incluem:

- provider rejeitado;
- provider_run_id não persistido;
- timeout;
- download inválido;
- identidade divergente;
- falha no update de perfil;
- falha no profile snapshot.

O mesmo collection_run é finalizado como error.

## Execução real de validação

Execution n8n:

`13`

Perfil selecionado dinamicamente:

`leonardofroese`

Estado anterior:

- followers_count = 2766;
- monitoring_status = healthy;
- next_collection_at = 2026-10-01T09:44:08.144Z;
- profile_metric_snapshots = 0.

O perfil estava elegível porque a data já havia vencido.

### Provider

Novo provider job:

`sd_muqbz2hh2idhvxeg6s`

Resultado real:

- username = leonardofroese;
- external ID = 6280370116;
- followers = 2767;
- following = 286;
- posts_count = 226;
- identidade válida.

### Collection run

ID:

`2841cb95-0106-4691-931f-0bb90ab64031`

```text
collection_type = profile
provider_key = bright_data
orchestrator = n8n
orchestrator_run_id = 13
provider_run_id = sd_muqbz2hh2idhvxeg6s
received_count = 1
inserted_count = 0
updated_count = 1
status = success
```

### Perfil após coleta

```text
followers_count = 2767
monitoring_status = healthy
last_collected_at = 2026-10-02T02:16:16.069Z
next_collection_at = 2026-10-02T08:16:16.129Z
last_collection_error = NULL
```

Priority 2 gerou +6h.

### Snapshot criado

ID:

`ed03e8a2-68fb-42cc-9d76-12e89a156ae2`

```text
followers_count = 2767
following_count = 286
posts_count = 226
captured_at = 2026-10-02T02:16:16.069Z
```

Total:

`profile_metric_snapshots: 0 → 1`

## Isolamento da execução

Nesta etapa foi adicionada somente a execution manual 13 ao Profile Collector.

Não foram executados:

- Posts Collector;
- Reels Enrichment POC;
- Reels Views Discovery Diagnostic.

## Frontend

Nenhum arquivo de frontend foi alterado.

Como /profiles usa monitored_profiles.followers_count, a próxima carga exibirá naturalmente:

`2.767`

Histórico/gráfico de followers não foi implementado nesta etapa.

## Advisors

Security Advisor:

- INFO de collection_runs com RLS sem policy é intencional/server-side only;
- WARN Leaked Password Protection é pré-existente e não foi alterado.

Performance Advisor:

- permanecem 2 INFOs antigos de FKs run/profile sem covering index;
- permanecem unused indexes já conhecidos;
- nenhuma migration foi criada.

## Antes de Schedule Trigger

Ainda revisar:

- custo por coleta;
- quantidade de perfis;
- política real de frequência;
- comportamento de perfis error;
- janela de polling;
- operação com múltiplos competitors/references.

Até lá:

- Manual Trigger;
- active=false;
- sem Schedule Trigger.
