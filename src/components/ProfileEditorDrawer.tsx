import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { profilesRepository } from '../features/profiles/repository'
import { normalizeInstagramUsername } from '../features/profiles/normalizeInstagram'
import type {
  CreateProfileInput,
  MonitoredProfile,
  ProfileGroup,
  ProfilePriority,
  UpdateProfileInput,
} from '../features/profiles/types'

interface ProfileEditorDrawerProps {
  open: boolean
  profile: MonitoredProfile | null
  lockedGroup?: ProfileGroup
  defaultGroup?: ProfileGroup
  onClose: () => void
  onSaved: () => void | Promise<void>
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

function toTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index)
}

function emptyForm(group: ProfileGroup): FormState {
  return {
    instagramInput: '',
    profileGroup: group,
    primaryMarketCode: 'BR',
    niche: '',
    category: '',
    priority: 2,
    tags: '',
    active: true,
  }
}

export function ProfileEditorDrawer({
  open,
  profile,
  lockedGroup,
  defaultGroup = 'reference',
  onClose,
  onSaved,
}: ProfileEditorDrawerProps) {
  const [form, setForm] = useState<FormState>(() => emptyForm(lockedGroup ?? defaultGroup))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    if (profile) {
      setForm({
        instagramInput: profile.instagramUsername,
        profileGroup: lockedGroup ?? profile.profileGroup,
        primaryMarketCode: profile.primaryMarketCode,
        niche: profile.niche ?? '',
        category: profile.category ?? '',
        priority: profile.priority,
        tags: profile.tags.join(', '),
        active: profile.active,
      })
    } else {
      setForm(emptyForm(lockedGroup ?? defaultGroup))
    }
    setFormError(null)
  }, [open, profile, lockedGroup, defaultGroup])

  if (!open) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setFormError(null)

    try {
      const profileGroup = lockedGroup ?? form.profileGroup

      if (profile) {
        const input: UpdateProfileInput = {
          primaryMarketCode: form.primaryMarketCode,
          profileGroup,
          niche: form.niche,
          category: form.category,
          priority: form.priority,
          tags: toTags(form.tags),
          active: form.active,
        }

        if (!profile.instagramExternalId) {
          input.instagramUsername = normalizeInstagramUsername(form.instagramInput)
        }

        await profilesRepository.updateProfile(profile.id, input)
      } else {
        normalizeInstagramUsername(form.instagramInput)

        const input: CreateProfileInput = {
          instagramInput: form.instagramInput,
          primaryMarketCode: form.primaryMarketCode,
          profileGroup,
          niche: form.niche,
          category: form.category,
          priority: form.priority,
          tags: toTags(form.tags),
          active: form.active,
        }

        await profilesRepository.createProfile(input)
      }

      await onSaved()
      onClose()
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Não foi possível salvar o perfil.')
    } finally {
      setSaving(false)
    }
  }

  const isCompetitor = lockedGroup === 'competitor'

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={() => !saving && onClose()}>
      <aside className="profile-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="eyebrow">{profile ? 'Editar fonte' : isCompetitor ? 'Novo concorrente' : 'Nova fonte'}</span>
            <h2>{profile ? 'Editar perfil' : isCompetitor ? 'Adicionar concorrente' : 'Adicionar perfil'}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={saving}>
            <X size={17} />
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Instagram URL ou @</span>
            <input
              required
              value={form.instagramInput}
              disabled={Boolean(profile?.instagramExternalId)}
              placeholder="@perfil ou instagram.com/perfil"
              onChange={(event) => setForm({ ...form, instagramInput: event.target.value })}
            />
            {profile?.instagramExternalId ? (
              <small>Username bloqueado após a identidade do Instagram ser resolvida.</small>
            ) : isCompetitor && !profile ? (
              <small>O nome e a foto serão preenchidos automaticamente após a primeira coleta.</small>
            ) : (
              <small>Normalização local não confirma que o perfil existe.</small>
            )}
          </label>

          <div className="form-grid-two">
            {!lockedGroup ? (
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
            ) : null}

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

          <div className="form-grid-two">
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
                placeholder="gestão, vendas"
              />
            </label>
          </div>

          <label className="toggle-field">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm({ ...form, active: event.target.checked })}
            />
            <span>
              <strong>Monitoramento ativo</strong>
              <span>Perfis novos entram como pendentes até a primeira coleta do provider.</span>
            </span>
          </label>

          {formError ? <div className="form-error">{formError}</div> : null}

          <div className="drawer-actions">
            <button className="secondary-button" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : profile ? 'Salvar alterações' : isCompetitor ? 'Adicionar concorrente' : 'Adicionar perfil'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}
