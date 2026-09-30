import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  AlertCircle,
  ChevronDown,
  CirclePause,
  CirclePlay,
  Pencil,
  Plus,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { StatePanel } from '../components/StatePanel'
import { profilesRepository } from '../features/profiles/repository'
import { normalizeInstagramUsername } from '../features/profiles/normalizeInstagram'
import type {
  CreateProfileInput,
  MonitoredProfile,
  ProfileGroup,
  ProfilePriority,
  UpdateProfileInput,
} from '../features/profiles/types'

const groupLabels: Record<ProfileGroup, string> = {
  own: 'Próprio',
  competitor: 'Concorrente',
  reference: 'Referência',
  trendsetter: 'Trendsetter',
}

const marketLabels: Record<string, string> = {
  BR: 'Brasil',
  US: 'Estados Unidos',
}

const priorityLabels: Record<ProfilePriority, string> = {
  1: 'Alta',
  2: 'Média',
  3: 'Baixa',
}

interface FormState {
  instagramInput: string
  profileGroup: ProfileGroup
  primaryMarketCode: string
  niche: string
  category: string
  priority: ProfilePriority
  tags: string
  active: boolean
}

const defaultForm: FormState = {
  instagramInput: '',
  profileGroup: 'reference',
  primaryMarketCode: 'BR',
  niche: '',
  category: '',
  priority: 2,
  tags: '',
  active: true,
}

function roleCanEdit(role: string | null) {
  return role === 'editor' || role === 'admin'
}

function toTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index)
}

