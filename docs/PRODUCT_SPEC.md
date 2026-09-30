# Product Spec

## Produto

Caliber Trend Radar é uma plataforma executiva de Instagram Social Intelligence.

## Usuário principal

Lideranças de marketing, conteúdo e estratégia que precisam decidir rapidamente onde prestar atenção e onde agir.

## Jobs to be done

1. identificar tendências emergentes;
2. detectar tendências acelerando;
3. reconhecer saturação;
4. comparar EUA e Brasil;
5. acompanhar concorrentes;
6. transformar sinais em oportunidades de conteúdo.

## Rotas

- `/dashboard`
- `/trends`
- `/trends/:id`
- `/competitors`
- `/usa`
- `/profiles`
- `/posts`
- `/opportunities`
- `/alerts`
- `/settings`

## Dashboard

Deve responder rapidamente:

- quais tendências são novas;
- quais estão acelerando;
- quais representam oportunidade;
- quais estão saturando;
- quais movimentos dos concorrentes importam;
- quais sinais americanos merecem atenção.

## Trend Card

Contrato visual preparado para:

- nome;
- Trend Score;
- Adoption Velocity;
- Creator Breadth;
- Relative Performance;
- International Momentum;
- Brazil Gap;
- concorrentes adotando;
- primeira detecção;
- última atualização;
- status.

## Trend Detail

Deve comportar:

- timeline;
- crescimento;
- adoção por país;
- perfis participantes;
- posts relacionados;
- formatos;
- hooks;
- concorrentes;
- score detalhado;
- oportunidade.

## Regra de produto

Nenhuma decisão executiva deve se apoiar em dado inventado. Falta de evidência é apresentada explicitamente como `Dados insuficientes`.
