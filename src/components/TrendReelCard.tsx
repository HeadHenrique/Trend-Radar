import {
  Eye,
  Heart,
  MessageCircle,
  Play,
  Share2,
  UserRound,
} from 'lucide-react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { formatMetric, formatPostDate, formatPostDateTime } from '../features/posts/presentation'
import { trendItemNicheLabel } from '../features/trends/presentation'
import type { TrendReelItem } from '../features/trends/types'
import { InstagramReelEmbed } from './InstagramReelEmbed'

interface TrendReelCardProps {
  item: TrendReelItem
  isPlaying: boolean
  onOpen: (item: TrendReelItem) => void
  onPlay: (item: TrendReelItem) => void
}

export function TrendReelCard({
  item,
  isPlaying,
  onOpen,
  onPlay,
}: TrendReelCardProps) {
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
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen(item)
  }

  function handlePlay(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onPlay(item)
  }

  return (
    <article
      className={'trend-reel-card' + (isPlaying ? ' is-playing' : '')}
      role="button"
      tabIndex={0}
      aria-label={'Abrir análise do Reel ' + (post.instagramShortcode ?? post.id)}
      onClick={() => onOpen(item)}
      onKeyDown={handleKeyDown}
    >
      <div className="trend-reel-media">
        {isPlaying ? (
          <InstagramReelEmbed
            permalink={post.permalink}
            thumbnailUrl={post.thumbnailUrl}
            authorUsername={item.author.instagramUsername}
            variant="inline"
          />
        ) : (
          <>
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

            <button
              className="trend-reel-play-button"
              type="button"
              aria-label={
                item.author.instagramUsername
                  ? 'Reproduzir Reel de @' + item.author.instagramUsername
                  : 'Reproduzir Reel'
              }
              onClick={handlePlay}
            >
              <Play size={25} fill="currentColor" />
            </button>

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
          </>
        )}
      </div>

      <section className="trend-reel-primary-metrics" aria-label="Métricas da última observação">
        <div className="trend-reel-primary-metric">
          <Eye size={15} aria-hidden="true" />
          <strong>{formatMetric(latestMetrics?.viewsCount ?? null)}</strong>
          <span>Visualizações</span>
        </div>
        <div className="trend-reel-primary-metric">
          <Heart size={15} aria-hidden="true" />
          <strong>{formatMetric(latestMetrics?.likesCount ?? null)}</strong>
          <span>Curtidas</span>
        </div>
        <div className="trend-reel-primary-metric">
          <Share2 size={15} aria-hidden="true" />
          <strong>{formatMetric(latestMetrics?.sharesCount ?? null)}</strong>
          <span>Compartilhamentos</span>
        </div>
        <div className="trend-reel-primary-metric">
          <MessageCircle size={15} aria-hidden="true" />
          <strong>{formatMetric(latestMetrics?.commentsCount ?? null)}</strong>
          <span>Comentários</span>
        </div>
      </section>

      <div className="trend-reel-metrics-updated">
        {latestMetrics
          ? 'Atualizado em ' + formatPostDateTime(latestMetrics.capturedAt)
          : 'Nenhuma observação de métricas disponível'}
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
      </div>
    </article>
  )
}
