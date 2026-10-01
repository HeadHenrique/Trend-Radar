# Architecture

## Estado implementado

A arquitetura em produção continua inalterada:

- React/TypeScript/Vite;
- Supabase Auth;
- `public.monitored_profiles`;
- n8n Profile Collector DRAFT;
- provider de perfil validado.

Etapa 3.1.1 é somente documentação.

## Fundação proposta de conteúdo/histórico

```text
monitored_profiles
  ↓
collection_runs
  ├── provider_key
  ├── orchestrator
  ├── provider_run_id
  └── orchestrator_run_id
  ↓
provider adapter
  ↓
InstagramProviderPostsResult
  ↓
instagram_posts
  ↓
post_metric_snapshots

collection_runs
  ↓
profile_metric_snapshots
```

## Separação provider/orquestrador

Provider:

`provider_key`

Exemplo conceitual:

`bright_data`

Orquestrador:

`orchestrator`

Default conceitual atual:

`n8n`

IDs externos opcionais:

- `provider_run_id`;
- `orchestrator_run_id`.

Nenhum campo Bright Data específico entra nas entidades canônicas.

## Idempotência e recovery

Cada coleta lógica:

1. cria collection run antes do provider;
2. chama provider;
3. persiste provider_run_id quando disponível;
4. reutiliza o mesmo run e provider job em retries;
5. grava snapshots com o mesmo collection_run_id;
6. finaliza o run uma única vez.

Polling não cria runs novos.

## Integridade de perfil

FKs compostas garantem que:

- post;
- collection run;
- post snapshot;

sempre pertençam ao mesmo `monitored_profile_id`.

A mesma regra associa profile snapshots ao run do perfil correto.

## Segurança

Frontend:

- SELECT em posts e snapshots observados, conforme role;
- nenhum acesso a collection_runs no MVP.

Collector server-side:

- posts/runs: SELECT + INSERT + UPDATE;
- snapshots: SELECT + INSERT;
- sem DELETE;
- sem UPDATE de snapshots.

RLS protege usuários normais.

Como `service_role` ignora RLS, grants mínimos explícitos são a barreira principal do collector.

## Frequência e volume

20 posts é apenas limite configurável da primeira POC.

As faixas de frequência de snapshots permanecem conceituais até validar o dataset real de posts e consumo do provider.

Documento principal:

`docs/POSTS_SNAPSHOTS_FOUNDATION.md`
