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
