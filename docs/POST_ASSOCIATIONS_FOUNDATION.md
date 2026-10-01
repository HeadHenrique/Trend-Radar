# Post Associations Foundation — Etapa 3.3.1

> **DRAFT — NÃO APLICADO**
>
> Esta etapa é exclusivamente arquitetural. Nenhuma migration foi criada/aplicada, o Supabase não foi alterado, o n8n não foi alterado e nenhuma chamada ao provider foi realizada.

## 1. Problema da modelagem atual

Hoje `instagram_posts` possui `monitored_profile_id` e, ao mesmo tempo, identidade global única por:

- `instagram_media_id`;
- `instagram_shortcode`;
- `permalink`.

Isso modela implicitamente:

```text
1 post canônico → 1 perfil monitorado
```

Esse modelo não representa corretamente posts colaborativos, porque a mesma mídia do Instagram pode estar associada a vários perfis monitorados sem que a mídia deva ser duplicada.

## 2. Decisão arquitetural

Separar:

```text
instagram_posts
= mídia canônica global do Instagram

monitored_profile_posts
= relação entre um perfil monitorado e um post canônico
```

Modelo:

```text
monitored_profiles
  └─< monitored_profile_posts >─┐
                                │
                         instagram_posts
                                │
                                └─< post_metric_snapshots

collection_runs
  └─< post_metric_snapshots
```

Um mesmo `instagram_posts.id` pode ter N associações em `monitored_profile_posts`.

## 3. instagram_posts canônico

Remover futuramente:

`monitored_profile_id`

Manter:

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
- first_collected_at;
- last_collected_at;
- created_at;
- updated_at.

Adicionar dados observados de autoria:

- `author_instagram_username text null`;
- `author_instagram_external_id text null`.

Esses campos:

- representam o autor observado pelo provider;
- não exigem que o autor seja perfil monitorado;
- não possuem FK para `monitored_profiles`;
- devem ser preenchidos apenas quando observados;
- um payload novo NULL não deve apagar valor anterior válido.

### Hashtags

Decisão recomendada para MVP:

`hashtags text[] null`

Semântica:

- NULL = provider não entregou/não foi observado;
- array vazio = provider observou zero hashtags;
- array com valores = hashtags observadas.

Não criar tabela normalizada de hashtags agora.

Não criar GIN index agora; adicionar somente quando uma consulta real de busca/agrupamento justificar.

## 4. monitored_profile_posts

Schema proposto:

| Campo | Tipo | Null | Default | Função |
|---|---|---:|---|---|
| monitored_profile_id | uuid | não | — | perfil monitorado |
| instagram_post_id | uuid | não | — | post canônico |
| association_type | text | não | — | author/collaborator/discovered |
| first_seen_at | timestamptz | não | now() | primeira associação observada |
| last_seen_at | timestamptz | não | now() | última vez observada |
| created_at | timestamptz | não | now() | auditoria |

Primary key:

`(monitored_profile_id, instagram_post_id)`

FKs:

- `monitored_profile_id → monitored_profiles(id) ON DELETE RESTRICT`;
- `instagram_post_id → instagram_posts(id) ON DELETE RESTRICT`.

Constraint:

`last_seen_at >= first_seen_at`.

Não é necessário UUID separado para a associação no MVP.

## 5. association_type

Valores finais recomendados:

- `author`;
- `collaborator`;
- `discovered`.

Não criar `unknown` no MVP.

### author

Usar quando houver evidência observada de que o perfil monitorado é o autor do post, por exemplo:

- `user_posted == instagram_username`;
- ou external ID observado coincide de forma confiável.

### collaborator

Usar somente com evidência explícita de coautoria/colaboração, por exemplo:

- `coauthor_producers`;
- campo equivalente de coauthors/collaborators do provider.

Um simples `tagged_users` não é suficiente sozinho para classificar como collaborator.

### discovered

Usar quando o post foi devolvido pela discovery daquele perfil, mas não há evidência observada suficiente para classificá-lo como author ou collaborator.

### Atualização da evidência

A associação pode ser atualizada quando surgir evidência mais forte:

```text
discovered → collaborator
discovered → author
collaborator → author, se autoria direta for comprovada
```

Não rebaixar associação apenas porque uma coleta posterior omitiu campos.

Isso justifica `UPDATE` para service_role em `monitored_profile_posts`.

## 6. Evidência do post Dc9H9yExV6q

Dados já existentes da execução da Etapa 3.3:

