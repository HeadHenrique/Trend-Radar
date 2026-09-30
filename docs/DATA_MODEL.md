# Data Model

## Estado observado

Em 30/09/2026 o schema `public` do projeto Supabase `zqwlyqnwcpddmknjnune` não possui tabelas.

Nenhum schema foi criado ou alterado durante a implementação do frontend.

## Consequência

O frontend não assume nomes de tabelas, colunas ou relacionamentos inexistentes. Todas as telas de negócio permanecem em estado vazio até que um contrato real de dados seja aprovado.

## Contrato lógico necessário

Para cumprir integralmente o produto, o backend precisará fornecer dados equivalentes aos conceitos abaixo. Estes nomes são **conceituais, não tabelas existentes**:

- perfil monitorado;
- post coletado;
- tendência;
- observação temporal de tendência;
- participação de perfil em tendência;
- concorrente;
- oportunidade;
- alerta.

## Campos mínimos por tendência

- identificador;
- nome;
- Trend Score;
- Adoption Velocity;
- Creator Breadth;
- Relative Performance;
- International Momentum;
- Brazil Gap;
- quantidade de concorrentes adotando;
- primeira detecção;
- última atualização;
- status.

## Regra

Qualquer implementação futura do banco deve ser revisada separadamente. Este documento não autoriza criação, exclusão ou alteração de tabelas.