function formatDate(value: string | null) {
  if (!value) return 'Aguardando primeira coleta'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatFollowers(value: number | null) {
  if (value === null) return 'Dados insuficientes'
  return new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(value)
}

function profileLabel(profile: MonitoredProfile) {
  const group = groupLabels[profile.profileGroup]
  const market = marketLabels[profile.primaryMarketCode] ?? profile.primaryMarketCode

  if (profile.profileGroup === 'reference') return `${group} ${market}`
  return group
}

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
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<MonitoredProfile | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadProfiles = useCallback(async () => {
    if (!role) {
      setProfiles([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await profilesRepository.listProfiles()
      setProfiles(data)
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
    setForm(defaultForm)
    setFormError(null)
    setEditorOpen(true)
  }

  function openEdit(profile: MonitoredProfile) {
    setEditing(profile)
    setForm({
      instagramInput: profile.instagramUsername,
      profileGroup: profile.profileGroup,
      primaryMarketCode: profile.primaryMarketCode,
      niche: profile.niche ?? '',
      category: profile.category ?? '',
      priority: profile.priority,
      tags: profile.tags.join(', '),
      active: profile.active,
    })
    setFormError(null)
    setEditorOpen(true)
  }

  function closeEditor() {
    if (saving) return
    setEditorOpen(false)
    setEditing(null)
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canEdit) return

    setSaving(true)
    setFormError(null)

    try {
      if (editing) {
        const input: UpdateProfileInput = {
          primaryMarketCode: form.primaryMarketCode,
          profileGroup: form.profileGroup,
          niche: form.niche,
          category: form.category,
          priority: form.priority,
          tags: toTags(form.tags),
          active: form.active,
        }

        if (!editing.instagramExternalId) {
          input.instagramUsername = normalizeInstagramUsername(form.instagramInput)
        }

        await profilesRepository.updateProfile(editing.id, input)
      } else {
        const input: CreateProfileInput = {
          instagramInput: form.instagramInput,
          primaryMarketCode: form.primaryMarketCode,
          profileGroup: form.profileGroup,
          niche: form.niche,
          category: form.category,
          priority: form.priority,
          tags: toTags(form.tags),
          active: form.active,
        }

        await profilesRepository.createProfile(input)
      }

      closeEditor()
      await loadProfiles()
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Não foi possível salvar o perfil.')
    } finally {
      setSaving(false)
    }
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
              description={
                canEdit
                  ? 'Cadastre o primeiro perfil público do Instagram para iniciar a fundação de monitoramento.'
                  : 'Ainda não existem perfis cadastrados.'
              }
            >
              {canEdit ? (
                <button className="secondary-button state-action" type="button" onClick={openCreate}>
                  <Plus size={14} />
                  Adicionar primeiro perfil
                </button>
              ) : null}
            </StatePanel>
          ) : filtered.length === 0 ? (
            <StatePanel
              state="empty"
              title="Nenhum resultado"
              description="Nenhum perfil corresponde aos filtros selecionados."
            />
          ) : (
            <section className="profiles-panel">
              <div className="profiles-panel-header">
                <div>
                  <span className="eyebrow">Monitoramento</span>
                  <h2>{filtered.length} {filtered.length === 1 ? 'perfil' : 'perfis'}</h2>
                </div>
                <span className="result-count">{role}</span>
              </div>

              <div className="profiles-table-wrap">
                <table className="profiles-table">
                  <thead>
                    <tr>
                      <th>Perfil</th>
                      <th>Grupo</th>
                      <th>Mercado</th>
                      <th>Seguidores</th>
                      <th>Status</th>
                      <th>Última coleta</th>
                      <th>Prioridade</th>
                      {canEdit ? <th aria-label="Ações" /> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((profile) => (
                      <tr key={profile.id}>
                        <td>
                          <div className="profile-identity">
                            {profile.profilePictureUrl ? (
                              <img src={profile.profilePictureUrl} alt="" />
                            ) : (
                              <div className="profile-avatar-fallback">
                                <UserRound size={16} />
                              </div>
                            )}
                            <div>
                              <strong>{profile.displayName || `@${profile.instagramUsername}`}</strong>
                              <span>@{profile.instagramUsername}</span>
                            </div>
                          </div>
                        </td>
                        <td>{profileLabel(profile)}</td>
                        <td>{marketLabels[profile.primaryMarketCode] ?? profile.primaryMarketCode}</td>
                        <td>{formatFollowers(profile.followersCount)}</td>
                        <td>
                          <div className="profile-status-cell">
                            {!profile.active ? (
                              <span className="profile-badge paused">Pausado</span>
                            ) : profile.monitoringStatus === 'pending' ? (
                              <span className="profile-badge pending">Aguardando primeira coleta</span>
                            ) : profile.monitoringStatus === 'error' ? (
                              <span className="profile-badge error">
                                <AlertCircle size={12} />
                                Erro
                              </span>
                            ) : (
                              <span className="profile-badge healthy">Saudável</span>
                            )}

                            {canEdit && profile.monitoringStatus === 'error' && profile.lastCollectionError ? (
                              <details className="profile-error-details">
                                <summary>Ver erro</summary>
                                <p>{profile.lastCollectionError}</p>
                              </details>
                            ) : null}
                          </div>
                        </td>
                        <td>{formatDate(profile.lastCollectedAt)}</td>
                        <td>{priorityLabels[profile.priority]}</td>
                        {canEdit ? (
                          <td>
                            <div className="row-actions">
                              <button className="icon-button" type="button" onClick={() => openEdit(profile)} title="Editar">
                                <Pencil size={14} />
                              </button>
                              <button
                                className="icon-button"
                                type="button"
                                onClick={() => void toggleActive(profile)}
                                title={profile.active ? 'Pausar' : 'Reativar'}
                              >
                                {profile.active ? <CirclePause size={15} /> : <CirclePlay size={15} />}
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {editorOpen ? (
        <div className="drawer-backdrop" role="presentation" onMouseDown={closeEditor}>
          <aside className="profile-drawer" onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="eyebrow">{editing ? 'Editar fonte' : 'Nova fonte'}</span>
                <h2>{editing ? 'Editar perfil' : 'Adicionar perfil'}</h2>
              </div>
              <button className="icon-button" type="button" onClick={closeEditor}>
                <X size={17} />
              </button>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Instagram URL ou @</span>
                <input
                  required
                  value={form.instagramInput}
                  disabled={Boolean(editing?.instagramExternalId)}
                  placeholder="@perfil ou instagram.com/perfil"
                  onChange={(event) => setForm({ ...form, instagramInput: event.target.value })}
                />
                {editing?.instagramExternalId ? (
                  <small>Username bloqueado após a identidade do Instagram ser resolvida.</small>
                ) : (
                  <small>Normalização local não confirma que o perfil existe.</small>
                )}
              </label>

              <div className="form-grid-two">
                <label className="form-field">
                  <span>Grupo</span>
                  <select
                    value={form.profileGroup}
                    onChange={(event) => setForm({ ...form, profileGroup: event.target.value as ProfileGroup })}
                  >
                    <option value="own">Próprio</option>
                    <option value="competitor">Concorrente</option>
                    <option value="reference">Referência</option>
                    <option value="trendsetter">Trendsetter</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Mercado</span>
                  <select
                    value={form.primaryMarketCode}
                    onChange={(event) => setForm({ ...form, primaryMarketCode: event.target.value })}
                  >
                    <option value="BR">Brasil</option>
                    <option value="US">Estados Unidos</option>
                  </select>
                </label>
              </div>

              <div className="form-grid-two">
                <label className="form-field">
                  <span>Nicho</span>
                  <input
                    value={form.niche}
                    onChange={(event) => setForm({ ...form, niche: event.target.value })}
                    placeholder="Ex.: gestão"
                  />
                </label>

                <label className="form-field">
                  <span>Categoria</span>
                  <input
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    placeholder="Ex.: empresarial"
                  />
                </label>
              </div>

              <label className="form-field">
                <span>Prioridade</span>
                <select
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: Number(event.target.value) as ProfilePriority })}
                >
                  <option value={1}>Alta</option>
                  <option value={2}>Média</option>
                  <option value={3}>Baixa</option>
                </select>
              </label>

              <label className="form-field">
                <span>Tags</span>
                <input
                  value={form.tags}
                  onChange={(event) => setForm({ ...form, tags: event.target.value })}
                  placeholder="conteúdo, vendas, gestão"
                />
                <small>Separe tags por vírgula.</small>
              </label>

              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm({ ...form, active: event.target.checked })}
                />
                <div>
                  <strong>Monitoramento ativo</strong>
                  <span>Desative para pausar sem apagar o histórico.</span>
                </div>
              </label>

              {formError ? <div className="form-error">{formError}</div> : null}

              <div className="drawer-actions">
                <button className="secondary-button" type="button" onClick={closeEditor} disabled={saving}>
                  Cancelar
                </button>
                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar perfil'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