- shortcode: `Dc9H9yExV6q`;
- media ID: `3980372677646180010`;
- `user_posted = joseantoniodiferenciagro`;
- `user_posted_id = 52610638028`;
- `profile_url = https://www.instagram.com/joseantoniodiferenciagro`;
- discovery input: perfil `leonardofroese`;
- `partnership_details = null`;
- `coauthor_producers = ["diferenciagro.group", "leonardofroese"]`;
- `tagged_users` contém Leonardo Froese.

Conclusão:

**há evidência explícita de colaboração.**

Para a futura modelagem:

- post canônico:
  - author_instagram_username = `joseantoniodiferenciagro`;
  - author_instagram_external_id = `52610638028`.
- associação Leonardo ↔ post:
  - `association_type = collaborator`.

O post não deve continuar sendo descartado apenas por `user_posted != profileUsername`.

## 7. Comportamento futuro do collector

Para cada item devolvido pela discovery de um perfil monitorado:

1. validar identidade canônica do post;
2. persistir/upsert do post global;
3. mapear autor observado;
4. criar/atualizar associação perfil ↔ post;
5. classificar associação pela melhor evidência observada;
6. persistir snapshot no contexto do perfil/run.

Regra:

`user_posted != profileUsername`

não significa erro automaticamente.

## 8. Deduplicação global

A identidade canônica continua:

1. instagram_media_id;
2. instagram_shortcode;
3. permalink.

Os uniques globais permanecem em `instagram_posts`.

Uma nova participação de perfil gera:

`monitored_profile_posts`

e nunca uma segunda linha de `instagram_posts` para a mesma mídia.

## 9. Nova integridade dos snapshots

`post_metric_snapshots` continua contendo:

- post_id;
- monitored_profile_id;
- collection_run_id;
- métricas;
- captured_at.

Alterar integridade para:

```text
(monitored_profile_id, post_id)
→ monitored_profile_posts(monitored_profile_id, instagram_post_id)

(collection_run_id, monitored_profile_id)
→ collection_runs(id, monitored_profile_id)
```

A FK direta `post_id → instagram_posts(id)` é tecnicamente redundante, porque a FK para `monitored_profile_posts` já prova a existência do post e da associação. Não é recomendada no MVP para evitar duplicação de constraints sem benefício adicional.

Isso garante simultaneamente:

- post canônico existe;
- post foi associado ao perfil monitorado;
- collection run pertence ao mesmo perfil.

## 10. profile_metric_snapshots

Nenhuma mudança estrutural é necessária.

A tabela continua representando métricas do perfil e sua integridade continua:

```text
(collection_run_id, monitored_profile_id)
→ collection_runs(id, monitored_profile_id)
```

A nova associação post↔perfil não altera snapshots de perfil.

## 11. Migração dos 19 posts atuais

Estado atual validado:

- 19 `instagram_posts`;
- todos estão associados a `leonardofroese`;
- todos foram persistidos porque `user_posted` coincidiu com o perfil monitorado;
- 19 post snapshots existentes devem ser preservados.

Estratégia futura:

1. criar `monitored_profile_posts`;
2. adicionar campos de autor/hashtags em `instagram_posts`;
3. backfill dos 19 posts:
   - author_username a partir do perfil monitorado atual;
   - author_external_id a partir do external ID já resolvido do perfil;
4. criar 19 associações com `association_type='author'`;
5. trocar a FK antiga de snapshots pela FK para associação;
6. remover `monitored_profile_id` de `instagram_posts`;
7. remover índice/constraint dependentes da coluna antiga;
8. preservar IDs, snapshots, captions, timestamps e métricas.

A futura migration deve reinspecionar o estado imediatamente antes de aplicar. Se novos posts tiverem sido ingeridos sob o modelo antigo, o backfill precisa ser revisto.

## 12. Tratamento futuro do 20º post

Não inserir agora.

Quando a nova modelagem estiver aplicada:

- inserir/upsert do post canônico global;
- author = `joseantoniodiferenciagro`;
- criar associação com Leonardo;
- `association_type = collaborator`, pois o payload já contém evidência explícita em `coauthor_producers`.

## 13. Semântica final dos collection_run counters

Um `collection_run` representa **uma coleta lógica**, não uma execução técnica do n8n.

### received_count

Número de registros considerados no batch autorizado daquela coleta lógica.

### inserted_count

Quantidade de `instagram_posts` canônicos que **não existiam antes da coleta lógica** e foram introduzidos por ela.

### updated_count

Quantidade de `instagram_posts` canônicos que **já existiam antes da coleta lógica** e foram atualizados por ela.

