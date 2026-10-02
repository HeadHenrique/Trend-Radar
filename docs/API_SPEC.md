# API Spec

## Post canônico

Contrato persistido:

```ts
type InstagramPost = {
  id: string
  instagramMediaId: string | null
  shortcode: string | null
  permalink: string | null
  publishedAt: string | null
  caption: string | null
  contentType: 'reel' | 'carousel' | 'image' | 'video' | 'unknown'
  durationSeconds: number | null
  audioName: string | null
  thumbnailUrl: string | null
  authorInstagramUsername: string | null
  authorInstagramExternalId: string | null
  hashtags: string[] | null
}
```

## Associação

```ts
type PostAssociationType =
  | 'author'
  | 'collaborator'
  | 'discovered'
```

`monitored_profile_posts` relaciona:

- monitoredProfileId
- instagramPostId
- associationType
- firstSeenAt
- lastSeenAt

## Normalização no n8n

### author

author username/external ID coincide com perfil monitorado.

### collaborator

coauthor field explícito contém o perfil.

### discovered

post apareceu na discovery sem evidência suficiente de autoria/coautoria.

## Upsert

Post:

1. media ID
2. shortcode
3. permalink

Associação:

`monitored_profile_id + instagram_post_id`

NULL novo não apaga valor canônico válido anterior.

Hashtags:

- NULL preserva valor anterior;
- [] é observação válida de zero hashtags.

## Snapshots

Associação deve existir antes do snapshot.

Snapshot continua usando:

- post_id
- monitored_profile_id
- collection_run_id

## Counters

Contam somente posts canônicos novos/atualizados da coleta lógica.

Associações e snapshots não entram em inserted_count/updated_count.

## Replay terminal

success/partial não é reprocessado pela etapa de persistência.

## Dc9H9yExV6q

Ainda não persistido.

Pela nova normalização:

- author = joseantoniodiferenciagro
- associação Leonardo = collaborator


## Validação runtime 3.3.3

A primeira execução após a migration canônica criou:

- novo collection_run;
- novo provider_run_id.

O provider respondeu `ready` com `records=0`.

Consequência:

- nenhum `InstagramPost` foi normalizado;
- nenhum `MonitoredProfilePostAssociation` foi criado/atualizado;
- nenhum snapshot novo foi criado.

Assim, os contratos de author/collaborator/discovered continuam validados estruturalmente, mas não foram exercitados por dados reais nesta execução.

O tratamento de batch vazio encerrou o run como `error` sem alterar conteúdo existente.


## Validação runtime 3.3.3

A primeira execução após a migration canônica criou novo collection_run e novo provider_run_id.

O provider respondeu `ready` com `records=0`.

Consequência:

- nenhum post foi normalizado;
- nenhuma associação foi criada/atualizada;
- nenhum snapshot novo foi criado.

Os contratos de author/collaborator/discovered continuam validados estruturalmente, mas não foram exercitados por dados reais nesta execução.


## Validação runtime 3.3.4

O contrato canônico foi exercitado com 20 registros reais do snapshot histórico.

Confirmado em runtime:

- author = 19;
- collaborator = 1;
- discovered = 0;
- upsert global por media ID/shortcode/permalink;
- associação antes do snapshot;
- hashtags estruturadas persistidas;
- NULL novo não apagou valores válidos;
- 20 snapshots criados no novo run.

Caso colaborativo validado:

`Dc9H9yExV6q`

- authorInstagramUsername = `joseantoniodiferenciagro`;
- authorInstagramExternalId = `52610638028`;
- associationType = `collaborator`.


## Reels enrichment

Workflow separado:

`CWMacm8bwxDXue4w`

Mapping observado:

- `views → views_count`;
- `video_play_count → plays_count` quando não-NULL;
- `likes → likes_count`;
- `num_comments → comments_count`.

Na POC:

- views = NULL em 3/3;
- video_play_count = NULL em 3/3;
- likes = disponível em 3/3;
- comments = disponível em 3/3;
- shares/saves = não observados.

`audio_url` não é tratado como `audio_name`.

Nenhum post é criado pelo enrichment.

Snapshots são novas observações históricas vinculadas a um collection_run próprio.


## Reels Views Diagnostic

Modalidade B:

`discover_new + discover_by=url`

Input:

`profile URL + num_of_posts=1`

Resultado real:

```ts
{
  shortcode: 'DIe1t5bN7oO',
  views: null,
  videoPlayCount: null,
  likes: 4929,
  comments: 7,
  followers: 2767
}
```

Match:

`post_id → instagram_media_id`

Campos alternativos ausentes:

- view_count;
- video_views;
- play_count;
- plays;
- clips_play_count;
- ig_play_count;
- reach;
- impressions.

Snapshot criado porque likes/comments foram observados.

Nenhum post canônico foi criado ou atualizado.


## Profile Collector recorrente

Contrato normalizado:

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

Regras:

- NULL novo não apaga metadata válida anterior;
- followers_count oficial vem apenas do Profile Scraper;
- identidade usa username + external ID quando disponível;
- profile snapshot só é criado quando followers/following/posts_count possuem ao menos uma observação.

Elegibilidade:

- active=true;
- pending|healthy|error;
- next_collection_at NULL ou vencido.

Success:

- received=1;
- inserted=0;
- updated=1.

Error:

- profile → monitoring_status=error;
- next_collection_at=agora+6h;
- run → status=error;
- mensagem sanitizada.

Validação real:

- followers=2767;
- following=286;
- posts_count=226;
- profile snapshot criado.


## Onboarding inicial de posts por perfil

A elegibilidade para a primeira coleta de posts não depende de coluna nova no perfil.

Um perfil é candidato quando:

```text
active = true
monitoring_status = healthy
```

Ele é excluído da fila quando existe `collection_runs` com:

```text
monitored_profile_id = profile.id
collection_type = posts
status IN (success, partial)
```

`error` não conclui onboarding.

Ordenação:

1. priority ASC;
2. created_at ASC.

A regra é implementada no n8n com leitura de perfis + leitura de runs + Code node. Não existe `next_posts_collection_at`.

### Validação Raphael

Profile result:

```ts
{
  instagramUsername: 'raphaelcostaoficial',
  instagramExternalId: '1526023890',
  displayName: 'Raphael Costa | Grupo 220🫡',
  followersCount: 295953,
  followingCount: 1661,
  postsCount: 6234
}
```

Posts run:

- 20 registros;
- 20 posts canônicos novos;
- 19 author;
- 1 collaborator;
- 20 post snapshots;
- views/plays/shares/saves indisponíveis;
- likes/comments disponíveis em 20/20.

A semântica NULL != ZERO permanece preservada.
