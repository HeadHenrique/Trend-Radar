import { EmptyDataSection } from '../components/EmptyDataSection'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'

export default function Competitors() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Competitive intelligence"
        title="Concorrentes"
        description="Acompanhe adoção de tendências, formatos e movimentos que alteram o cenário competitivo."
      />
      <section className="metric-grid metric-grid-three">
        <MetricCard eyebrow="Adoção" title="Movimentos recentes" value={null} question="O que os concorrentes começaram a usar?" />
        <MetricCard eyebrow="Velocidade" title="Adoção acelerada" value={null} question="Quais sinais ganharam adesão rapidamente?" />
        <MetricCard eyebrow="Overlap" title="Movimentos compartilhados" value={null} question="Quais tendências aparecem em mais de um concorrente?" />
      </section>
      <EmptyDataSection
        title="Atividade dos concorrentes"
        description="Nenhum dataset de concorrentes está disponível para gerar uma leitura confiável."
      />
    </div>
  )
}