Não contar:

- linhas de `monitored_profile_posts`;
- snapshots;
- polls;
- retries;
- replays técnicos.

Se futuramente forem necessários contadores de associações/snapshots, criar métricas próprias em vez de sobrecarregar esses três campos.

## 14. Replay de run terminal

Se o run já está:

- success;
- partial;

e o mesmo `provider_run_id` é reprocessado apenas para prova de idempotência/replay técnico:

- não alterar status;
- não alterar finished_at;
- não sobrescrever counters;
- não criar snapshot duplicado;
- não criar post duplicado;
- não transformar inserted em updated;
- encerrar como no-op/verificação.

Se for necessário reparar dados canônicos depois de um run terminal, tratar como operação explícita de manutenção/reprocessamento, não como replay transparente do run original.

## 15. Recovery de run em erro

Regra simples para MVP:

### error → running → success/partial

Permitido somente quando:

- é o mesmo collection_run;
- o mesmo provider_run_id ainda é recuperável;
- o erro ocorreu antes de uma finalização útil;
- o recovery é explícito.

`error` deve significar que nenhum resultado útil foi finalizado.

Se algum conteúdo válido já tiver sido persistido e a execução tratada terminar incompleta, usar `partial`, não `error`.

Um processo que morre abruptamente pode permanecer `running` para recovery posterior.

Não criar state machine adicional nesta fase.

## 16. orchestrator_run_id

Semântica recomendada:

`orchestrator_run_id` representa a **execução original que abriu o collection_run**.

Não sobrescrever com IDs de recovery/replay.

Se histórico completo das execuções do n8n se tornar necessário, criar futuramente entidade específica, por exemplo `collection_run_executions`, em vez de transformar uma string única em histórico implícito.

Não criar essa tabela agora.

## 17. Hashtags

Opções avaliadas:

### A — text[] no post

Prós:

- simples;
- já é observado pelo provider;
- útil para busca/agrupamento;
- baixo custo no MVP.

### B — tabela normalizada

Prós:

- melhor para taxonomia e analytics em grande escala.

Contras:

- complexidade prematura;
- exige entidades/joins adicionais antes de provar uso.

### C — não persistir

Perde um dado observado potencialmente útil para tendências.

### Decisão recomendada

Adicionar futuramente:

`hashtags text[] null`

na entidade canônica.

Não normalizar em tabela nesta fase.

Não criar índice GIN antes de existir consulta real que o exija.

## 18. Likes e comments

Confirmado:

- são métricas temporais;
- continuam em `post_metric_snapshots`;
- não devem virar fonte de verdade fixa em `instagram_posts`.

Semântica permanece:

- NULL = não observado/indisponível;
- 0 = zero observado.

## 19. Views e plays

Sem mudança.

O Posts Scraper da POC não entregou views/plays.

Não implementar Reels enrichment nesta etapa.

Avaliar enriquecimento somente depois da correção estrutural de associação.

## 20. RLS e grants propostos

### monitored_profile_posts

RLS habilitado.

authenticated:

- SELECT somente quando `app_metadata.trend_radar_role` ∈ viewer/editor/admin.

service_role:

- SELECT;
- INSERT;
- UPDATE.

Sem DELETE para collector.

UPDATE é necessário para:

- `last_seen_at`;
- fortalecimento de `association_type`.

### instagram_posts

Mantém:

- authenticated SELECT via role válida;
- service_role SELECT/INSERT/UPDATE;
- sem DELETE.

### snapshots

Mantêm grants atuais.

## 21. Índices propostos

### monitored_profile_posts

Primary key:

`(monitored_profile_id, instagram_post_id)`

Ela cobre a consulta "posts associados a um perfil".

Adicionar somente:

`(instagram_post_id, monitored_profile_id)`

para consulta "perfis associados a um post".

Não criar outro índice por `association_type` ou `last_seen_at` sem consulta real.

### instagram_posts

Manter:

- unique media ID;
- unique shortcode;
- unique permalink;
- `published_at desc` para biblioteca global.

Remover futuramente o índice:

`instagram_posts_profile_published_idx`

porque `monitored_profile_id` deixará de existir na tabela.

### post_metric_snapshots

Manter índices temporais existentes.

A FK para associação poderá justificar futuramente índice de cobertura `(monitored_profile_id, post_id)`, mas como DELETE/UPDATE de associações não é fluxo normal do MVP, adicionar somente se o advisor/queries reais demonstrarem necessidade.

## 22. Impacto no Trend Engine futuro

