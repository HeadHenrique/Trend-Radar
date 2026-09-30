import { EmptyDataSection } from '../components/EmptyDataSection'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'

export default function Usa() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="International radar"
        title="Estados Unidos"
        description="Observe sinais antecipados nos EUA e compare o estágio de adoção com o Brasil."
      />
      <section className="metric-grid metric-grid-three">
        <MetricCard eyebrow="Momentum" title="Tendências ganhando força" value={null} question="Quais sinais estão acelerando nos EUA?" />
        <MetricCard eyebrow="Brazil Gap" title="Ainda pouco adotadas no Brasil" value={null} question="Onde existe diferença relevante de adoção?" />
        <MetricCard eyebrow="Creators" title="Criadores participantes" value={null} question="Quantos criadores relevantes sustentam o sinal?" />
      </section>
      <EmptyDataSection
        title="Sinais internacionais"
        description="Ainda não há perfis ou posts americanos suficientes para calcular momentum internacional."
      />
    </div>
  )
}
