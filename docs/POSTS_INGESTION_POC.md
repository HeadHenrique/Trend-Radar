# Posts Ingestion POC — Etapa 3.3

## Objetivo

Provar ponta a ponta a primeira ingestão real de posts:

```text
monitored_profiles
→ n8n
→ Bright Data Instagram Posts
→ normalização
→ deduplicação
→ instagram_posts
→ post_metric_snapshots
→ collection_runs
```

Perfil real usado:

`leonardofroese`

Nenhuma IA, Trend Engine, UI de Posts ou Schedule Trigger foi criada.

## n8n

Projeto:

`Henrique Castro <head.henriquecastro@gmail.com>`

Workflow:

`Trend Radar — Posts Collector POC`

Workflow ID:

`q9XBNlb3PsxsyULl`

Editor:

`https://henriquecastro.app.n8n.cloud/workflow/q9XBNlb3PsxsyULl`

Estado final:

- DRAFT;
- `active = false`;
- sem versão publicada;
- Manual Trigger;
- sem Schedule Trigger;
- sem username, collection_run_id ou provider_run_id da POC hardcoded na versão final.

Credenciais reutilizadas por nome:

- `Trend Radar — Bright Data API`;
- `Supabase account`.

Nenhum valor de credencial é documentado.

## Provider

Provider:

`Bright Data Instagram Posts Scraper`

Dataset:

`gd_lk5ns7kz21pck8jpis`

Modo de descoberta:

- `type=discover_new`;
- `discover_by=url`.

Input lógico:

```json
[
  {
    "url": "https://www.instagram.com/<instagram_username>/",
    "num_of_posts": 20
  }
]
```

O limite de 20 foi enviado ao provider, não aplicado somente depois do download.

Resultado real:

- registros retornados pelo provider: 20;
- overflow: 0;
- errors reportados no job: 0;
- duração do job observada: aproximadamente 104,354 segundos.

A versão final do workflow usa até 4 verificações com espera de 30 segundos, sem loop infinito.

## Collection run

Foi criado um único collection run real.

```text
id = a4cebcf2-9fb1-4d9a-8799-f3eafdd2dd4e
collection_type = posts
provider_key = bright_data
orchestrator = n8n
provider_run_id = sd_muppqcdph8ybzui2r
orchestrator_run_id = 4
received_count = 20
status = partial
```

O status final é `partial` porque 1 dos 20 registros não pertencia ao username solicitado segundo `user_posted`.

Registro rejeitado:

- `user_posted = joseantoniodiferenciagro`;
- shortcode `Dc9H9yExV6q`;
- tinha identidade válida, mas não passou na validação de proprietário.

Nenhum dado desse registro foi persistido como post de `leonardofroese`.

### Contadores e replay de idempotência

Na primeira persistência bem-sucedida do mesmo batch:

- received = 20;
- inserted = 19;
- updated = 0.

Depois foi feito um replay do **mesmo snapshot/provider_run_id**, sem disparar nova coleta, para provar idempotência:

- received = 20;
- inserted = 0;
- updated = 19;
- total de posts permaneceu 19;
- total de snapshots permaneceu 19.

Como o replay reutilizou o mesmo collection run, os contadores atualmente gravados na linha refletem o último replay: `inserted_count=0`, `updated_count=19`.

## Execuções manuais

Foram realizadas 4 execuções manuais do workflow de Posts.

### Execução 4

Primeira e única chamada real de discovery ao provider.

Resultado:

- collection run criado;
- provider_run_id criado;
- job ainda estava running após a janela inicial de 80 segundos;
- run foi encerrado como error;
- 0 posts persistidos.

### Execução 5

Recovery do mesmo provider_run_id, sem novo discovery.

O job já estava ready e tinha 20 registros.

Falha local encontrada:

- o lookup de deduplicação recebeu vários itens simultaneamente;
- n8n perdeu o pairing item-a-item;
- erro: `Multiple matches found`;
- 0 posts persistidos.

Correção:

- adicionado `Loop Over Items` com batch size 1.

### Execução 6

Recovery do mesmo provider_run_id após correção.

Resultado:

- 19 posts inseridos;
- 19 snapshots de post inseridos;
- 0 profile snapshots;
- run finalizado como partial.

### Execução 7

Replay idempotente do mesmo resultado, sem nova chamada de discovery.

Correções adicionais:

- canonicalização de permalink sem depender de `URL()` no sandbox do Code;
- duração mapeada de `videos_duration[0].video_duration`;
- lookup de snapshot antes de INSERT para respeitar `UNIQUE(post_id, collection_run_id)`.

Resultado:

- 0 posts novos;
- 19 posts atualizados;
- 0 snapshots novos;
- total permaneceu 19 posts / 19 snapshots.

## Mapping real

| Provider | Canonical | Regra |
|---|---|---|
| `post_id` | `instagram_media_id` | string real |
| `shortcode` | `instagram_shortcode` | string real |
| `url` | `permalink` | query/fragment removidos |
| `date_posted` | `published_at` | sem data inventada |
| `description` | `caption` | texto observado |
| `content_type` | `content_type` | Reel/Image/Carousel → reel/image/carousel |
| `thumbnail` | `thumbnail_url` | URL observada |
| `videos_duration[0].video_duration` | `duration_seconds` | quando disponível |
| `likes` | `likes_count` | NULL permanece NULL |
| `num_comments` | `comments_count` | zero real permanece 0 |
| `video_view_count` / `views` | `views_count` | nenhum valor observado no batch |
| `plays` / `play_count` | `plays_count` | nenhum valor observado |
| `shares` / `share_count` | `shares_count` | nenhum valor observado |
| `saves` / `save_count` | `saves_count` | nenhum valor observado |
| `audio_name` | `audio_name` | nenhum valor observado |

