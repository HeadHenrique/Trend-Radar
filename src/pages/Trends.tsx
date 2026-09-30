import { useState } from 'react'
import { FilterBar } from '../components/FilterBar'
import { PageHeader } from '../components/PageHeader'
import { StatePanel } from '../components/StatePanel'
import type { TrendFilters } from '../types'

const initialFilters: TrendFilters = {
  country: 'Todos',
  period: '30 dias',
  profileGroup: 'Todos os grupos',
  category: 'Todas as categorias',
  format: 'Todos os formatos',
  score: 'Qualquer score',
  status: 'Todos',
}

export default function Trends() {
  const [filters, setFilters] = useState(initialFilters)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Trend intelligence"
        title="Tendências"
        description="Compare sinais, velocidade de adoção, amplitude entre criadores e gap Brasil × EUA."
      />

      <FilterBar value={filters} onChange={setFilters} />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Resultados</span>
            <h2>Tendências detectadas</h2>
          </div>
          <span className="result-count">0 resultados</span>
        </div>
        <StatePanel
          state="empty"
          title="Nenhuma tendência disponível"
          description="O Supabase ainda não possui registros de tendência para aplicar os filtros selecionados."
        />
      </section>
    </div>
  )
}
