# Roadmap

## Fase 1 — Frontend foundation

- [x] estrutura React/TypeScript/Vite;
- [x] rotas principais;
- [x] visual executivo;
- [x] estados loading/empty/error/success;
- [x] filtros;
- [x] Trend Card;
- [x] Trend Detail;
- [x] conexão Supabase;
- [x] documentação;
- [x] CI para typecheck/build.

## Fase 1.5 — Fundação de Perfis Monitorados

### Projeto e validação

- [x] reinspecionar Supabase real;
- [x] projetar `monitored_profiles`;
- [x] definir normalização de username;
- [x] separar papel estratégico de geografia;
- [x] reduzir grupos para `own/competitor/reference/trendsetter`;
- [x] escolher `TEXT + CHECK` para `profile_group` no MVP;
- [x] substituir `country_code` por `primary_market_code`;
- [x] definir estratégia futura para multi-mercado sem implementá-la;
- [x] alterar proposta de `created_by` para nullable + `ON DELETE SET NULL`;
- [x] aprovar conceitualmente `updated_by` nullable + `ON DELETE SET NULL`;
- [x] separar campos humanos de campos operacionais/provider;
- [x] definir bloqueio de mudança de username após resolução da identidade;
- [x] manter `active` separado de `monitoring_status`;
- [x] manter status `pending/healthy/error`;
- [x] revisar RLS e privilégios por coluna;
- [x] atualizar SQL draft não aplicado.

### Gate de aprovação antes da implementação

- [ ] aprovar nome `monitored_profiles`;
- [ ] aprovar `primary_market_code`;
- [ ] aprovar `profile_group TEXT + CHECK`;
- [ ] aprovar valores `own/competitor/reference/trendsetter`;
- [ ] aprovar `created_by nullable + ON DELETE SET NULL`;
- [ ] aprovar `updated_by nullable + ON DELETE SET NULL`;
- [ ] aprovar trigger de auditoria humana;
- [ ] aprovar proteção de username após resolução;
- [ ] aprovar status `pending/healthy/error`;
- [ ] aprovar papéis `viewer/editor/admin`;
- [ ] aprovar grants de coluna;
- [ ] autorizar migration;
- [ ] autorizar RLS/policies/triggers.

**Bloqueio:** nenhuma implementação de banco começa sem aprovação explícita.

## Fase 2 — Auth e Perfis

Somente após autorização:

- [ ] implementar Supabase Auth interno;
- [ ] definir política de convite/signup;
- [ ] aplicar schema aprovado;
- [ ] aplicar RLS e grants aprovados;
- [ ] implementar cadastro/listagem de perfis;
- [ ] conectar `/profiles` ao banco real.

## Fase 3 — Ingestão

- [ ] escolher provider inicial;
- [ ] definir credencial server-side;
- [ ] implementar `InstagramProviderAdapter`;
- [ ] implementar pipeline n8n;
- [ ] normalização de resposta;
- [ ] retries;
- [ ] observabilidade.

## Fase 4 — Posts e snapshots

- [ ] aprovar modelo de posts;
- [ ] aprovar profile snapshots;
- [ ] aprovar post snapshots;
- [ ] armazenar histórico temporal.

## Fase 5 — Intelligence

- [ ] Trend Score;
- [ ] Adoption Velocity;
- [ ] Creator Breadth;
- [ ] Relative Performance;
- [ ] International Momentum;
- [ ] Brazil Gap;
- [ ] oportunidades;
- [ ] alertas.

## Fase 6 — Operação

- [ ] auditoria avançada;
- [ ] custos;
- [ ] SLA;
- [ ] observabilidade;
- [ ] otimização de queries.
