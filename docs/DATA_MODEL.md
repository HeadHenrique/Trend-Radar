# Data Model

## Estado real

Em 30/09/2026 foi aplicada a migration `20260930195835_create_monitored_profiles_foundation`.

Tabela de negócio existente:

`public.monitored_profiles`

## monitored_profiles

Principais constraints:

- username lowercase;
- username com caracteres locais permitidos;
- username unique;
- `primary_market_code` com dois caracteres uppercase;
- `profile_group` limitado a `own/competitor/reference/trendsetter`;
- prioridade entre 1 e 3;
- followers não negativo;
- `monitoring_status` em `pending/healthy/error`;
- erro de coleta limitado a 2000 caracteres.

FKs:

- `created_by → auth.users(id) ON DELETE SET NULL`;
- `updated_by → auth.users(id) ON DELETE SET NULL`.

Índices:

- external ID unique parcial;
- mercado;
- grupo;
- created_by;
- updated_by;
- tags GIN;
- fila `priority + next_collection_at` para perfis ativos.

## Separação de responsabilidade

Campos humanos são editáveis pelo frontend conforme papel.

Campos operacionais/provider são somente leitura para o frontend e serão usados por backend futuro.

Nenhuma tabela adicional de negócio foi criada nesta etapa.
