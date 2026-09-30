import { EmptyDataSection } from '../components/EmptyDataSection'
import { PageHeader } from '../components/PageHeader'

export default function Profiles() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Sources"
        title="Perfis monitorados"
        description="Fontes que sustentam a leitura de tendência, separadas por país e grupo estratégico."
      />
      <EmptyDataSection
        title="Perfis"
        description="Nenhum perfil real está cadastrado no banco para exibição."
      />
    </div>
  )
}
