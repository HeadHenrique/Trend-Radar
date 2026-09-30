import { CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useSupabaseHealth } from '../hooks/useSupabaseHealth'
import { supabaseProjectRef } from '../lib/supabase'

export default function Settings() {
  const health = useSupabaseHealth()
  const Icon =
    health.status === 'success'
      ? CheckCircle2
      : health.status === 'error'
        ? CircleAlert
        : LoaderCircle

  return (
    <div className="page">
      <PageHeader
        eyebrow="System"
        title="Configurações"
        description="Estado da conexão e princípios operacionais do frontend."
      />

      <section className="settings-grid">
        <article className="setting-card">
          <span className="eyebrow">Supabase</span>
          <div className="setting-status">
            <Icon size={20} className={health.status === 'loading' ? 'spin' : ''} />
            <strong>{health.message}</strong>
          </div>
          <dl>
            <div><dt>Projeto</dt><dd>Trend Radar</dd></div>
            <div><dt>Project ref</dt><dd>{supabaseProjectRef}</dd></div>
            <div><dt>Cliente</dt><dd>Publishable key</dd></div>
          </dl>
        </article>

        <article className="setting-card">
          <span className="eyebrow">Política de dados</span>
          <h3>Sem dados inventados</h3>
          <p>
            Métricas ausentes permanecem como “Dados insuficientes”. O frontend não cria registros
            permanentes nem altera a arquitetura do banco.
          </p>
        </article>
      </section>
    </div>
  )
}
