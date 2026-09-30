import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { profilesRepository } from './repository'
import type {
  MonitoredProfile,
  ProfileGroup,
  ProfilePriority,
} from './types'

interface ProfileFormModalProps {
  profile: MonitoredProfile | null
  onClose: () => void
  onSaved: () => void
}

const GROUP_OPTIONS: Array<{ value: ProfileGroup; label: string }> = [
  { value: 'own', label: 'Próprio' },
  { value: 'competitor', label: 'Concorrente' },
  { value: 'reference', label: 'Referência' },
  { value: 'trendsetter', label: 'Trendsetter' },
]

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
    return 'Esse perfil já está cadastrado.'
  }

  return error instanceof Error ? error.message : 'Não foi possível salvar o perfil.'
}

export function ProfileFormModal({ profile, onClose, onSaved }: ProfileFormModalProps) {
  const editing = Boolean(profile)
  const usernameLocked = Boolean(profile?.instagramExternalId)

  const [instagramInput, setInstagramInput] = useState('')
  const [profileGroup, setProfileGroup] = useState<ProfileGroup>('reference')
  const [primaryMarketCode, setPrimaryMarketCode] = useState('BR')
  const [niche, setNiche] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<ProfilePriority>(2)
  const [tags, setTags] = useState('')
  const [active, setActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setInstagramInput(profile?.instagramUsername ?? '')
    setProfileGroup(profile?.profileGroup ?? 'reference')
    setPrimaryMarketCode(profile?.primaryMarketCode ?? 'BR')
    setNiche(profile?.niche ?? '')
    setCategory(profile?.category ?? '')
    setPriority(profile?.priority ?? 2)
    setTags(profile?.tags.join(', ') ?? '')
    setActive(profile?.active ?? true)
    setError(null)
  }, [profile])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const normalizedTags = Array.from(
      new Set(
        tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    )

    try {
      if (profile) {
        await profilesRepository.updateProfile(profile.id, {
          ...(usernameLocked ? {} : { instagramUsername: instagramInput }),
          primaryMarketCode,
          profileGroup,
          niche,
          category,
          priority,
          tags: normalizedTags,
          active,
        })
      } else {
        await profilesRepository.createProfile({
          instagramInput,
          primaryMarketCode,
          profileGroup,
          niche,
          category,
          priority,
          tags: normalizedTags,
          active,
        })
      }

      onSaved()
      onClose()
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">{editing ? 'Editar fonte' : 'Nova fonte'}</span>
            <h2 id="profile-modal-title">{editing ? 'Editar perfil' : 'Adicionar perfil'}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
            <X size={17} />
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label className="form-field full">
            <span>Instagram URL ou @</span>
            <input
              required
              value={instagramInput}
              disabled={usernameLocked}
              placeholder="@usuario ou instagram.com/usuario"
              onChange={(event) => setInstagramInput(event.target.value)}
            />
            {usernameLocked ? (
              <small>Username bloqueado após a identidade do Instagram ser resolvida.</small>
            ) : (
              <small>A entrada é normalizada localmente; isso não confirma que o perfil existe.</small>
            )}
          </label>

          <label className="form-field">
            <span>Grupo</span>
            <select value={profileGroup} onChange={(event) => setProfileGroup(event.target.value as ProfileGroup)}>
              {GROUP_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Mercado</span>
            <select value={primaryMarketCode} onChange={(event) => setPrimaryMarketCode(event.target.value)}>
              <option value="BR">Brasil</option>
              <option value="US">Estados Unidos</option>
            </select>
          </label>

          <label className="form-field">
            <span>Nicho</span>
            <input value={niche} onChange={(event) => setNiche(event.target.value)} placeholder="Ex.: Gestão" />
          </label>

          <label className="form-field">
            <span>Categoria</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Ex.: Empresários" />
          </label>

          <label className="form-field">
            <span>Prioridade</span>
            <select
              value={priority}
              onChange={(event) => setPriority(Number(event.target.value) as ProfilePriority)}
            >
              <option value={1}>Alta</option>
              <option value={2}>Média</option>
              <option value={3}>Baixa</option>
            </select>
          </label>

          <label className="form-field">
            <span>Tags</span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="gestão, vendas, conteúdo"
            />
          </label>

          <label className="toggle-field full">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
            <span>
              <strong>Monitoramento ativo</strong>
              <small>Desative para pausar sem excluir o histórico.</small>
            </span>
          </label>

          {error ? <div className="form-error full">{error}</div> : null}

          <div className="modal-actions full">
            <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
