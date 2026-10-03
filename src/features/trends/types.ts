import type {
  PostAssociationType,
  PostLibraryItem,
  PostMetrics,
} from '../posts/types'

export type TrendMarket = 'BR' | 'US'
export type TrendPeriod = '7d' | '30d' | '90d' | 'all'
export type TrendSort =
  | 'highlight'
  | 'engagement'
  | 'likes'
  | 'comments'
  | 'recent'
  | 'views'

export type TrendNicheKey =
  | 'all'
  | 'gestao'
  | 'financeiro'
  | 'vendas'
  | 'lideranca'
  | 'empreendedorismo'
  | 'estrategia'
  | 'comercial'
  | 'marketing'
  | 'outros'

export interface TrendProfileMetadata {
  id: string
  instagramUsername: string
  displayName: string | null
  profilePictureUrl: string | null
  market: string
  profileGroup: string
  niche: string | null
  category: string | null
  tags: string[]
}

export interface TrendBaseline {
  monitoredProfileId: string
  sampleSize: number
  medianLikes: number | null
  medianComments: number | null
  medianObservedInteractions: number | null
}

export interface TrendRankingContext {
  recent: boolean
  completeMetrics: boolean
  aboveBaseline: boolean
  highInteraction: boolean
  interactionLift: number | null
  baseline: TrendBaseline | null
  reasons: string[]
}

export interface TrendReelAssociation {
  associationType: PostAssociationType
  profile: TrendProfileMetadata
  latestMetrics: PostMetrics | null
  snapshotCount: number
}

export interface TrendReelItem {
  id: string
  post: PostLibraryItem
  author: {
    instagramUsername: string | null
    instagramExternalId: string | null
  }
  associations: TrendReelAssociation[]
  market: TrendMarket
  profileMetadata: TrendProfileMetadata[]
  primaryAssociationProfileId: string | null
  latestMetrics: PostMetrics | null
  observedInteractions: number | null
  rankingContext: TrendRankingContext
}

export interface TrendsDataset {
  items: TrendReelItem[]
  profiles: TrendProfileMetadata[]
}

export interface TrendsRepository {
  listReels(): Promise<TrendsDataset>
}
