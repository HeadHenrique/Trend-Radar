# Trend Engine

## Status

Especificação de produto. O motor ainda não está implementado no banco ou em Edge Functions.

## Objetivo

Transformar sinais de posts e perfis em uma leitura executiva que responda:

- o que está surgindo;
- o que está acelerando;
- o que está saturando;
- o que chegou antes aos EUA;
- o que concorrentes estão adotando;
- onde existe oportunidade de conteúdo.

## Métricas

### Trend Score

Score composto. Deve agregar os componentes abaixo somente quando houver cobertura de dados suficiente. Pesos ainda não foram aprovados.

### Adoption Velocity

Velocidade de crescimento da adoção em uma janela de tempo definida.

### Creator Breadth

Amplitude da tendência entre criadores distintos. Evita confundir viralização isolada com adoção ampla.

### Relative Performance

Performance do conteúdo relacionado à tendência comparada ao baseline do próprio perfil ou grupo comparável.

### International Momentum

Força e aceleração do sinal fora do Brasil, especialmente nos Estados Unidos.

### Brazil Gap

Diferença entre maturidade internacional e adoção no Brasil.

## Estados de tendência

Os estados de produto previstos são:

- emergente;
- acelerando;
- estável;
- saturando.

Os thresholds ainda não foram aprovados e, portanto, não devem ser codificados como regra de negócio definitiva.

## Princípio de confiança

Se uma métrica não tiver amostra mínima, janela comparável ou cobertura suficiente, o resultado deve ser nulo e a UI deve mostrar `Dados insuficientes`.

## Anti-falsos positivos

O motor futuro deve considerar:

- número de criadores independentes;
- repetição temporal;
- concentração excessiva em um único perfil;
- comparação com baseline;
- duplicação/repost;
- diferenças de país;
- tamanho da amostra.
