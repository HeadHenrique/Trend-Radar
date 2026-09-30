# API Spec

## Estado atual

O frontend usa o cliente oficial `@supabase/supabase-js` conectado ao projeto `zqwlyqnwcpddmknjnune`.

Não existem tabelas públicas de negócio no momento, então não há endpoints REST de negócio consumidos pelo frontend.

## Health check

A aplicação valida a conectividade através da camada Auth do Supabase com `getSession()`. A presença ou ausência de sessão não interfere nas telas públicas atuais; o objetivo é detectar indisponibilidade de conexão.

## Chaves

No browser deve ser usada apenas uma **publishable key**. Nunca utilizar `service_role` ou secret key no frontend.

## Contratos futuros

Quando o modelo real existir, cada recurso deve documentar:

- origem/tabela ou view;
- campos retornados;
- filtros suportados;
- paginação;
- ordenação;
- RLS/política de acesso;
- tratamento de valores nulos;
- semântica de score.

## Requisitos de erro

- conexão em andamento → `loading`;
- resposta válida sem registros → `empty`;
- erro de rede/permissão → `error`;
- dados válidos → `success`.

## Observação Supabase 2026

Novas tabelas podem exigir `GRANT` explícito para ficarem disponíveis no Data API. Isso é separado de RLS e deve ser tratado no backend quando houver autorização para criar o schema.
