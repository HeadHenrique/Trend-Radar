# Post Associations Foundation — Etapa 3.3.2

## Estado

**IMPLEMENTADO** em 01/10/2026.

Migrations:

- `20261001201951_create_post_profile_associations`;
- `20261001202104_index_post_snapshot_profile_post_fk`.

Nenhum dado da POC foi reprocessado nesta etapa e o workflow não foi executado.

## Modelo final

```text
monitored_profiles
  └─< monitored_profile_posts >─ instagram_posts
                                  └─< post_metric_snapshots

collection_runs
  ├─< post_metric_snapshots
  └─< profile_metric_snapshots
```

`instagram_posts` é a mídia canônica global.

`monitored_profile_posts` representa a associação de um perfil monitorado com um post.

## instagram_posts

A coluna antiga `monitored_profile_id` foi removida.

Campos canônicos:

- id;
- instagram_media_id;
- instagram_shortcode;
- permalink;
- published_at;
- caption;
- content_type;
- duration_seconds;
- audio_name;
- thumbnail_url;
- author_instagram_username;
- author_instagram_external_id;
- hashtags;
- first_collected_at;
- last_collected_at;
- created_at;
- updated_at.

Identidade global continua baseada em:

1. instagram_media_id;
2. instagram_shortcode;
3. permalink.

Autor observado não possui FK para `monitored_profiles`.

## monitored_profile_posts

Campos:

- monitored_profile_id uuid NOT NULL;
- instagram_post_id uuid NOT NULL;
- association_type text NOT NULL;
- first_seen_at timestamptz NOT NULL;
- last_seen_at timestamptz NOT NULL;
- created_at timestamptz NOT NULL.

PK:

`(monitored_profile_id, instagram_post_id)`

Tipos:

- author;
- collaborator;
- discovered.

FKs usam `ON DELETE RESTRICT`.

Índice reverso:

`(instagram_post_id, monitored_profile_id)`.

## Backfill legado

Antes da migration:

- instagram_posts = 19;
- post_metric_snapshots = 19.

Validação prévia confirmou:

- nenhum post órfão;
- nenhum monitored_profile_id NULL;
- nenhuma identidade canônica ausente;
- nenhuma relação post/snapshot inválida;
- todos os 19 posts legados pertenciam ao único perfil monitorado atual.

Após a migration:

- instagram_posts = 19;
- monitored_profile_posts = 19;
- post_metric_snapshots = 19;
- todas as 19 associações = author.

Nenhum post foi recriado.

Os IDs existentes foram preservados: o conjunto de post IDs continua coincidindo entre posts, associações e snapshots.

## Autoria e hashtags

Os 19 posts legados receberam:

- author_instagram_username;
- author_instagram_external_id;

a partir do perfil monitorado antigo.

`hashtags` permanece NULL nos registros legados porque esse campo não estava persistido antes.

Semântica futura:

- NULL = não observado;
- [] = observado sem hashtags;
- array = hashtags observadas.

## Integridade dos snapshots

A FK antiga:

`(post_id, monitored_profile_id) → instagram_posts(id, monitored_profile_id)`

foi removida.

A nova FK é:

`(monitored_profile_id, post_id) → monitored_profile_posts(monitored_profile_id, instagram_post_id)`

Continua também:

`(collection_run_id, monitored_profile_id) → collection_runs(id, monitored_profile_id)`

Assim o snapshot exige:

- post canônico existente;
- associação perfil↔post existente;
- run pertencente ao mesmo perfil.

Teste transacional com ROLLBACK confirmou:

1. snapshot sem associação falha;
2. após associação temporária válida, snapshot passa;
3. nenhum dado de teste permanece.

## Association type no collector

A normalização do Posts Collector foi adaptada:

### author

Quando:

- author username observado coincide com o perfil; ou
- author external ID observado coincide com o perfil.

### collaborator

Somente quando existe evidência explícita, como `coauthor_producers` contendo o perfil.

### discovered

Quando o post foi retornado na discovery, mas não há evidência suficiente de autoria ou coautoria.

`tagged_users` sozinho não classifica collaborator.

## Não downgrade

A associação usa força de evidência:

`discovered < collaborator < author`

Uma coleta posterior menos completa não rebaixa evidência anterior.

Atualizações possíveis:

- discovered → collaborator;
- discovered → author;
- collaborator → author.

## Post Dc9H9yExV6q

Permanece **não inserido** nesta etapa.

A lógica adaptada o classificaria como:

- autor observado: joseantoniodiferenciagro;
- associação de Leonardo: collaborator.

Motivo: `coauthor_producers` contém `leonardofroese`.

A próxima etapa fará validação controlada do collector; não houve reprocessamento nesta etapa.

## Counters de collection_runs

Semântica futura:

- received_count = tamanho do batch lógico;
- inserted_count = posts canônicos novos introduzidos pela coleta lógica;
- updated_count = posts canônicos preexistentes atualizados pela coleta lógica.

Não contam:

- associações;
- snapshots;
- polling;
- retry;
- replay técnico.

O run histórico da POC não foi reparado.

Resultado lógico original conhecido:

- received=20;
- inserted=19;
- updated=0.

Estado persistido atual permanece:

- received=20;
- inserted=0;
- updated=19.

## Replay terminal

O workflow agora possui guard estrutural:

`Run processável?`

Somente `running` segue para persistência.

Runs terminais são encerrados antes de upserts por `Encerrar Replay Terminal`.

Além disso, nodes de finalização só atualizam linhas com `status=running`.

Logo replay técnico de `success/partial` não deve alterar:

- posts;
- snapshots;
- status;
- finished_at;
- counters.

## Recovery de error

Recovery continua explícito.

Conceito aprovado:

`error → running → success/partial`

somente para:

- mesmo collection_run;
- mesmo provider_run_id;
- job ainda recuperável.

`orchestrator_run_id` representa a execução original que abriu o run e não é sobrescrito pelo workflow adaptado.

## Segurança

RLS habilitado em `monitored_profile_posts`.

Grants reais:

- anon: nenhum;
- authenticated: SELECT;
- service_role: SELECT, INSERT, UPDATE;
- service_role: sem DELETE.

Policy de SELECT exige role:

- viewer;
- editor;
- admin.

Role inválida foi testada e não lê associações.

## Advisors

Security Advisor:

- nenhum finding novo causado pela association table;
- INFO de `collection_runs` sem policy continua intencional;
- WARN de leaked password protection permanece fora do escopo.

Performance Advisor inicialmente sinalizou a nova FK de snapshots sem índice de cobertura.

Foi aplicada a migration:

`20261001202104_index_post_snapshot_profile_post_fk`

criando:

`post_metric_snapshots_profile_post_idx(monitored_profile_id, post_id)`.

Após isso o finding novo desapareceu.

Permanecem dois INFOs antigos de FKs run/profile e unused indexes esperados.
