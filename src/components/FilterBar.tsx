import { SlidersHorizontal } from 'lucide-react'
import type { TrendFilters } from '../types'

interface FilterBarProps {
  value: TrendFilters
  onChange: (value: TrendFilters) => void
}

const options = {
  country: ['Todos', 'Brasil', 'Estados Unidos'],
  period: ['7 dias', '30 dias', '90 dias'],
  profileGroup: ['Todos os grupos'],
  category: ['Todas as categorias'],
  format: ['Todos os formatos'],
  score: ['Qualquer score', '80–100', '60–79', '0–59'],
  status: ['Todos', 'Emergente', 'Acelerando', 'Saturando', 'Estável'],
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-title">
        <SlidersHorizontal size={16} />
        Filtros
      </div>
      {Object.entries(options).map(([key, values]) => (
        <label key={key} className="filter-field">
          <span>{labelFor(key)}</span>
          <select
            value={value[key as keyof TrendFilters]}
            onChange={(event) =>
              onChange({ ...value, [key]: event.target.value })
            }
          >
            {values.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      ))}
    </div>
  )
}

function labelFor(key: string) {
  return (
    {
      country: 'País',
      period: 'Período',
      profileGroup: 'Grupo',
      category: 'Categoria',
      format: 'Formato',
      score: 'Score',
      status: 'Status',
    }[key] ?? key
  )
}
