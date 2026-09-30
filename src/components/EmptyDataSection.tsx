import { StatePanel } from './StatePanel'

interface EmptyDataSectionProps {
  title: string
  description: string
}

export function EmptyDataSection({ title, description }: EmptyDataSectionProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Leitura de negócio</span>
          <h2>{title}</h2>
        </div>
      </div>
      <StatePanel state="empty" description={description} />
    </section>
  )
}
