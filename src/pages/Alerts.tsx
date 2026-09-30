import { EmptyDataSection } from '../components/EmptyDataSection'
import { PageHeader } from '../components/PageHeader'

export default function Alerts() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Monitoring"
        title="Alertas"
        description="Eventos relevantes que exigem atenção: aceleração, entrada de concorrentes, saturação e gap internacional."
      />
      <EmptyDataSection
        title="Alertas ativos"
        description="Nenhum evento de tendência foi registrado para gerar alertas."
      />
    </div>
  )
}
