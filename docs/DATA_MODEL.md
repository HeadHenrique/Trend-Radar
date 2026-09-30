# Data Model

## Estado observado

Inspeção em 30/09/2026 no projeto Supabase `zqwlyqnwcpddmknjnune`:

- schema `public`: 0 tabelas de negócio;
- migrations de projeto: 0;
- Edge Functions: 0;
- policies em `public` e `storage`: 0;
- Auth: 0 usuários e 0 identidades.

Nenhum schema foi criado ou alterado nesta etapa.

## Fundação de Perfis Monitorados

A entidade proposta continua sendo `monitored_profiles`, ainda **não aprovada e não criada**.

Especificação detalhada:

`docs/PROFILE_FOUNDATION.md`

## Decisões corrigidas

### Papel estratégico

`profile_group` não contém geografia.

Valores propostos:

- `own`;
- `competitor`;
- `reference`;
- `trendsetter`.

No MVP a modelagem recomendada é `TEXT + CHECK`, sem tabela `profile_groups`.

### Mercado

Usar `primary_market_code`, não `country_code`.

O campo representa o mercado principal no Radar, não nacionalidade.

No MVP:

- `BR`;
- `US`.

A UI pode combinar as dimensões sem redundância:

`reference + BR` → **Referência Brasil**

`reference + US` → **Referência EUA**

Se uma conta passar a atuar em múltiplos mercados no futuro, uma relação própria poderá ser adicionada sem remover `primary_market_code`.

### Auditoria de usuários

`created_by`:

- nullable;
- FK para `auth.users(id)`;
- `ON DELETE SET NULL`;
- preenchido por `auth.uid()` na criação humana;
- não atualizável pelo frontend.

`updated_by`:

- nullable;
- FK para `auth.users(id)`;
- `ON DELETE SET NULL`;
- representa o último editor humano;
- preenchido no banco quando campos humanos mudarem;
- não alterado por atualizações puramente operacionais.

### Campos humanos

- `instagram_username`;
- `primary_market_code`;
- `profile_group`;
- `niche`;
- `category`;
- `priority`;
- `tags`;
- `active`.

`instagram_username` é humano somente até a identidade ser resolvida. Depois de existir `instagram_external_id`, o frontend comum não pode alterá-lo.

### Campos operacionais/provider

- `instagram_external_id`;
- `display_name`;
- `profile_picture_url`;
- `followers_count`;
- `monitoring_status`;
- `last_collected_at`;
- `next_collection_at`;
- `last_collection_error`.

Esses campos não recebem privilégio UPDATE para o papel `authenticated` do frontend.

### Status

`active` = intenção do usuário.

`monitoring_status` = saúde operacional.

Estados do MVP:

- `pending`;
- `healthy`;
- `error`.

## Regra

Qualquer implementação futura do banco depende de autorização explícita.

Este documento não autoriza criação ou alteração de tabelas, constraints, triggers, policies, grants ou migrations.
