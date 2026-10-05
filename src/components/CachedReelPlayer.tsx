import { useState } from 'react'
import { InstagramReelEmbed } from './InstagramReelEmbed'

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

  if (!useNative) {
    return (
      <InstagramReelEmbed
        permalink={permalink}
        thumbnailUrl={thumbnailUrl}
        authorUsername={authorUsername}
        variant={variant === 'inline' ? 'inline' : 'drawer'}
      />
    )
  }

  return (
    <div
      className={
        variant === 'inline'
          ? 'cached-reel-player cached-reel-player--inline'
          : 'cached-reel-player cached-reel-player--drawer'
      }
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
