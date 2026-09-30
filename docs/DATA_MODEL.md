# Data Model

## Estado observado

Inspeção renovada em 30/09/2026 no projeto Supabase `zqwlyqnwcpddmknjnune`.

- schema `public`: 0 tabelas de negócio;
- migrations de projeto: 0;
- Edge Functions: 0;
- policies em `public` e `storage`: 0;
- Auth: 0 usuários e 0 identidades.

Nenhum schema foi criado ou alterado nesta etapa.

## Fundação de Perfis Monitorados

A próxima entidade proposta é `monitored_profiles`, ainda **não aprovada e não criada**.

A especificação completa está em:

`docs/PROFILE_FOUNDATION.md`

### Decisões propostas

- username do Instagram armazenado em forma canônica e lowercase;
- `instagram_url` não deve ser persistida, pois é derivável;
- país representado por `country_code` ISO alpha-2;
- grupo representado por referência dinâmica a `profile_groups`;
- prioridade em `smallint` de 1 a 3;
- `active` representa intenção do usuário;
- `monitoring_status` representa saúde operacional;
- delete físico não faz parte do fluxo normal;
- `created_by` referencia o usuário autenticado;
- metadados específicos do provider ficam fora da entidade canônica.

## Contrato lógico futuro

Depois da fundação de perfis, o produto poderá evoluir para conceitos separados de:

- post coletado;
- snapshot de perfil;
- snapshot de post;
- execução de coleta;
- tendência;
- observação temporal de tendência;
- participação de perfil em tendência;
- oportunidade;
- alerta.

Essas entidades **não estão aprovadas para implementação nesta etapa**.

## Regra

Qualquer implementação futura do banco deve passar por autorização explícita. Este documento não autoriza criação, alteração ou exclusão de tabelas, policies, funções ou migrations.
