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
- [x] confirmar estado de tabelas, migrations, policies, Auth e Edge Functions;
- [x] revisar segurança do repositório;
- [x] projetar modelo conceitual de `monitored_profiles`;
- [x] definir normalização de username;
- [x] definir estratégia de grupo;
- [x] definir estratégia de país;
- [x] definir estratégia de prioridade;
- [x] separar `active` de `monitoring_status`;
- [x] propor Auth/RLS;
- [x] propor contratos TypeScript;
- [x] documentar contrato futuro com n8n;
- [x] propor Provider Adapter;
- [x] escrever SQL draft não aplicado.

### Implementação

- [ ] aprovar nome/modelo de `monitored_profiles`;
- [ ] aprovar `profile_groups`;
- [ ] aprovar Auth e papéis internos;
- [ ] autorizar migration;
- [ ] autorizar policies/RLS;
- [ ] implementar Auth;
- [ ] implementar tela funcional de cadastro/listagem;
- [ ] conectar `/profiles` ao banco real.

**Bloqueio:** nenhum item de implementação acima deve começar sem autorização explícita.

## Fase 2 — Ingestão

- [ ] escolher provider inicial;
- [ ] definir credencial server-side;
- [ ] implementar `InstagramProviderAdapter`;
- [ ] implementar pipeline n8n;
- [ ] normalização de resposta;
- [ ] deduplicação;
- [ ] política de retries;
- [ ] observabilidade de coleta.

## Fase 3 — Posts e snapshots

- [ ] aprovar modelo de posts;
- [ ] aprovar profile snapshots;
- [ ] aprovar post snapshots;
- [ ] armazenar histórico temporal.

## Fase 4 — Intelligence

- [ ] Trend Score;
- [ ] Adoption Velocity;
- [ ] Creator Breadth;
- [ ] Relative Performance;
- [ ] International Momentum;
- [ ] Brazil Gap;
- [ ] oportunidades;
- [ ] alertas.

## Fase 5 — Operação

- [ ] monitoramento;
- [ ] auditoria avançada;
- [ ] custos;
- [ ] SLA;
- [ ] observabilidade;
- [ ] otimização de queries.
