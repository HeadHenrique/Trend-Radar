import type { Tables } from '../../lib/database.types'

export type CountryCode = string
export type MarketCode = CountryCode
export type ProfileGroup = 'own' | 'competitor' | 'reference' | 'trendsetter'
export type ProfilePriority = 1 | 2 | 3
export type MonitoringStatus = 'pending' | 'healthy' | 'error'
export type UserRole = 'viewer' | 'editor' | 'admin'

export type MonitoredProfileRow = Tables<'monitored_profiles'>

export interface MonitoredProfile {
  id: string
  instagramUsername: string
  instagramExternalId: string | null
  displayName: string | null
  profilePictureUrl: string | null
  primaryMarketCode: MarketCode
  profileGroup: ProfileGroup
  niche: string | null
  category: string | null
  priority: ProfilePriority
  tags: string[]
  followersCount: number | null
  monitoringStatus: MonitoringStatus
  active: boolean
  lastCollectedAt: string | null
  nextCollectionAt: string | null
  lastCollectionError: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export interface ListProfilesParams {
  active?: boolean
  primaryMarketCode?: MarketCode
  profileGroup?: ProfileGroup
  priority?: ProfilePriority
  search?: string
}

export interface CreateProfileInput {
  instagramInput: string
  primaryMarketCode: MarketCode
  profileGroup: ProfileGroup
  niche?: string | null
  category?: string | null
  priority: ProfilePriority
  tags?: string[]
  active?: boolean
}

export interface UpdateProfileInput {
  instagramUsername?: string
  primaryMarketCode?: MarketCode
  profileGroup?: ProfileGroup
  niche?: string | null
  category?: string | null
  priority?: ProfilePriority
  tags?: string[]
  active?: boolean
}

export interface ProfilesRepository {
  listProfiles(params?: ListProfilesParams): Promise<MonitoredProfile[]>
  createProfile(input: CreateProfileInput): Promise<MonitoredProfile>
  updateProfile(id: string, input: UpdateProfileInput): Promise<MonitoredProfile>
  setProfileActive(id: string, active: boolean): Promise<MonitoredProfile>
}
