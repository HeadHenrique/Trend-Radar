import { EmptyDataSection } from '../components/EmptyDataSection'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'

export default function Opportunities() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Action layer"
        title="Oportunidades"
        description="Transforme sinais em decisões de conteúdo quando houver evidência suficiente."
      />
      <section className="metric-grid metric-grid-three">
        <MetricCard eyebrow="Gap" title="Brasil × EUA" value={null} question="Quais tendências têm espaço de arbitragem?" />
        <MetricCard eyebrow="Timing" title="Janelas abertas" value={null} question="Quais sinais ainda estão cedo o suficiente?" />
        <MetricCard eyebrow="Fit" title="Aderência competitiva" value={null} question="Onde existe oportunidade sem saturação concorrente?" />
      </section>
      <EmptyDataSection
        title="Oportunidades priorizadas"
        description="O sistema só recomenda oportunidades quando os sinais necessários estiverem disponíveis."
      />
    </div>
  )
}
