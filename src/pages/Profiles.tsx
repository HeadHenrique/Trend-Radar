import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Plus, Search } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { ProfileDetailDrawer } from '../components/ProfileDetailDrawer'
import { ProfileEditorDrawer } from '../components/ProfileEditorDrawer'
import { ProfileListTable } from '../components/ProfileListTable'
import { StatePanel } from '../components/StatePanel'
import { roleCanEdit } from '../features/profiles/presentation'
import { profilesRepository } from '../features/profiles/repository'
import type { MonitoredProfile, ProfileGroup, ProfilePriority } from '../features/profiles/types'

export default function Profiles() {
  const { role } = useAuth()
  const canEdit = roleCanEdit(role)
  const [profiles, setProfiles] = useState<MonitoredProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState<'all' | ProfileGroup>('all')
  const [market, setMarket] = useState('all')
  const [priority, setPriority] = useState<'all' | ProfilePriority>('all')
  const [activity, setActivity] = useState<'all' | 'active' | 'paused'>('all')
  const [selectedProfile, setSelectedProfile] = useState<MonitoredProfile | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<MonitoredProfile | null>(null)

  const loadProfiles = useCallback(async () => {
    if (!role) {
      setProfiles([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      setProfiles(await profilesRepository.listProfiles())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível carregar os perfis.')
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    void loadProfiles()
  }, [loadProfiles])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return profiles.filter((profile) => {
      const matchesSearch =
        !term ||
        profile.instagramUsername.includes(term) ||
        profile.displayName?.toLowerCase().includes(term)

      const matchesGroup = group === 'all' || profile.profileGroup === group
      const matchesMarket = market === 'all' || profile.primaryMarketCode === market
      const matchesPriority = priority === 'all' || profile.priority === priority
      const matchesActivity =
        activity === 'all' ||
        (activity === 'active' ? profile.active : !profile.active)

      return matchesSearch && matchesGroup && matchesMarket && matchesPriority && matchesActivity
    })
  }, [profiles, search, group, market, priority, activity])

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
      await loadProfiles()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível alterar o monitoramento.')
    }
  }

  const actions = canEdit ? (
    <button className="primary-button compact" type="button" onClick={openCreate}>
      <Plus size={15} />
      Adicionar perfil
    </button>
  ) : null

  return (
    <div className="page">
      <PageHeader
        eyebrow="Sources"
        title="Perfis Monitorados"
        description="Fontes reais que alimentam a inteligência do Radar, classificadas por papel estratégico e mercado."
        actions={actions}
      />

      {!role ? (
        <StatePanel
          state="error"
          title="Usuário sem papel de negócio"
          description="Sua sessão está autenticada, mas trend_radar_role não é viewer, editor ou admin."
        />
      ) : (
        <>
          <section className="profiles-toolbar">
            <label className="search-control">
              <Search size={15} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome ou @"
              />
            </label>

            <label className="toolbar-select">
              <span>Grupo</span>
              <select value={group} onChange={(event) => setGroup(event.target.value as typeof group)}>
                <option value="all">Todos</option>
                <option value="own">Próprio</option>
                <option value="competitor">Concorrente</option>
                <option value="reference">Referência</option>
                <option value="trendsetter">Trendsetter</option>
              </select>
              <ChevronDown size={13} />
            </label>

            <label className="toolbar-select">
              <span>Mercado</span>
              <select value={market} onChange={(event) => setMarket(event.target.value)}>
                <option value="all">Todos</option>
                <option value="BR">Brasil</option>
                <option value="US">Estados Unidos</option>
              </select>
              <ChevronDown size={13} />
            </label>

            <label className="toolbar-select">
              <span>Prioridade</span>
              <select
                value={priority}
                onChange={(event) => {
                  const value = event.target.value
                  setPriority(value === 'all' ? 'all' : Number(value) as ProfilePriority)
                }}
              >
                <option value="all">Todas</option>
                <option value="1">Alta</option>
                <option value="2">Média</option>
                <option value="3">Baixa</option>
              </select>
              <ChevronDown size={13} />
            </label>

            <label className="toolbar-select">
              <span>Status</span>
              <select value={activity} onChange={(event) => setActivity(event.target.value as typeof activity)}>
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="paused">Pausados</option>
              </select>
              <ChevronDown size={13} />
            </label>
          </section>

          {error ? (
            <StatePanel state="error" title="Erro ao carregar perfis" description={error} />
          ) : loading ? (
            <StatePanel state="loading" />
          ) : profiles.length === 0 ? (
            <StatePanel
              state="empty"
              title="Nenhum perfil monitorado"
              description={canEdit ? 'Cadastre o primeiro perfil público do Instagram para iniciar o monitoramento.' : 'Ainda não existem perfis cadastrados.'}
            >
              {canEdit ? (
                <button className="secondary-button state-action" type="button" onClick={openCreate}>
                  <Plus size={14} />
                  Adicionar primeiro perfil
                </button>
              ) : null}
            </StatePanel>
          ) : filtered.length === 0 ? (
            <StatePanel state="empty" title="Nenhum resultado" description="Nenhum perfil corresponde aos filtros selecionados." />
          ) : (
            <section className="profiles-panel">
              <div className="profiles-panel-header">
                <div>
                  <span className="eyebrow">Monitoramento</span>
                  <h2>{filtered.length} {filtered.length === 1 ? 'perfil' : 'perfis'}</h2>
                </div>
                <span className="result-count">{role}</span>
              </div>

              <ProfileListTable
                profiles={filtered}
                canEdit={canEdit}
                onOpenDetails={setSelectedProfile}
                onEdit={openEdit}
                onToggleActive={(profile) => void toggleActive(profile)}
              />
            </section>
          )}
        </>
      )}

      <ProfileDetailDrawer profile={selectedProfile} onClose={() => setSelectedProfile(null)} />

      <ProfileEditorDrawer
        open={editorOpen}
        profile={editing}
        onClose={() => {
          setEditorOpen(false)
          setEditing(null)
        }}
        onSaved={loadProfiles}
      />
    </div>
  )
}
