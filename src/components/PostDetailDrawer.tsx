import {
  Bookmark,
  Clapperboard,
  ExternalLink,
  Eye,
  Heart,
  Image as ImageIcon,
  Images,
  MessageCircle,
  Play,
  Share2,
  UserRound,
  X,
} from 'lucide-react'
import { CachedReelPlayer } from './CachedReelPlayer'
import {
  associationLabels,
  contentTypeLabels,
  formatDuration,
  formatMetric,
  formatPostDate,
  formatPostDateTime,
} from '../features/posts/presentation'
import type { PostLibraryItem } from '../features/posts/types'
import { trendItemNicheLabel } from '../features/trends/presentation'
import type { TrendReelItem } from '../features/trends/types'

interface PostDetailDrawerProps {
  post: PostLibraryItem | null
  onClose: () => void
  trendItem?: TrendReelItem | null
}

function PlaceholderIcon({ contentType }: { contentType: PostLibraryItem['contentType'] }) {
  if (contentType === 'reel' || contentType === 'video') return <Clapperboard size={34} />
  if (contentType === 'carousel') return <Images size={34} />
  return <ImageIcon size={34} />
}

function formatBaselineValue(value: number | null) {
  if (value === null) return 'Indisponível'
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)
}

export function PostDetailDrawer({ post, onClose, trendItem = null }: PostDetailDrawerProps) {
  if (!post) return null

  const metrics = trendItem?.latestMetrics ?? post.latestMetrics
  const metricContext = metrics
    ? post.associations.find((association) => association.profile.id === metrics.monitoredProfileId)
    : null

  const primaryTrendAssociation = trendItem
    ? (
        trendItem.associations.find(
          (association) => association.profile.id === trendItem.primaryAssociationProfileId,
        ) ?? trendItem.associations[0]
      )
    : null

  const trendNiche = trendItem ? trendItemNicheLabel(trendItem) : null
  const drawerClassName = trendItem
    ? 'profile-drawer post-detail-drawer trend-reel-drawer'
    : 'profile-drawer post-detail-drawer'

  const regularMedia = (
    <div className={'post-detail-media ' + post.contentType}>
      {post.thumbnailUrl ? (
        <img src={post.thumbnailUrl} alt="" />
      ) : (
        <div className="post-media-placeholder">
          <PlaceholderIcon contentType={post.contentType} />
          <span>{contentTypeLabels[post.contentType]}</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className={drawerClassName}
        aria-label={trendItem ? 'Análise do Reel' : 'Detalhes do conteúdo'}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header post-drawer-header">
          <div>
            <div className="detail-badges">
              <span className="detail-group-badge">{contentTypeLabels[post.contentType]}</span>
              {trendItem ? (
                <span className="trend-market-badge">
                  {trendItem.market === 'BR' ? 'Brasil' : 'EUA'}
                </span>
              ) : null}
              {post.associations.some((item) => item.associationType === 'collaborator') ? (
                <span className="post-association-badge collaborator">Collab</span>
              ) : null}
              {post.associations.some((item) => item.associationType === 'discovered') ? (
                <span className="post-association-badge discovered">Descoberto</span>
              ) : null}
            </div>
            <h2>{post.instagramShortcode || 'Conteúdo monitorado'}</h2>
            <p>
              {post.authorInstagramUsername
                ? 'Autor original @' + post.authorInstagramUsername
                : 'Autor original não observado'}
            </p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar detalhes">
            <X size={17} />
          </button>
        </div>

        {trendItem ? (
          <div className="trend-reel-analysis-grid">
            <CachedReelPlayer
              playbackUrl={trendItem.videoPlaybackUrl}
              permalink={post.permalink}
              thumbnailUrl={post.thumbnailUrl}
              authorUsername={post.authorInstagramUsername}
              variant="drawer"
            />

            <div className="trend-reel-intelligence-column">
              <section className="profile-detail-section trend-context-panel">
                <div className="profile-detail-section-heading">
                  <span className="eyebrow">Contexto</span>
                  <h3>Leitura do Reel</h3>
                </div>

                <dl className="profile-detail-list">
                  <div>
                    <dt>Mercado</dt>
                    <dd>{trendItem.market === 'BR' ? 'Brasil' : 'EUA'}</dd>
                  </div>
                  <div>
                    <dt>Perfil monitorado</dt>
                    <dd>
                      {primaryTrendAssociation
                        ? '@' + primaryTrendAssociation.profile.instagramUsername
                        : 'Não observado'}
                    </dd>
                  </div>
                  <div>
                    <dt>Nicho / categoria</dt>
                    <dd>{trendNiche ?? 'Não informado'}</dd>
                  </div>
                  <div>
                    <dt>Associação</dt>
                    <dd>
                      {primaryTrendAssociation
                        ? associationLabels[primaryTrendAssociation.associationType]
                        : 'Não observada'}
                    </dd>
                  </div>
                  <div>
                    <dt>Publicado em</dt>
                    <dd>{formatPostDate(post.publishedAt)}</dd>
                  </div>
                  <div>
                    <dt>Duração</dt>
                    <dd>{formatDuration(post.durationSeconds)}</dd>
                  </div>
                </dl>
              </section>

              <section className="trend-highlight-panel">
                <span className="eyebrow">Sinais observáveis</span>
                <h3>Por que está em destaque?</h3>
                <ul>
                  {trendItem.rankingContext.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>

                {trendItem.rankingContext.baseline ? (
                  <div className="trend-baseline-note">
                    <strong>Baseline do perfil</strong>
                    <span>
                      Mediana de interações: {formatBaselineValue(
                        trendItem.rankingContext.baseline.medianObservedInteractions,
                      )}
                    </span>
                    <span>
                      Amostra completa: {trendItem.rankingContext.baseline.sampleSize} Reels
                    </span>
                    {trendItem.rankingContext.interactionLift !== null ? (
                      <span>
                        Interações observadas: {trendItem.rankingContext.interactionLift.toFixed(2)}× a mediana
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <p className="post-muted-copy">
                    Baseline insuficiente para comparação relativa deste perfil.
                  </p>
                )}
              </section>
            </div>
          </div>
        ) : regularMedia}

        <section className="profile-detail-section post-detail-section">
          <div className="profile-detail-section-heading">
            <span className="eyebrow">Conteúdo</span>
            <h3>Informações observadas</h3>
          </div>
          <dl className="profile-detail-list">
            <div>
              <dt>Autor</dt>
              <dd>{post.authorInstagramUsername ? '@' + post.authorInstagramUsername : 'Não observado'}</dd>
            </div>
            <div>
              <dt>Shortcode</dt>
              <dd>{post.instagramShortcode ?? 'Não observado'}</dd>
            </div>
            <div>
              <dt>Publicado em</dt>
              <dd>{formatPostDate(post.publishedAt)}</dd>
            </div>
            <div>
              <dt>Duração</dt>
              <dd>{formatDuration(post.durationSeconds)}</dd>
            </div>
          </dl>

          <div className="post-full-caption">
            <span>Legenda</span>
            <p>{post.caption || 'Sem legenda observada.'}</p>
          </div>

          {post.hashtags.length ? (
            <div className="post-detail-tags" aria-label="Hashtags">
              {post.hashtags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : null}
        </section>

        <section className="profile-detail-section post-detail-section">
          <div className="profile-detail-section-heading">
            <span className="eyebrow">Associações</span>
            <h3>Perfis monitorados relacionados</h3>
          </div>

          {post.associations.length ? (
            <div className="post-association-list">
              {post.associations.map((association) => {
                const contextLabel =
                  association.associationType === 'collaborator'
                    ? 'Collab com perfil monitorado'
                    : association.associationType === 'author'
                      ? 'Perfil monitorado é o autor'
                      : 'Descoberto via perfil monitorado'

                return (
                  <div className="post-association-row" key={association.profile.id}>
                    {association.profile.profilePictureUrl ? (
                      <img src={association.profile.profilePictureUrl} alt="" />
                    ) : (
                      <div className="post-association-avatar"><UserRound size={16} /></div>
                    )}
                    <div>
                      <strong>{association.profile.displayName || '@' + association.profile.instagramUsername}</strong>
                      <span>@{association.profile.instagramUsername}</span>
                      <small>{contextLabel}</small>
                    </div>
                    <span className={'post-association-badge ' + association.associationType}>
                      {associationLabels[association.associationType]}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="post-muted-copy">Nenhum perfil monitorado associado.</p>
          )}
        </section>

        <section className="profile-detail-section post-detail-section">
          <div className="profile-detail-section-heading">
            <span className="eyebrow">Métricas</span>
            <h3>Última observação</h3>
          </div>

          {metrics ? (
            <>
              <div className="post-detail-metrics">
                {metrics.likesCount !== null ? (
                  <div><Heart size={14} /><span>Curtidas</span><strong>{formatMetric(metrics.likesCount)}</strong></div>
                ) : null}
                {metrics.commentsCount !== null ? (
                  <div><MessageCircle size={14} /><span>Comentários</span><strong>{formatMetric(metrics.commentsCount)}</strong></div>
                ) : null}
                {metrics.viewsCount !== null ? (
                  <div><Eye size={14} /><span>Views</span><strong>{formatMetric(metrics.viewsCount)}</strong></div>
                ) : null}
                {metrics.playsCount !== null ? (
                  <div><Play size={14} /><span>Plays</span><strong>{formatMetric(metrics.playsCount)}</strong></div>
                ) : null}
                {metrics.sharesCount !== null ? (
                  <div><Share2 size={14} /><span>Compart.</span><strong>{formatMetric(metrics.sharesCount)}</strong></div>
                ) : null}
                {metrics.savesCount !== null ? (
                  <div><Bookmark size={14} /><span>Salvos</span><strong>{formatMetric(metrics.savesCount)}</strong></div>
                ) : null}
              </div>

              <div className="post-observation-meta">
                <span>Observado em {formatPostDateTime(metrics.capturedAt)}</span>
                <span>{post.snapshotCount} {post.snapshotCount === 1 ? 'snapshot' : 'snapshots'} no histórico</span>
                {metricContext ? <span>Contexto: @{metricContext.profile.instagramUsername}</span> : null}
              </div>
            </>
          ) : (
            <p className="post-muted-copy">Nenhuma métrica foi observada para este conteúdo.</p>
          )}
        </section>

        {post.permalink ? (
          <a className="primary-button post-instagram-link" href={post.permalink} target="_blank" rel="noreferrer">
            Abrir no Instagram <ExternalLink size={14} />
          </a>
        ) : null}
      </aside>
    </div>
  )
}
