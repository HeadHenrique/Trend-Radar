import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { ProfileDetailDrawer } from '../components/ProfileDetailDrawer'
import { ProfileEditorDrawer } from '../components/ProfileEditorDrawer'
import { ProfileListTable } from '../components/ProfileListTable'
import { StatePanel } from '../components/StatePanel'
import { roleCanEdit } from '../features/profiles/presentation'
import { profilesRepository } from '../features/profiles/repository'
import type { MonitoredProfile } from '../features/profiles/types'

export default function Competitors() {
  const { role } = useAuth()
  const canEdit = roleCanEdit(role)
  const [competitors, setCompetitors] = useState<MonitoredProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<MonitoredProfile | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<MonitoredProfile | null>(null)

  const loadCompetitors = useCallback(async () => {
    if (!role) {
      setCompetitors([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      setCompetitors(await profilesRepository.listProfiles({ profileGroup: 'competitor' }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível carregar os concorrentes.')
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    void loadCompetitors()
  }, [loadCompetitors])

  function openCreate() {
    setEditing(null)
    setEditorOpen(true)
  }

  function openEdit(profile: MonitoredProfile) {
    setEditing(profile)
    setEditorOpen(true)
  }

  async function toggleActive(profile: MonitoredProfile) {
    if (!canEdit) return

    setError(null)
    try {
      await profilesRepository.setProfileActive(profile.id, !profile.active)
      await loadCompetitors()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível alterar o monitoramento.')
    }
  }

  const actions = canEdit ? (
    <button className="primary-button compact" type="button" onClick={openCreate}>
      <Plus size={15} />
      Adicionar concorrente
    </button>
  ) : null

  return (
    <div className="page">
      <PageHeader
        eyebrow="Competitive intelligence"
        title="Concorrentes"
        description="Acompanhe adoção de tendências, formatos e movimentos que alteram o cenário competitivo."
        actions={actions}
      />

      <section className="metric-grid metric-grid-three">
        <MetricCard eyebrow="Adoção" title="Movimentos recentes" value={null} question="O que os concorrentes começaram a usar?" />
        <MetricCard eyebrow="Velocidade" title="Adoção acelerada" value={null} question="Quais sinais ganharam adesão rapidamente?" />
        <MetricCard eyebrow="Overlap" title="Movimentos compartilhados" value={null} question="Quais tendências aparecem em mais de um concorrente?" />
      </section>

      {!loading && !error ? (
        <section className="panel competitor-intelligence-state">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Inteligência competitiva</span>
              <h2>Leitura de adoção</h2>
            </div>
          </div>
          <StatePanel
            state="empty"
            title={competitors.length === 0 ? 'Cadastre concorrentes para começar' : 'Histórico em formação'}
            description={
              competitors.length === 0
                ? 'Adicione concorrentes para começar a acompanhar movimentos e tendências.'
                : 'Concorrentes sendo monitorados. A inteligência de adoção será habilitada quando houver histórico suficiente.'
            }
          />
        </section>
      ) : null}

      <section className="profiles-panel competitor-list-panel">
        <div className="profiles-panel-header">
          <div>
            <span className="eyebrow">Monitoramento</span>
            <h2>Concorrentes monitorados</h2>
          </div>
          {!loading && !error ? <span className="result-count">{competitors.length}</span> : null}
        </div>

        <div className="competitor-list-body">
          {error ? (
            <StatePanel state="error" title="Erro ao carregar concorrentes" description={error} />
          ) : loading ? (
            <StatePanel state="loading" />
          ) : competitors.length === 0 ? (
            <StatePanel
              state="empty"
              title="Nenhum concorrente cadastrado"
              description="Adicione concorrentes para começar a acompanhar movimentos e tendências."
            >
              {canEdit ? (
                <button className="secondary-button state-action" type="button" onClick={openCreate}>
                  <Plus size={14} />
                  Adicionar concorrente
                </button>
              ) : null}
            </StatePanel>
          ) : (
            <ProfileListTable
              profiles={competitors}
              canEdit={canEdit}
              showGroup={false}
              onOpenDetails={setSelectedProfile}
              onEdit={openEdit}
              onToggleActive={(profile) => void toggleActive(profile)}
            />
          )}
        </div>
      </section>

      <ProfileDetailDrawer profile={selectedProfile} onClose={() => setSelectedProfile(null)} />

      <ProfileEditorDrawer
        open={editorOpen}
        profile={editing}
        lockedGroup="competitor"
        defaultGroup="competitor"
        onClose={() => {
          setEditorOpen(false)
          setEditing(null)
        }}
        onSaved={loadCompetitors}
      />
    </div>
  )
}
