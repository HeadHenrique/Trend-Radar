# API Spec

## Estado atual

Nenhuma API/frontend novo foi implementado na Etapa 3.3.1.

## Contrato conceitual futuro de associação

```ts
type PostAssociationType =
  | 'author'
  | 'collaborator'
  | 'discovered'

type MonitoredProfilePostAssociation = {
  monitoredProfileId: string
  instagramPostId: string
  associationType: PostAssociationType
  firstSeenAt: string
  lastSeenAt: string
}
```

### Evidência

- author: autoria direta observada;
- collaborator: coauthor/collaboration explícito;
- discovered: devolvido pela discovery do perfil, sem autoria/coautoria comprovada.

Não classificar collaborator apenas por username divergente.

## Post canônico

Campos de autoria propostos:

```ts
authorInstagramUsername: string | null
authorInstagramExternalId: string | null
hashtags: string[] | null
```

Autor não precisa ser monitored profile.

## Deduplicação

Global:

1. instagramMediaId;
2. shortcode;
3. permalink.

Associação adicional não cria novo post.

## Replay

Para run terminal com o mesmo provider_run_id:

- não sobrescrever counters;
- não alterar finished_at/status;
- não criar snapshots duplicados;
- validar idempotência e sair.

## Recovery

Erro recuperável pode voltar a running e terminar success/partial se o mesmo provider job ainda for utilizável.

Nenhum workflow foi alterado nesta etapa.
