import type { Tables } from '../../lib/database.types'

export type PostContentType = 'reel' | 'carousel' | 'image' | 'video' | 'unknown'
export type PostAssociationType = 'author' | 'collaborator' | 'discovered'
export type PostSort = 'recent' | 'oldest' | 'likes' | 'comments'
export type PostPeriod = 'all' | '30d' | '90d' | '365d'

export type InstagramPostRow = Tables<'instagram_posts'>
export type MonitoredProfilePostRow = Tables<'monitored_profile_posts'>
export type MonitoredProfileRow = Tables<'monitored_profiles'>
export type PostMetricSnapshotRow = Tables<'post_metric_snapshots'>

export interface PostAssociatedProfile {
  id: string
  instagramUsername: string
  displayName: string | null
  profilePictureUrl: string | null
}

export interface PostMetrics {
  monitoredProfileId: string
  likesCount: number | null
  commentsCount: number | null
  viewsCount: number | null
  playsCount: number | null
  sharesCount: number | null
  savesCount: number | null
  capturedAt: string
}

export interface PostAssociation {
  associationType: PostAssociationType
  profile: PostAssociatedProfile
  latestMetrics: PostMetrics | null
  snapshotCount: number
}

export interface PostLibraryItem {
  id: string
  instagramMediaId: string | null
  instagramShortcode: string | null
  permalink: string | null
  publishedAt: string | null
  caption: string | null
  contentType: PostContentType
  durationSeconds: number | null
  audioName: string | null
  thumbnailUrl: string | null
  authorInstagramUsername: string | null
  authorInstagramExternalId: string | null
  hashtags: string[]
  associations: PostAssociation[]
  latestMetrics: PostMetrics | null
  snapshotCount: number
}

export interface PostsRepository {
  listPosts(): Promise<PostLibraryItem[]>
}
