import type { PostAssociationType, PostContentType, PostMetrics } from './types'

export const contentTypeLabels: Record<PostContentType, string> = {
  reel: 'Reel',
  carousel: 'Carrossel',
  image: 'Imagem',
  video: 'Vídeo',
  unknown: 'Outro',
}

export const associationLabels: Record<PostAssociationType, string> = {
  author: 'Autor',
  collaborator: 'Collab',
  discovered: 'Descoberto',
}

export function formatPostDate(value: string | null, empty = 'Data indisponível') {
  if (!value) return empty

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function formatPostDateTime(value: string | null, empty = 'Não observado') {
  if (!value) return empty

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatMetric(value: number | null) {
  if (value === null) return '—'
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatDuration(value: number | null) {
  if (value === null) return 'Não informada'

  const rounded = Math.round(value)
  if (rounded < 60) return String(rounded) + 's'

  const minutes = Math.floor(rounded / 60)
  const seconds = rounded % 60
  return String(minutes) + 'min ' + String(seconds).padStart(2, '0') + 's'
}

export function availableOptionalMetrics(metrics: PostMetrics | null) {
  if (!metrics) return []

  return [
    ['Views', metrics.viewsCount],
    ['Plays', metrics.playsCount],
    ['Compart.', metrics.sharesCount],
    ['Salvos', metrics.savesCount],
  ] as const
}
