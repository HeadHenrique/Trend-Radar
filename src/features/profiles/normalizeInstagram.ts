const RESERVED_ROUTES = new Set([
  'about',
  'accounts',
  'api',
  'developer',
  'direct',
  'directory',
  'explore',
  'legal',
  'p',
  'privacy',
  'reel',
  'reels',
  'stories',
  'terms',
])

export function normalizeInstagramUsername(input: string): string {
  const raw = input.trim()

  if (!raw) {
    throw new Error('Informe uma URL ou @ do Instagram.')
  }

  let username = raw

  const withoutProtocol = raw.replace(/^https?:\/\//i, '')
  if (/^(www\.)?instagram\.com\//i.test(withoutProtocol)) {
    const url = new URL(`https://${withoutProtocol}`)
    const host = url.hostname.toLowerCase()

    if (host !== 'instagram.com' && host !== 'www.instagram.com') {
      throw new Error('A URL precisa ser do Instagram.')
    }

    const segments = url.pathname
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean)

    if (segments.length !== 1 || RESERVED_ROUTES.has(segments[0].toLowerCase())) {
      throw new Error('A URL informada não representa um perfil do Instagram.')
    }

    username = segments[0]
  } else if (/^https?:\/\//i.test(raw)) {
    throw new Error('A URL precisa ser do Instagram.')
  }

  username = username.replace(/^@+/, '').replace(/^\/+|\/+$/g, '').trim().toLowerCase()

  if (!username) {
    throw new Error('Username do Instagram inválido.')
  }

  if (/\s/.test(username)) {
    throw new Error('O username não pode conter espaços.')
  }

  if (!/^[a-z0-9._]{1,64}$/.test(username)) {
    throw new Error('Use apenas letras, números, ponto e underscore no username.')
  }

  if (RESERVED_ROUTES.has(username)) {
    throw new Error('Esse caminho do Instagram não representa um perfil.')
  }

  return username
}
