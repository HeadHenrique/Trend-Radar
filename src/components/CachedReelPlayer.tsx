import { ExternalLink, PlayCircle } from 'lucide-react'
import { useState } from 'react'

interface CachedReelPlayerProps {
  playbackUrl: string | null
  permalink: string | null
  thumbnailUrl: string | null
  authorUsername: string | null
  variant?: 'inline' | 'drawer'
  autoPlay?: boolean
}

export function CachedReelPlayer({
  playbackUrl,
  permalink,
  thumbnailUrl,
  authorUsername,
  variant = 'inline',
  autoPlay = false,
}: CachedReelPlayerProps) {
  const [nativeFailed, setNativeFailed] = useState(false)
  const useNative = Boolean(playbackUrl) && !nativeFailed
  const wrapperClassName =
    variant === 'inline'
      ? 'cached-reel-player cached-reel-player--inline'
      : 'cached-reel-player cached-reel-player--drawer'

  if (!useNative) {
    return (
      <div
        className={wrapperClassName + ' cached-reel-player--fallback'}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {thumbnailUrl ? (
          <img
            className="cached-reel-fallback-image"
            src={thumbnailUrl}
            alt={authorUsername
              ? 'Thumbnail do Reel de @' + authorUsername
              : 'Thumbnail do Reel'}
          />
        ) : (
          <div className="cached-reel-fallback-placeholder">
            <PlayCircle size={34} />
          </div>
        )}

        <div className="cached-reel-fallback-overlay">
          <div className="cached-reel-fallback-message">
            <PlayCircle size={18} />
            <strong>Vídeo indisponível no momento</strong>
          </div>

          {permalink ? (
            <a
              className="secondary-button cached-reel-fallback-link"
              href={permalink}
              target="_blank"
              rel="noreferrer"
            >
              Abrir no Instagram <ExternalLink size={13} />
            </a>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div
      className={wrapperClassName}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <video
        src={playbackUrl ?? undefined}
        controls
        playsInline
        preload="metadata"
        poster={thumbnailUrl ?? undefined}
        autoPlay={autoPlay}
        onError={() => setNativeFailed(true)}
      >
        Seu navegador não suporta reprodução de vídeo.
      </video>
    </div>
  )
}
