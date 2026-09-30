import { EmptyDataSection } from '../components/EmptyDataSection'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'

export default function Dashboard() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Visão executiva"
        title="Radar de tendências"
        description="O que está surgindo, acelerando, saturando e abrindo espaço para conteúdo agora."
      />

      <section className="metric-grid">
        <MetricCard
          eyebrow="Novas"
          title="Tendências emergentes"
          value={null}
          question="Quais sinais surgiram recentemente e merecem observação?"
        />
        <MetricCard
          eyebrow="Velocidade"
          title="Tendências acelerando"
          value={null}
          question="Quais tendências estão ganhando adoção mais rápido?"
        />
        <MetricCard
          eyebrow="Gap"
          title="Oportunidades"
          value={null}
          question="Onde existe espaço entre momentum internacional e adoção no Brasil?"
        />
        <MetricCard
          eyebrow="Maturidade"
          title="Tendências saturando"
          value={null}
          question="Quais movimentos já perderam vantagem de pioneirismo?"
        />
      </section>

      <div className="two-column">
        <EmptyDataSection
          title="Principais movimentos dos concorrentes"
          description="Ainda não existem dados de concorrentes suficientes para identificar movimentos relevantes."
        />
        <EmptyDataSection
          title="Principais movimentos dos perfis americanos"
          description="Ainda não existem dados de perfis americanos suficientes para comparar adoção e performance."
        />
      </div>
    </div>
  )
}
