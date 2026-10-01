# API Spec

## Estado

Nenhuma API de posts foi implementada.

Etapa 3.1.1 apenas corrige o contrato e a persistência proposta.

## Contrato provider-neutral

```ts
type InstagramObservedContentType =
  | 'reel'
  | 'carousel'
  | 'image'
  | 'video'
  | 'unknown'

type InstagramProviderPostMetrics = {
  views: number | null
  plays: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
}

type InstagramProviderPostResult = {
  instagramMediaId: string | null
  shortcode: string | null
  permalink: string | null
  publishedAt: string | null
  caption: string | null
  contentType: InstagramObservedContentType
  durationSeconds: number | null
  audioName: string | null
  thumbnailUrl: string | null
  metrics: InstagramProviderPostMetrics
}

type InstagramProviderPostsResult = {
  profileUsername: string
  fetchedAt: string
  posts: InstagramProviderPostResult[]
  nextCursor?: string | null
  hasMore?: boolean | null
}
```

## Persistência futura

Ordem lógica:

1. criar `collection_runs`;
2. chamar provider;
3. salvar `provider_run_id` quando disponível;
4. normalizar batch;
5. deduplicar/upsert em `instagram_posts`;
6. inserir snapshots usando o mesmo `collection_run_id`;
7. fechar run.

Retries do mesmo job reutilizam run e provider_run_id.

## Segurança futura

### authenticated

- SELECT em `instagram_posts`;
- SELECT em `post_metric_snapshots`;
- SELECT em `profile_metric_snapshots`;
- nenhum acesso a `collection_runs`;
- nenhuma escrita nas quatro tabelas.

### service_role

Após REVOKE ALL explícito:

- `collection_runs`: SELECT, INSERT, UPDATE;
- `instagram_posts`: SELECT, INSERT, UPDATE;
- `post_metric_snapshots`: SELECT, INSERT;
- `profile_metric_snapshots`: SELECT, INSERT.

Sem DELETE.

Snapshots sem UPDATE.

## Integridade

`post_metric_snapshots` inclui `monitored_profile_id` e usa FKs compostas para impedir combinação entre post e run de perfis diferentes.

`profile_metric_snapshots` também usa FK composta com collection run.

## Configuração de ingestão

Limite inicial recomendado:

`20 posts`.

É configuração do adapter/workflow, não do banco.

A frequência de snapshots permanece conceitual e não deve virar scheduler antes da prova real do dataset de posts.
