# Security

## Princípios

1. não expor secret key ou `service_role` no frontend;
2. utilizar publishable key no browser;
3. manter RLS nas tabelas expostas ao Data API;
4. tratar GRANT e RLS como camadas separadas;
5. não usar metadata editável pelo usuário para autorização;
6. evitar `SECURITY DEFINER` como atalho de permissão;
7. não armazenar credenciais no repositório.

## Estado atual

O frontend usa somente uma publishable key. Nenhuma secret key foi adicionada.

O schema `public` estava vazio na inspeção de 30/09/2026; nenhuma política RLS foi criada ou alterada.

## Quando o backend for criado

Cada tabela exposta deve passar por revisão de:

- GRANT;
- RLS;
- políticas SELECT/INSERT/UPDATE/DELETE;
- ownership;
- exposição de PII;
- retenção de dados;
- logs;
- rate limiting quando aplicável.

## Dados do Instagram

Antes de produção, validar termos do provider utilizado, permissões de coleta, finalidade de tratamento e políticas de armazenamento.
