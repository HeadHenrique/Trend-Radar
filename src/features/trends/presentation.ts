import type {
  TrendNicheKey,
  TrendReelItem,
  TrendSort,
} from './types'

export const trendNicheOptions: Array<{ key: TrendNicheKey; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'gestao', label: 'Gestão' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'vendas', label: 'Vendas' },
  { key: 'lideranca', label: 'Liderança' },
  { key: 'empreendedorismo', label: 'Empreendedorismo' },
  { key: 'estrategia', label: 'Estratégia' },
  { key: 'comercial', label: 'Comercial' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'outros', label: 'Outros' },
]

const nicheTerms: Record<Exclude<TrendNicheKey, 'all' | 'outros'>, string[]> = {
  gestao: ['gestão', 'gestao'],
  financeiro: ['financeiro', 'finanças', 'financas'],
  vendas: ['vendas', 'venda'],
  lideranca: ['liderança', 'lideranca'],
  empreendedorismo: ['empreendedorismo', 'empreendedor'],
  estrategia: ['estratégia', 'estrategia'],
  comercial: ['comercial'],
  marketing: ['marketing'],
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function profileMetadataText(item: TrendReelItem) {
  return item.profileMetadata
    .flatMap((profile) => [
      profile.niche ?? '',
      profile.category ?? '',
      ...profile.tags,
    ])
    .filter(Boolean)
    .join(' ')
}

function matchesKnownNiche(text: string) {
  const normalized = normalize(text)
  return Object.values(nicheTerms).some((terms) =>
    terms.some((term) => normalized.includes(normalize(term))),
  )
}

export function matchesTrendNiche(item: TrendReelItem, niche: TrendNicheKey) {
  if (niche === 'all') return true

  const text = profileMetadataText(item)
  if (niche === 'outros') return !text || !matchesKnownNiche(text)

  const normalized = normalize(text)
  return nicheTerms[niche].some((term) => normalized.includes(normalize(term)))
}

export function trendItemNicheLabel(item: TrendReelItem) {
  for (const profile of item.profileMetadata) {
    if (profile.niche) return profile.niche
    if (profile.category) return profile.category
    if (profile.tags.length) return profile.tags[0]
  }
  return null
}

export function compareNullableDesc(a: number | null, b: number | null) {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return b - a
}

function publishedAtValue(item: TrendReelItem) {
  return item.post.publishedAt ? new Date(item.post.publishedAt).getTime() : 0
}

export function compareTrendReels(a: TrendReelItem, b: TrendReelItem, sort: TrendSort) {
  if (sort === 'engagement') {
    const metricOrder = compareNullableDesc(a.observedInteractions, b.observedInteractions)
    return metricOrder || publishedAtValue(b) - publishedAtValue(a)
  }

  if (sort === 'likes') {
    const metricOrder = compareNullableDesc(
      a.latestMetrics?.likesCount ?? null,
      b.latestMetrics?.likesCount ?? null,
    )
    return metricOrder || publishedAtValue(b) - publishedAtValue(a)
  }

  if (sort === 'comments') {
    const metricOrder = compareNullableDesc(
      a.latestMetrics?.commentsCount ?? null,
      b.latestMetrics?.commentsCount ?? null,
    )
    return metricOrder || publishedAtValue(b) - publishedAtValue(a)
  }

  if (sort === 'plays') {
    const metricOrder = compareNullableDesc(
      a.latestMetrics?.playsCount ?? null,
      b.latestMetrics?.playsCount ?? null,
    )
    return metricOrder || publishedAtValue(b) - publishedAtValue(a)
  }

  if (sort === 'recent') {
    return publishedAtValue(b) - publishedAtValue(a)
  }

  const aRank = [
    a.rankingContext.aboveBaseline ? 1 : 0,
    a.rankingContext.recent ? 1 : 0,
    a.rankingContext.completeMetrics ? 1 : 0,
  ]
  const bRank = [
    b.rankingContext.aboveBaseline ? 1 : 0,
    b.rankingContext.recent ? 1 : 0,
    b.rankingContext.completeMetrics ? 1 : 0,
  ]

  for (let index = 0; index < aRank.length; index += 1) {
    if (aRank[index] !== bRank[index]) return bRank[index] - aRank[index]
  }

  const interactionOrder = compareNullableDesc(a.observedInteractions, b.observedInteractions)
  return interactionOrder || publishedAtValue(b) - publishedAtValue(a)
}
