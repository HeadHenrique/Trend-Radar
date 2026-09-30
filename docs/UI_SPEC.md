# UI Spec

## Direção visual

Executiva, premium, minimalista e rápida de ler.

## Identidade

- base escura;
- roxo Caliber como cor de destaque;
- baixa densidade visual;
- bordas discretas;
- tipografia neutra;
- sem gráficos decorativos.

## Hierarquia

1. pergunta de negócio;
2. valor ou estado de insuficiência;
3. contexto curto;
4. evidência detalhada apenas quando necessário.

## Componentes

### Metric Card

Cada card responde uma pergunta concreta. Valores ausentes mostram `Dados insuficientes`.

### Trend Card

Componente preparado para o contrato completo de tendência. Não é renderizado com objetos falsos.

### Filter Bar

Filtros por:

- país;
- período;
- grupo de perfil;
- categoria;
- formato;
- score;
- status.

### State Panel

Estados obrigatórios:

- loading;
- empty;
- error;
- success.

## Responsividade

- desktop é prioridade;
- tablet reduz colunas;
- mobile converte grids em uma coluna;
- navegação permanece acessível.

## Acessibilidade

- contraste alto;
- links e controles sem depender apenas de cor;
- labels nos filtros;
- estrutura semântica de headings.
