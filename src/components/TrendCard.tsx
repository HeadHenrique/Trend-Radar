import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Trend } from '../types'

interface TrendCardProps {
  trend: Trend
}

function metric(value: number | null) {
  return value === null ? 'Dados insuficientes' : value.toLocaleString('pt-BR')
}

export function TrendCard({ trend }: TrendCardProps) {
  return (
    <article className="trend-card">
      <div className="trend-card-header">
        <div>
          <span className="eyebrow">Tendência</span>
          <h3>{trend.name}</h3>
        </div>
        <Link to={`/trends/${trend.id}`} aria-label={`Abrir ${trend.name}`}>
          <ArrowUpRight size={18} />
        </Link>
      </div>

      <div className="trend-score">
        <span>Trend Score</span>
        <strong>{metric(trend.trendScore)}</strong>
      </div>

      <dl className="trend-metrics">
        <div><dt>Adoption Velocity</dt><dd>{metric(trend.adoptionVelocity)}</dd></div>
        <div><dt>Creator Breadth</dt><dd>{metric(trend.creatorBreadth)}</dd></div>
        <div><dt>Relative Performance</dt><dd>{metric(trend.relativePerformance)}</dd></div>
        <div><dt>International Momentum</dt><dd>{metric(trend.internationalMomentum)}</dd></div>
        <div><dt>Brazil Gap</dt><dd>{metric(trend.brazilGap)}</dd></div>
        <div><dt>Concorrentes adotando</dt><dd>{metric(trend.competitorsAdopting)}</dd></div>
      </dl>

      <div className="trend-meta">
        <span>Primeira detecção: {trend.firstDetectedAt ?? 'Dados insuficientes'}</span>
        <span>Atualização: {trend.updatedAt ?? 'Dados insuficientes'}</span>
        <span>Status: {trend.status ?? 'Dados insuficientes'}</span>
      </div>
    </article>
  )
}