Creator Breadth, Adoption Velocity e contagens de concorrentes/referências deverão partir de:

`monitored_profile_posts`

e não de `instagram_posts.monitored_profile_id`.

`association_type` permitirá separar, no futuro:

- autoria direta;
- colaboração explícita;
- simples descoberta/associação.

Nenhuma lógica do Trend Engine é implementada agora.

## 23. SQL DRAFT — NÃO APLICADO

```sql
-- DRAFT — NÃO APLICADO
-- NÃO EXECUTAR.
-- Reinspecionar dados reais imediatamente antes de transformar em migration.

create table public.monitored_profile_posts (
  monitored_profile_id uuid not null
    references public.monitored_profiles(id)
    on delete restrict,

  instagram_post_id uuid not null
    references public.instagram_posts(id)
    on delete restrict,

  association_type text not null
    check (association_type in ('author', 'collaborator', 'discovered')),

  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint monitored_profile_posts_pkey
    primary key (monitored_profile_id, instagram_post_id),

  constraint monitored_profile_posts_seen_order
    check (last_seen_at >= first_seen_at)
);

create index monitored_profile_posts_post_profile_idx
  on public.monitored_profile_posts (
    instagram_post_id,
    monitored_profile_id
  );

alter table public.instagram_posts
  add column author_instagram_username text null,
  add column author_instagram_external_id text null,
  add column hashtags text[] null;

-- Backfill aprovado SOMENTE para o estado atual já validado:
-- os 19 posts existentes foram confirmados como author do perfil
-- atualmente armazenado em instagram_posts.monitored_profile_id.
update public.instagram_posts p
set
  author_instagram_username = mp.instagram_username,
  author_instagram_external_id = mp.instagram_external_id
from public.monitored_profiles mp
where mp.id = p.monitored_profile_id;

insert into public.monitored_profile_posts (
  monitored_profile_id,
  instagram_post_id,
  association_type,
  first_seen_at,
  last_seen_at,
  created_at
)
select
  monitored_profile_id,
  id,
  'author',
  first_collected_at,
  last_collected_at,
  created_at
from public.instagram_posts;

-- Trocar a integridade dos snapshots antes de remover
-- monitored_profile_id de instagram_posts.
alter table public.post_metric_snapshots
  drop constraint post_metric_snapshots_post_profile_fkey;

alter table public.post_metric_snapshots
  add constraint post_metric_snapshots_profile_post_fkey
  foreign key (monitored_profile_id, post_id)
  references public.monitored_profile_posts (
    monitored_profile_id,
    instagram_post_id
  )
  on delete restrict;

drop index public.instagram_posts_profile_published_idx;

alter table public.instagram_posts
  drop constraint instagram_posts_profile_identity_uq;

alter table public.instagram_posts
  drop constraint instagram_posts_monitored_profile_id_fkey;

alter table public.instagram_posts
  drop column monitored_profile_id;

alter table public.monitored_profile_posts
  enable row level security;

revoke all on table public.monitored_profile_posts
  from PUBLIC, anon, authenticated, service_role;

grant select on table public.monitored_profile_posts
  to authenticated;

grant select, insert, update
  on table public.monitored_profile_posts
  to service_role;

create policy "monitored_profile_posts_select_internal"
on public.monitored_profile_posts
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'trend_radar_role')
    in ('viewer', 'editor', 'admin')
);
```

### Observação sobre counters atuais

O SQL draft não corrige os counters do run da POC usando IDs hardcoded.

O run atual é conhecido por ter resultado lógico original:

- received = 20;
- inserted = 19;
- updated = 0.

Seu estado persistido foi sobrescrito pelo replay e hoje mostra 0/19.

Qualquer data repair desse run deve ser autorizado e auditado separadamente, sem embutir IDs gerados em uma migration estrutural genérica.

## 24. Decisões que exigem autorização

Antes da futura migration:

1. aprovar `monitored_profile_posts`;
2. aprovar remoção de `monitored_profile_id` de `instagram_posts`;
3. aprovar author username/external ID;
4. aprovar `hashtags text[] null`;
5. aprovar association types author/collaborator/discovered;
6. aprovar nova FK de snapshots para a associação;
7. aprovar backfill dos 19 posts como author;
8. aprovar tratamento futuro do post `Dc9H9yExV6q` como collaborator;
9. aprovar RLS/grants da associação;
10. aprovar semântica imutável dos counters após run terminal;
11. aprovar regra de recovery `error → running → success/partial`;
12. autorizar explicitamente a migration e, separadamente, qualquer data repair dos counters atuais.
