import { supabase } from '../../lib/supabase'
import type {
  InstagramPostRow,
  MonitoredProfilePostRow,
  MonitoredProfileRow,
  PostAssociation,
  PostAssociationType,
  PostContentType,
  PostLibraryItem,
  PostMetricSnapshotRow,
  PostMetrics,
  PostsRepository,
} from './types'

function dataError(error: { message: string }) {
  return new Error(error.message)
}

function normalizeContentType(value: string): PostContentType {
  if (value === 'reel' || value === 'carousel' || value === 'image' || value === 'video') {
    return value
  }
  return 'unknown'
}

function normalizeAssociationType(value: string): PostAssociationType {
  if (value === 'author' || value === 'collaborator') return value
  return 'discovered'
}

function toAssociatedProfile(row: MonitoredProfileRow) {
  return {
    id: row.id,
    instagramUsername: row.instagram_username,
    displayName: row.display_name,
    profilePictureUrl: row.profile_picture_url,
  }
}

function toMetrics(row: PostMetricSnapshotRow): PostMetrics {
  return {
    monitoredProfileId: row.monitored_profile_id,
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    viewsCount: row.views_count,
    playsCount: row.plays_count,
    sharesCount: row.shares_count,
    savesCount: row.saves_count,
    capturedAt: row.captured_at,
  }
}

function contextKey(postId: string, monitoredProfileId: string) {
  return postId + ':' + monitoredProfileId
}

function newestMetrics(associations: PostAssociation[]) {
  return associations.reduce<PostMetrics | null>((latest, association) => {
    const candidate = association.latestMetrics
    if (!candidate) return latest
    if (!latest) return candidate

    return new Date(candidate.capturedAt).getTime() > new Date(latest.capturedAt).getTime()
      ? candidate
      : latest
  }, null)
}

function toDomain(row: InstagramPostRow, associations: PostAssociation[]): PostLibraryItem {
  return {
    id: row.id,
    instagramMediaId: row.instagram_media_id,
    instagramShortcode: row.instagram_shortcode,
    permalink: row.permalink,
    publishedAt: row.published_at,
    caption: row.caption,
    contentType: normalizeContentType(row.content_type),
    durationSeconds: row.duration_seconds,
    audioName: row.audio_name,
    thumbnailUrl: row.thumbnail_url,
    authorInstagramUsername: row.author_instagram_username,
    authorInstagramExternalId: row.author_instagram_external_id,
    hashtags: row.hashtags ?? [],
    associations,
    latestMetrics: newestMetrics(associations),
    snapshotCount: associations.reduce((total, association) => total + association.snapshotCount, 0),
  }
}

export const postsRepository: PostsRepository = {
  async listPosts() {
    const [postsResult, associationsResult, profilesResult, snapshotsResult] = await Promise.all([
      supabase
        .from('instagram_posts')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false }),
      supabase
        .from('monitored_profile_posts')
        .select('*'),
      supabase
        .from('monitored_profiles')
        .select('*'),
      supabase
        .from('post_metric_snapshots')
        .select('*')
        .order('captured_at', { ascending: false })
        .order('created_at', { ascending: false }),
    ])

    if (postsResult.error) throw dataError(postsResult.error)
    if (associationsResult.error) throw dataError(associationsResult.error)
    if (profilesResult.error) throw dataError(profilesResult.error)
    if (snapshotsResult.error) throw dataError(snapshotsResult.error)

    const profilesById = new Map(
      profilesResult.data.map((profile) => [profile.id, toAssociatedProfile(profile)]),
    )

    const snapshotsByContext = new Map<
      string,
      { latest: PostMetricSnapshotRow; count: number }
    >()

    snapshotsResult.data.forEach((snapshot) => {
      const key = contextKey(snapshot.post_id, snapshot.monitored_profile_id)
      const current = snapshotsByContext.get(key)

      if (!current) {
        snapshotsByContext.set(key, { latest: snapshot, count: 1 })
        return
      }

      current.count += 1
    })

    const associationsByPostId = new Map<string, PostAssociation[]>()

    associationsResult.data.forEach((association: MonitoredProfilePostRow) => {
      const profile = profilesById.get(association.monitored_profile_id)
      if (!profile) return

      const context = snapshotsByContext.get(
        contextKey(association.instagram_post_id, association.monitored_profile_id),
      )

      const mappedAssociation: PostAssociation = {
        associationType: normalizeAssociationType(association.association_type),
        profile,
        latestMetrics: context ? toMetrics(context.latest) : null,
        snapshotCount: context?.count ?? 0,
      }

      const current = associationsByPostId.get(association.instagram_post_id)
      if (current) {
        current.push(mappedAssociation)
      } else {
        associationsByPostId.set(association.instagram_post_id, [mappedAssociation])
      }
    })

    return postsResult.data.map((post) =>
      toDomain(post, associationsByPostId.get(post.id) ?? []),
    )
  },
}
