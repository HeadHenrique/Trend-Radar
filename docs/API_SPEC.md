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
