import { ExternalLink, FileText, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  associationLabels,
  formatDate,
  formatDateTime,
  formatFollowers,
  groupLabels,
  marketLabels,
  priorityLabels,
  profileStatusClass,
  profileStatusLabel,
} from '../features/profiles/presentation'
import { profilesRepository } from '../features/profiles/repository'
import type { MonitoredProfile, ProfileDetails } from '../features/profiles/types'
import { StatePanel } from './StatePanel'

interface ProfileDetailDrawerProps {
  profile: MonitoredProfile | null
  onClose: () => void
}

export function ProfileDetailDrawer({ profile, onClose }: ProfileDetailDrawerProps) {
  const [details, setDetails] = useState<ProfileDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) {
      setDetails(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    profilesRepository.getProfileDetails(profile.id)
      .then((data) => {
        if (!cancelled) setDetails(data)
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Não foi possível carregar os detalhes do perfil.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [profile])

  if (!profile) return null

  const infoRows = [
    ['Mercado', marketLabels[profile.primaryMarketCode] ?? profile.primaryMarketCode],
    ['Grupo', groupLabels[profile.profileGroup]],
    ['Nicho', profile.niche ?? 'Não informado'],
    ['Categoria', profile.category ?? 'Não informado'],
    ['Prioridade', priorityLabels[profile.priority]],
    ['Tags', profile.tags.length ? profile.tags.join(', ') : 'Não informado'],
    ['Última coleta', formatDateTime(profile.lastCollectedAt)],
    ['Próxima coleta', formatDateTime(profile.nextCollectionAt)],
    ['Status de monitoramento', profileStatusLabel(profile)],
  ]

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="profile-drawer profile-detail-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div className="detail-profile-header">
            {profile.profilePictureUrl ? (
              <img src={profile.profilePictureUrl} alt="" />
            ) : (
              <div className="detail-avatar-fallback">
                <UserRound size={22} />
              </div>
            )}
            <div>
              <div className="detail-badges">
                <span className="detail-group-badge">{groupLabels[profile.profileGroup]}</span>
                <span className={`profile-badge ${profileStatusClass(profile)}`}>{profileStatusLabel(profile)}</span>
              </div>
              <h2>{profile.displayName || `@${profile.instagramUsername}`}</h2>
              <p>@{profile.instagramUsername}</p>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        {error ? (
          <StatePanel state="error" title="Erro ao carregar detalhes" description={error} />
        ) : loading || !details ? (
          <StatePanel state="loading" />
        ) : (
          <>
            <section className="profile-detail-metrics">
              <div><span>Seguidores</span><strong>{formatFollowers(profile.followersCount)}</strong></div>
              <div><span>Conteúdos monitorados</span><strong>{details.monitoredContentCount}</strong></div>
              <div><span>Reels</span><strong>{details.reelCount}</strong></div>
              <div><span>Collabs</span><strong>{details.collabCount}</strong></div>
            </section>

            <section className="profile-detail-section">
              <div className="profile-detail-section-heading">
                <span className="eyebrow">Perfil</span>
                <h3>Informações</h3>
              </div>
              <dl className="profile-detail-list">
                {infoRows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="profile-detail-section">
              <div className="profile-detail-section-heading">
                <span className="eyebrow">Monitoramento</span>
                <h3>Conteúdo recente</h3>
              </div>

              {details.recentPosts.length === 0 ? (
                <StatePanel
                  state="empty"
                  title="Nenhum conteúdo associado"
                  description="Este perfil ainda não possui conteúdos monitorados no banco."
                />
              ) : (
                <div className="recent-post-list">
                  {details.recentPosts.map((post) => (
                    <article className="recent-post-card" key={post.id}>
                      {post.thumbnailUrl ? (
                        <img src={post.thumbnailUrl} alt="" />
                      ) : (
                        <div className="recent-post-placeholder"><FileText size={18} /></div>
                      )}
                      <div>
                        <div className="recent-post-meta">
                          <span>{post.contentType}</span>
                          <span>{associationLabels[post.associationType]}</span>
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                        <p>{post.caption || 'Sem legenda observada.'}</p>
                        {post.permalink ? (
                          <a href={post.permalink} target="_blank" rel="noreferrer" className="recent-post-link">
                            Abrir no Instagram <ExternalLink size={12} />
                          </a>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </aside>
    </div>
  )
}
