# Architecture

## Status

Frontend implementado. Nenhuma alteração foi aplicada ao banco Supabase.

## Stack

- React
- TypeScript
- Vite
- React Router
- Supabase JS
- CSS próprio, sem biblioteca de gráficos decorativos

## Camadas

1. **Presentation**
   - páginas em `src/pages`
   - componentes em `src/components`
2. **Application**
   - rotas em `src/App.tsx`
   - estados de loading, empty, error e success
3. **Data access**
   - cliente Supabase em `src/lib/supabase.ts`
   - health check em `src/hooks/useSupabaseHealth.ts`

## Princípio de dados

O frontend não estima valores ausentes. Quando o backend não fornece uma métrica, a interface mostra `Dados insuficientes`.

## Supabase

Projeto: `zqwlyqnwcpddmknjnune`.

Na inspeção realizada em 30/09/2026, o schema `public` não continha tabelas. Por isso, não existem queries de negócio apontando para tabelas hipotéticas.

## Fluxo futuro

Instagram provider → processamento/orquestração → Supabase → frontend.

n8n ou outro orquestrador pode coletar/enriquecer dados e gravá-los no Supabase, mas isso é responsabilidade do backend e não está implementado neste repositório.
