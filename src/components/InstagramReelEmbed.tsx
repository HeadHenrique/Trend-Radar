import { ExternalLink, PlayCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}

interface InstagramReelEmbedProps {
  permalink: string | null
  thumbnailUrl: string | null
  authorUsername: string | null
  variant?: 'drawer' | 'inline'
}

const SCRIPT_ID = 'instagram-embed-script'

export function InstagramReelEmbed({
  permalink,
  thumbnailUrl,
  authorUsername,
  variant = 'drawer',
}: InstagramReelEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>(
    permalink ? 'loading' : 'fallback',
  )

  useEffect(() => {
    if (!permalink) {
      setStatus('fallback')
      return
    }

    setStatus('loading')

    const container = containerRef.current
    if (!container) return

    const observer = new MutationObserver(() => {
      if (container.querySelector('iframe')) setStatus('ready')
    })

    observer.observe(container, { childList: true, subtree: true })

    const processEmbed = () => {
      window.instgrm?.Embeds.process()
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    if (existingScript) {
      processEmbed()
    } else {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.async = true
      script.src = 'https://www.instagram.com/embed.js'
      script.onload = processEmbed
      script.onerror = () => setStatus('fallback')
      document.body.appendChild(script)
    }

    const fallbackTimer = window.setTimeout(() => {
      if (!container.querySelector('iframe')) setStatus('fallback')
    }, 8000)

    return () => {
      observer.disconnect()
      window.clearTimeout(fallbackTimer)
    }
  }, [permalink])

  const isInline = variant === 'inline'
  const wrapperClassName = isInline
    ? 'instagram-reel-player instagram-reel-player--inline'
    : 'instagram-reel-player'

  return (
    <div
      className={wrapperClassName}
      ref={containerRef}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {permalink && status !== 'fallback' ? (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={permalink}
          data-instgrm-version="14"
        >
          <a href={permalink} target="_blank" rel="noreferrer">
            Ver Reel no Instagram
          </a>
        </blockquote>
      ) : null}

      {status === 'loading' ? (
        <div className="instagram-reel-loading" aria-live="polite">
          <PlayCircle size={22} />
          <span>Carregando player oficial do Instagram…</span>
        </div>
      ) : null}

      {status === 'fallback' && isInline ? (
        <div className="instagram-reel-fallback instagram-reel-fallback--inline">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={authorUsername ? 'Thumbnail do Reel de @' + authorUsername : 'Thumbnail do Reel'}
            />
          ) : (
            <div className="instagram-reel-fallback-placeholder">
              <PlayCircle size={30} />
              <span>Player indisponível</span>
            </div>
          )}

          <div className="instagram-reel-fallback-overlay">
            <strong>Player indisponível</strong>
            {permalink ? (
              <a
                className="secondary-button instagram-reel-open-inline"
                href={permalink}
                target="_blank"
                rel="noreferrer"
              >
                Abrir no Instagram <ExternalLink size={13} />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {status === 'fallback' && !isInline ? (
        <div className="instagram-reel-fallback">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={authorUsername ? 'Thumbnail do Reel de @' + authorUsername : 'Thumbnail do Reel'}
            />
          ) : (
            <div className="instagram-reel-fallback-placeholder">
              <PlayCircle size={30} />
              <span>Player indisponível</span>
            </div>
          )}

          <div>
            <strong>Não foi possível incorporar este Reel.</strong>
            <span>O conteúdo pode estar privado, com embeds desativados ou bloqueado pelo navegador.</span>
          </div>
        </div>
      ) : null}

      {permalink && !isInline ? (
        <a
          className="secondary-button instagram-reel-open"
          href={permalink}
          target="_blank"
          rel="noreferrer"
        >
          Abrir Reel no Instagram <ExternalLink size={14} />
        </a>
      ) : null}
    </div>
  )
}
