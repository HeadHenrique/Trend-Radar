import { EmptyDataSection } from '../components/EmptyDataSection'
import { PageHeader } from '../components/PageHeader'

export default function Posts() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Content evidence"
        title="Posts"
        description="Evidências de conteúdo usadas para medir performance relativa, formatos, hooks e adoção."
      />
      <EmptyDataSection
        title="Posts analisados"
        description="Nenhum post real foi disponibilizado pelo backend para análise."
      />
    </div>
  )
}
