import { supabase } from '../../lib/supabase'
import { normalizeInstagramUsername } from './normalizeInstagram'
import type {
  CreateProfileInput,
  ListProfilesParams,
  MonitoredProfile,
  MonitoredProfileRow,
  MonitoringStatus,
  ProfileGroup,
  ProfilePriority,
  ProfilesRepository,
  UpdateProfileInput,
} from './types'

const PROFILE_COLUMNS = [
  'id',
  'instagram_username',
  'instagram_external_id',
  'display_name',
  'profile_picture_url',
  'primary_market_code',
  'profile_group',
  'niche',
  'category',
  'priority',
  'tags',
  'followers_count',
  'monitoring_status',
  'active',
  'last_collected_at',
  'next_collection_at',
  'last_collection_error',
  'created_at',
  'updated_at',
  'created_by',
  'updated_by',
].join(',')

function toDomain(row: MonitoredProfileRow): MonitoredProfile {
  return {
    id: row.id,
    instagramUsername: row.instagram_username,
    instagramExternalId: row.instagram_external_id,
    displayName: row.display_name,
    profilePictureUrl: row.profile_picture_url,
    primaryMarketCode: row.primary_market_code,
    profileGroup: row.profile_group as ProfileGroup,
    niche: row.niche,
    category: row.category,
    priority: row.priority as ProfilePriority,
    tags: row.tags,
    followersCount: row.followers_count,
    monitoringStatus: row.monitoring_status as MonitoringStatus,
    active: row.active,
    lastCollectedAt: row.last_collected_at,
    nextCollectionAt: row.next_collection_at,
    lastCollectionError: row.last_collection_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  }
}

function cleanNullable(value: string | null | undefined) {
  const cleaned = value?.trim()
  return cleaned ? cleaned : null
}

function dataError(error: { code?: string; message: string }) {
  if (error.code === '23505') {
    return new Error('Esse perfil já está cadastrado.')
  }

  if (error.code === '42501') {
    return new Error('Seu usuário não possui permissão para executar esta ação.')
  }

  return new Error(error.message)
}

export const profilesRepository: ProfilesRepository = {
  async listProfiles(params: ListProfilesParams = {}) {
    let query = supabase
      .from('monitored_profiles')
      .select(PROFILE_COLUMNS)
      .order('created_at', { ascending: false })

    if (typeof params.active === 'boolean') query = query.eq('active', params.active)
    if (params.primaryMarketCode) query = query.eq('primary_market_code', params.primaryMarketCode)
    if (params.profileGroup) query = query.eq('profile_group', params.profileGroup)
    if (params.priority) query = query.eq('priority', params.priority)

    const { data, error } = await query
    if (error) throw dataError(error)

    const profiles = (data as MonitoredProfileRow[]).map(toDomain)
    const term = params.search?.trim().toLowerCase()

    if (!term) return profiles

    return profiles.filter((profile) =>
      profile.instagramUsername.includes(term) ||
      profile.displayName?.toLowerCase().includes(term),
    )
  },

  async createProfile(input: CreateProfileInput) {
    const instagramUsername = normalizeInstagramUsername(input.instagramInput)

    const { data, error } = await supabase
      .from('monitored_profiles')
      .insert({
        instagram_username: instagramUsername,
        primary_market_code: input.primaryMarketCode.toUpperCase(),
        profile_group: input.profileGroup,
        niche: cleanNullable(input.niche),
        category: cleanNullable(input.category),
        priority: input.priority,
        tags: input.tags ?? [],
        active: input.active ?? true,
      })
      .select(PROFILE_COLUMNS)
      .single()

    if (error) throw dataError(error)
    return toDomain(data as MonitoredProfileRow)
  },

  async updateProfile(id: string, input: UpdateProfileInput) {
    const payload: Record<string, unknown> = {}

    if (input.instagramUsername !== undefined) {
      payload.instagram_username = normalizeInstagramUsername(input.instagramUsername)
    }
    if (input.primaryMarketCode !== undefined) {
      payload.primary_market_code = input.primaryMarketCode.toUpperCase()
    }
    if (input.profileGroup !== undefined) payload.profile_group = input.profileGroup
    if (input.niche !== undefined) payload.niche = cleanNullable(input.niche)
    if (input.category !== undefined) payload.category = cleanNullable(input.category)
    if (input.priority !== undefined) payload.priority = input.priority
    if (input.tags !== undefined) payload.tags = input.tags
    if (input.active !== undefined) payload.active = input.active

    const { data, error } = await supabase
      .from('monitored_profiles')
      .update(payload)
      .eq('id', id)
      .select(PROFILE_COLUMNS)
      .single()

    if (error) throw dataError(error)
    return toDomain(data as MonitoredProfileRow)
  },

  async setProfileActive(id: string, active: boolean) {
    return profilesRepository.updateProfile(id, { active })
  },
}