`user_posted` é usado para validar o proprietário e não é duplicado na entidade canônica.

Hashtags foram observadas no payload, mas não existe coluna aprovada para hashtags em `instagram_posts`; portanto não foram persistidas.

## Disponibilidade real dos campos

Nos 20 registros brutos:

- URL: 20;
- user_posted: 20;
- post_id: 20;
- shortcode: 20;
- date_posted: 20;
- thumbnail: 20;
- num_comments: 20;
- likes: 8;
- videos_duration: 17;
- views/video_view_count: 0;
- plays/play_count: 0;
- shares/share_count: 0;
- saves/save_count: 0;
- audio/audio_name utilizável: 0.

Depois de rejeitar o registro de outro proprietário, foram persistidos 19 posts.

## Estado final dos posts

```text
instagram_posts = 19
post_metric_snapshots = 19
profile_metric_snapshots = 0
collection_runs = 1
```

Cobertura dos 19 posts:

- media ID: 19/19;
- shortcode: 19/19;
- permalink: 19/19;
- published_at: 19/19;
- caption: 19/19;
- thumbnail: 19/19;
- duration_seconds: 16/19.

Distribuição:

- reel: 15;
- image: 2;
- carousel: 2.

Intervalo observado:

- post mais recente: `2026-09-12T01:57:22Z`;
- post mais antigo do batch persistido: `2025-03-19T03:38:30Z`.

## Métricas persistidas

Snapshots: 19.

Disponibilidade:

- comments_count: 19/19;
- likes_count: 7/19;
- views_count: 0/19;
- plays_count: 0/19;
- shares_count: 0/19;
- saves_count: 0/19.

Dos comentários observados, 12 snapshots possuem `comments_count = 0`. Isso confirma que ZERO foi preservado como zero observado, enquanto ausência continuou NULL.

Não foi chamado Reels Scraper adicional para preencher views/plays.

## Deduplicação

Identidade usada na ordem aprovada:

1. media ID;
2. shortcode;
3. permalink.

Na POC todos os 19 posts persistidos possuíam media ID, shortcode e permalink.

Validação final:

- media IDs duplicados: 0;
- shortcodes duplicados: 0;
- snapshots duplicados por `post_id + collection_run_id`: 0.

O replay do mesmo provider_run_id não criou post nem snapshot adicional.

## Segurança

Confirmado:

- tokens não foram copiados para GitHub;
- Supabase secret não foi copiada;
- documentação usa somente nomes de credenciais;
- nenhum header de autenticação foi documentado;
- workflow referencia credenciais do cofre do n8n;
- logs brutos do provider não foram versionados.

## Limitações / próximos passos

- o Posts Scraper não entregou views, plays, shares ou saves neste batch;
- não foi usado Reels Scraper complementar;
- 1 post colaborativo foi rejeitado pelo filtro antigo de `user_posted`; inspeção posterior confirmou `coauthor_producers` contendo `leonardofroese`;
- o collection run final está `partial`;
- o warning visual `TOP_LEVEL_ITEMS_OVER_CEILING` do n8n permanece; não afeta execução;
- a UI `/posts` continua não implementada;
- workflow continua manual e não publicado;
- nenhuma IA ou Trend Engine foi iniciada.


## Correção arquitetural posterior — Etapa 3.3.1

O registro `Dc9H9yExV6q` foi reinspecionado somente a partir do payload já armazenado.

Evidência observada:

- `user_posted = joseantoniodiferenciagro`;
- `coauthor_producers` contém `leonardofroese`;
- `tagged_users` contém Leonardo;
- a discovery input era o perfil de Leonardo.

Conclusão: existe evidência explícita de colaboração. O post foi rejeitado pela regra antiga, mas a futura arquitetura deve persistir o post global e criar associação `collaborator` com Leonardo.

Também foi identificada uma falha semântica nos counters: o replay idempotente do mesmo provider_run_id sobrescreveu o resultado lógico original do run. A regra futura será manter counters/status/finished_at imutáveis em replay de run já terminal.

Detalhes:

`docs/POST_ASSOCIATIONS_FOUNDATION.md`


## Etapa 3.3.2 — Correção estrutural aplicada

Após a POC, a modelagem foi corrigida para suportar posts colaborativos.

Mudanças de banco:

- `instagram_posts` tornou-se canônico global;
- criado `monitored_profile_posts`;
- os 19 posts legados foram backfilled como `author`;
- 19 snapshots foram preservados;
- a FK de snapshots agora exige associação perfil↔post;
- adicionados author username/external ID e hashtags.

Mudanças no workflow, sem execução:

- divergência de `user_posted` não descarta mais automaticamente um post;
- author/collaborator/discovered são classificados por evidência;
- post upsert é global;
- associação é resolvida antes do snapshot;
- evidence type não é rebaixado;
- terminal replay é bloqueado antes de upserts;
- finalizadores só alteram runs em `running`.

O post `Dc9H9yExV6q` continua ausente do banco. A nova lógica o classificaria como collaborator de Leonardo, mas nenhuma execução foi feita.

O run histórico também não foi reparado; seus counters persistidos continuam refletindo o replay antigo.
