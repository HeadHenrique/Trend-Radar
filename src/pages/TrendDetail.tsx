import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatePanel } from '../components/StatePanel'

const sections = [
  ['Timeline', 'Evolução temporal da tendência.'],
  ['Crescimento', 'Mudança de volume e velocidade ao longo do período.'],
  ['Adoção por país', 'Comparação entre Brasil e Estados Unidos.'],
  ['Perfis participantes', 'Criadores e perfis que adotaram o sinal.'],
  ['Posts relacionados', 'Conteúdos associados à tendência.'],
  ['Formatos', 'Formatos de publicação usados na tendência.'],
  ['Hooks', 'Aberturas e padrões criativos associados.'],
  ['Concorrentes', 'Concorrentes que já adotaram o movimento.'],
  ['Score detalhado', 'Componentes que formam o Trend Score.'],
  ['Oportunidade', 'Leitura executiva de espaço e timing.'],
]

export default function TrendDetail() {
  const { id } = useParams()

  return (
    <div className="page">
      <PageHeader
        eyebrow="Trend detail"
        title="Detalhe da tendência"
        description={id ? `ID solicitado: ${id}` : 'Análise completa da tendência selecionada.'}
      />

      <StatePanel
        state="empty"
        title="Tendência não disponível"
        description="Não existe um registro real correspondente no Supabase. Nenhuma métrica foi estimada."
      />

      <div className="detail-grid">
        {sections.map(([title, description]) => (
          <section className="detail-card" key={title}>
            <span className="eyebrow">{title}</span>
            <h3>Dados insuficientes</h3>
            <p>{description}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
