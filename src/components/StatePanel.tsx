import { AlertTriangle, Database, LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

type StateKind = 'loading' | 'empty' | 'error' | 'success'

interface StatePanelProps {
  state: StateKind
  title?: string
  description?: string
  children?: ReactNode
}

const defaults: Record<StateKind, { title: string; description: string }> = {
  loading: {
    title: 'Carregando dados',
    description: 'Consultando a fonte disponível.',
  },
  empty: {
    title: 'Dados insuficientes',
    description: 'Ainda não existem dados suficientes para responder esta pergunta de negócio.',
  },
  error: {
    title: 'Não foi possível carregar',
    description: 'A fonte de dados retornou um erro.',
  },
  success: {
    title: 'Dados disponíveis',
    description: 'A consulta foi concluída com sucesso.',
  },
}

export function StatePanel({ state, title, description, children }: StatePanelProps) {
  const copy = defaults[state]
  const Icon = state === 'loading' ? LoaderCircle : state === 'error' ? AlertTriangle : Database

  return (
    <div className={`state-panel state-${state}`}>
      <div className="state-icon">
        <Icon size={18} className={state === 'loading' ? 'spin' : ''} />
      </div>
      <div>
        <strong>{title ?? copy.title}</strong>
        <p>{description ?? copy.description}</p>
        {children}
      </div>
    </div>
  )
}
