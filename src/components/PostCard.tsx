import {
  Bookmark,
  Clapperboard,
  Eye,
  Heart,
  Image as ImageIcon,
  Images,
  MessageCircle,
  Play,
  Share2,
  UserRound,
} from 'lucide-react'
import type { KeyboardEvent } from 'react'
import {
  associationLabels,
  contentTypeLabels,
  formatMetric,
  formatPostDate,
} from '../features/posts/presentation'
import type { PostLibraryItem } from '../features/posts/types'

interface PostCardProps {
  post: PostLibraryItem
  onOpen: (post: PostLibraryItem) => void
}

function PlaceholderIcon({ contentType }: { contentType: PostLibraryItem['contentType'] }) {
  if (contentType === 'reel' || contentType === 'video') return <Clapperboard size={28} />
  if (contentType === 'carousel') return <Images size={28} />
  return <ImageIcon size={28} />
}

export function PostCard({ post, onOpen }: PostCardProps) {
  const metrics = post.latestMetrics
  const relevantAssociation =
    post.associations.find((item) => item.associationType === 'collaborator') ??
    post.associations.find((item) => item.associationType === 'discovered')
  const firstAssociation = post.associations[0]

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen(post)
  }

  return (
    <article
      className="post-card"
      role="button"
      tabIndex={0}
      aria-label={'Abrir detalhes do conteúdo ' + (post.instagramShortcode ?? post.id)}
      onClick={() => onOpen(post)}
      onKeyDown={handleKeyDown}
    >
      <div className={'post-card-media ' + post.contentType}>
        {post.thumbnailUrl ? (
          <img src={post.thumbnailUrl} alt="" loading="lazy" />
        ) : (
          <div className="post-media-placeholder">
            <PlaceholderIcon contentType={post.contentType} />
            <span>{contentTypeLabels[post.contentType]}</span>
          </div>
        )}

        <span className={'post-type-badge ' + post.contentType}>
          {contentTypeLabels[post.contentType]}
        </span>

        {relevantAssociation ? (
          <span className={'post-association-badge ' + relevantAssociation.associationType}>
            {associationLabels[relevantAssociation.associationType]}
          </span>
        ) : null}
      </div>

      <div className="post-card-body">
        <div className="post-card-author">
          <div>
            <strong>
              {post.authorInstagramUsername ? '@' + post.authorInstagramUsername : 'Autor não observado'}
            </strong>
            <span>{formatPostDate(post.publishedAt)}</span>
          </div>

          {firstAssociation ? (
            <div className="post-associated-profile" title={'Perfil monitorado: @' + firstAssociation.profile.instagramUsername}>
              {firstAssociation.profile.profilePictureUrl ? (
                <img src={firstAssociation.profile.profilePictureUrl} alt="" />
              ) : (
                <span><UserRound size={12} /></span>
              )}
              {post.associations.length > 1 ? <small>+{post.associations.length - 1}</small> : null}
            </div>
          ) : null}
        </div>

        <p className="post-card-caption">
          {post.caption || 'Sem legenda observada.'}
        </p>

        {post.hashtags.length ? (
          <div className="post-card-tags">
            {post.hashtags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        ) : null}

        {metrics ? (
          <div className="post-card-metrics" aria-label="Métricas da última observação">
            <span title="Curtidas"><Heart size={13} /> {formatMetric(metrics.likesCount)}</span>
            <span title="Comentários"><MessageCircle size={13} /> {formatMetric(metrics.commentsCount)}</span>
            {metrics.viewsCount !== null ? (
              <span title="Views"><Eye size={13} /> {formatMetric(metrics.viewsCount)}</span>
            ) : null}
            {metrics.playsCount !== null ? (
              <span title="Plays"><Play size={13} /> {formatMetric(metrics.playsCount)}</span>
            ) : null}
            {metrics.sharesCount !== null ? (
              <span title="Compartilhamentos"><Share2 size={13} /> {formatMetric(metrics.sharesCount)}</span>
            ) : null}
            {metrics.savesCount !== null ? (
              <span title="Salvos"><Bookmark size={13} /> {formatMetric(metrics.savesCount)}</span>
            ) : null}
          </div>
        ) : (
          <span className="post-no-metrics">Sem métricas observadas</span>
        )}
      </div>
    </article>
  )
}
