import {
  Eye,
  Heart,
  MessageCircle,
  UserRound,
} from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { formatMetric, formatPostDate } from '../features/posts/presentation'
import { trendItemNicheLabel } from '../features/trends/presentation'
import type { TrendReelItem } from '../features/trends/types'

interface TrendReelCardProps {
  item: TrendReelItem
  onOpen: (item: TrendReelItem) => void
}

export function TrendReelCard({ item, onOpen }: TrendReelCardProps) {
  const { post, latestMetrics, rankingContext } = item
  const primaryAssociation =
    item.associations.find(
      (association) => association.profile.id === item.primaryAssociationProfileId,
    ) ?? item.associations[0]

  const nicheLabel = trendItemNicheLabel(item)
  const hasCollab = item.associations.some(
    (association) => association.associationType === 'collaborator',
  )

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen(item)
  }

  return (
    <article
      className="trend-reel-card"
      role="button"
      tabIndex={0}
      aria-label={'Abrir análise do Reel ' + (post.instagramShortcode ?? post.id)}
      onClick={() => onOpen(item)}
      onKeyDown={handleKeyDown}
    >
      <div className="trend-reel-media">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={item.author.instagramUsername
              ? 'Thumbnail do Reel de @' + item.author.instagramUsername
              : 'Thumbnail do Reel'}
            loading="lazy"
          />
        ) : (
          <div className="post-media-placeholder trend-reel-placeholder">
            <span>Reel sem thumbnail observada</span>
          </div>
        )}

        <div className="trend-reel-media-badges">
          <span className="trend-market-badge">{item.market === 'BR' ? 'Brasil' : 'EUA'}</span>
          {hasCollab ? <span className="post-association-badge collaborator">Collab</span> : null}
        </div>

        <div className="trend-reel-traction-badges">
          {rankingContext.recent ? <span>Recente</span> : null}
          {rankingContext.highInteraction ? (
            <span>Alta interação</span>
          ) : rankingContext.aboveBaseline ? (
            <span>Acima do baseline</span>
          ) : null}
        </div>
      </div>

      <div className="trend-reel-card-body">
        <div className="trend-reel-author">
          <div>
            <strong>
              {item.author.instagramUsername
                ? '@' + item.author.instagramUsername
                : 'Autor não observado'}
            </strong>
            <span>{formatPostDate(post.publishedAt)}</span>
          </div>

          {primaryAssociation ? (
            primaryAssociation.profile.profilePictureUrl ? (
              <img
                src={primaryAssociation.profile.profilePictureUrl}
                alt={'Perfil monitorado @' + primaryAssociation.profile.instagramUsername}
              />
            ) : (
              <span className="trend-reel-avatar-fallback">
                <UserRound size={14} />
              </span>
            )
          ) : null}
        </div>

        <p className="trend-reel-caption">{post.caption || 'Sem legenda observada.'}</p>

        <div className="trend-reel-context">
          {primaryAssociation ? (
            <span>@{primaryAssociation.profile.instagramUsername}</span>
          ) : null}
          {nicheLabel ? <span>{nicheLabel}</span> : <span>Categoria não informada</span>}
        </div>

        <div className="trend-reel-metrics" aria-label="Métricas da última observação">
          <span title="Curtidas">
            <Heart size={14} /> {formatMetric(latestMetrics?.likesCount ?? null)}
          </span>
          <span title="Comentários">
            <MessageCircle size={14} /> {formatMetric(latestMetrics?.commentsCount ?? null)}
          </span>
          {latestMetrics?.viewsCount !== null && latestMetrics?.viewsCount !== undefined ? (
            <span title="Views">
              <Eye size={14} /> {formatMetric(latestMetrics.viewsCount)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
