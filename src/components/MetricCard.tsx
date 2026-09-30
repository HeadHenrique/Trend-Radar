interface MetricCardProps {
  eyebrow: string
  title: string
  value?: number | string | null
  question: string
}

export function MetricCard({ eyebrow, title, value, question }: MetricCardProps) {
  const hasValue = value !== null && value !== undefined && value !== ''

  return (
    <article className="metric-card">
      <div className="metric-card-top">
        <span className="eyebrow">{eyebrow}</span>
        <span className={hasValue ? 'status-dot is-live' : 'status-dot'} />
      </div>
      <h3>{title}</h3>
      <div className={hasValue ? 'metric-value' : 'metric-value insufficient'}>
        {hasValue ? value : 'Dados insuficientes'}
      </div>
      <p>{question}</p>
    </article>
  )
}
