# API Spec

## Estado atual

O frontend continua usando Supabase Data API com publishable key + JWT.

O n8n utiliza credencial server-side somente para as operações operacionais já implementadas.

Nenhuma API de posts foi implementada na Etapa 3.1.

## Contrato proposto de post

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
```

Regras:

- campos ausentes → `null`;
- não inferir métricas;
- não converter ausência para zero;
- não transformar todo vídeo em Reel;
- pelo menos uma identidade de post deve existir.

## Contrato proposto de batch

```ts
type InstagramProviderPostsResult = {
  profileUsername: string
  fetchedAt: string
  posts: InstagramProviderPostResult[]
  nextCursor?: string | null
  hasMore?: boolean | null
}
```

Paginação fica opcional para não acoplar domínio ao provider atual.

## Estratégia futura de persistência

Para cada post normalizado:

1. buscar por media ID;
2. fallback shortcode;
3. fallback permalink canônico;
4. inserir ou atualizar a entidade canônica;
5. inserir snapshot de métricas com o mesmo `collection_run_id`.

Snapshot só existe quando ao menos uma métrica foi observada.

## Estado observado do provider atual

Sem executar nova coleta, a execução já armazenada da Etapa 3 foi revisada.

Os objetos de post observados não continham métricas de:

- views;
- plays;
- likes;
- comments;
- shares;
- saves.

Logo essas métricas continuam nullable até a prova real do endpoint/dataset de posts.

## Segurança proposta

Frontend autenticado com role válida:

- SELECT em posts/runs/snapshots;
- sem INSERT;
- sem UPDATE;
- sem DELETE.

Backend/n8n:

- upsert em posts;
- criação/fechamento de collection runs;
- INSERT de snapshots.

Nenhuma alteração foi aplicada nesta etapa.
