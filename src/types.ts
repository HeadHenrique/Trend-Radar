export type MetricValue = number | null

export type TrendStatus = 'emerging' | 'accelerating' | 'saturating' | 'stable' | null

export interface Trend {
  id: string
  name: string
  trendScore: MetricValue
  adoptionVelocity: MetricValue
  creatorBreadth: MetricValue
  relativePerformance: MetricValue
  internationalMomentum: MetricValue
  brazilGap: MetricValue
  competitorsAdopting: number | null
  firstDetectedAt: string | null
  updatedAt: string | null
  status: TrendStatus
}

export type ConnectionStatus = 'loading' | 'success' | 'error'

export interface TrendFilters {
  country: string
  period: string
  profileGroup: string
  category: string
  format: string
  score: string
  status: string
}
