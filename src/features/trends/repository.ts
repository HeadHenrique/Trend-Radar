import { supabase } from '../../lib/supabase'
import type {
  InstagramPostRow,
  MonitoredProfilePostRow,
  MonitoredProfileRow,
  PostAssociation,
  PostAssociationType,
  PostLibraryItem,
  PostMetricSnapshotRow,
  PostMetrics,
} from '../posts/types'
import type {
  TrendBaseline,
  TrendMarket,
  TrendProfileMetadata,
  TrendRankingContext,
  TrendReelAssociation,
  TrendReelItem,
  TrendsDataset,
  TrendsRepository,
} from './types'

const MIN_BASELINE_SAMPLE = 5
const RECENT_DAYS = 7

function dataError(error: { message: string }) {
  return new Error(error.message)
}

function normalizeAssociationType(value: string): PostAssociationType {
  if (value === 'author' || value === 'collaborator') return value
  return 'discovered'
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

function toProfileMetadata(row: MonitoredProfileRow): TrendProfileMetadata {
  return {
    id: row.id,
    instagramUsername: row.instagram_username,
    displayName: row.display_name,
    profilePictureUrl: row.profile_picture_url,
    market: row.primary_market_code,
    profileGroup: row.profile_group,
    niche: row.niche,
    category: row.category,
    tags: row.tags,
  }
}

function contextKey(postId: string, profileId: string) {
  return postId + ':' + profileId
}

function observedInteractions(metrics: PostMetrics | null) {
  if (!metrics || metrics.likesCount === null || metrics.commentsCount === null) return null
  return metrics.likesCount + metrics.commentsCount
}

function median(values: number[]) {
  if (!values.length) return null
  const sorted = values.slice().sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

function isRecent(publishedAt: string | null) {
  if (!publishedAt) return false
  const published = new Date(publishedAt).getTime()
  if (!Number.isFinite(published)) return false
  return published >= Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000
}

function toBasicAssociation(association: TrendReelAssociation): PostAssociation {
  return {
    associationType: association.associationType,
    profile: {
      id: association.profile.id,
      instagramUsername: association.profile.instagramUsername,
      displayName: association.profile.displayName,
      profilePictureUrl: association.profile.profilePictureUrl,
    },
    latestMetrics: association.latestMetrics,
    snapshotCount: association.snapshotCount,
  }
}

function toPostDomain(row: InstagramPostRow, associations: TrendReelAssociation[]): PostLibraryItem {
  const basicAssociations = associations.map(toBasicAssociation)
  const newestMetrics = basicAssociations.reduce<PostMetrics | null>((latest, association) => {
    const candidate = association.latestMetrics
    if (!candidate) return latest
    if (!latest) return candidate

    return new Date(candidate.capturedAt).getTime() > new Date(latest.capturedAt).getTime()
      ? candidate
      : latest
  }, null)

  return {
    id: row.id,
    instagramMediaId: row.instagram_media_id,
    instagramShortcode: row.instagram_shortcode,
    permalink: row.permalink,
    publishedAt: row.published_at,
    caption: row.caption,
    contentType: 'reel',
    durationSeconds: row.duration_seconds,
    audioName: row.audio_name,
    thumbnailUrl: row.thumbnail_url,
    authorInstagramUsername: row.author_instagram_username,
    authorInstagramExternalId: row.author_instagram_external_id,
    hashtags: row.hashtags ?? [],
    associations: basicAssociations,
    latestMetrics: newestMetrics,
    snapshotCount: basicAssociations.reduce((total, association) => total + association.snapshotCount, 0),
  }
}

interface ProfileMetricContext {
  postId: string
  metrics: PostMetrics
}

function buildBaseline(
  profileId: string,
  postId: string,
  metricsByProfile: Map<string, ProfileMetricContext[]>,
): TrendBaseline | null {
  const peers = (metricsByProfile.get(profileId) ?? []).filter((item) => item.postId !== postId)

  const likes = peers
    .map((item) => item.metrics.likesCount)
    .filter((value): value is number => value !== null)

  const comments = peers
    .map((item) => item.metrics.commentsCount)
    .filter((value): value is number => value !== null)

  const interactions = peers
    .map((item) => observedInteractions(item.metrics))
    .filter((value): value is number => value !== null)

  const medianLikes = likes.length >= MIN_BASELINE_SAMPLE ? median(likes) : null
  const medianComments = comments.length >= MIN_BASELINE_SAMPLE ? median(comments) : null
  const medianObservedInteractions =
    interactions.length >= MIN_BASELINE_SAMPLE ? median(interactions) : null

  if (medianLikes === null && medianComments === null && medianObservedInteractions === null) {
    return null
  }

  return {
    monitoredProfileId: profileId,
    sampleSize: interactions.length,
    medianLikes,
    medianComments,
    medianObservedInteractions,
  }
}

function buildRankingContext(
  row: InstagramPostRow,
  association: TrendReelAssociation | null,
  metricsByProfile: Map<string, ProfileMetricContext[]>,
): TrendRankingContext {
  const metrics = association?.latestMetrics ?? null
  const interactions = observedInteractions(metrics)
  const baseline = association
    ? buildBaseline(association.profile.id, row.id, metricsByProfile)
    : null

  const recent = isRecent(row.published_at)
  const completeMetrics = interactions !== null
  const medianInteractions = baseline?.medianObservedInteractions ?? null
  const aboveBaseline =
    interactions !== null &&
    medianInteractions !== null &&
    interactions > medianInteractions

  const interactionLift =
    interactions !== null &&
    medianInteractions !== null &&
    medianInteractions > 0
      ? interactions / medianInteractions
      : null

  const highInteraction =
    interactionLift !== null && interactionLift >= 1.5

  const reasons: string[] = []

  if (recent) reasons.push('Publicado recentemente')

  if (
    metrics?.likesCount !== null &&
    metrics?.likesCount !== undefined &&
    baseline?.medianLikes !== null &&
    baseline?.medianLikes !== undefined &&
    metrics.likesCount > baseline.medianLikes
  ) {
    reasons.push('Curtidas acima da mediana dos Reels deste perfil')
  }

  if (
    metrics?.commentsCount !== null &&
    metrics?.commentsCount !== undefined &&
    baseline?.medianComments !== null &&
    baseline?.medianComments !== undefined &&
    metrics.commentsCount > baseline.medianComments
  ) {
    reasons.push('Comentários acima do baseline observado')
  }

  if (!reasons.length && completeMetrics) {
    reasons.push('Curtidas e comentários observados')
  }

  if (!reasons.length && metrics) {
    reasons.push('Há métricas observadas, mas sem baseline suficiente')
  }

  if (!reasons.length) {
    reasons.push('Destaque limitado à recência e aos dados disponíveis')
  }

  return {
    recent,
    completeMetrics,
    aboveBaseline,
    highInteraction,
    interactionLift,
    baseline,
    reasons,
  }
}

function choosePrimaryAssociation(associations: TrendReelAssociation[]) {
  if (!associations.length) return null

  return associations.slice().sort((a, b) => {
    const aComplete = observedInteractions(a.latestMetrics) !== null ? 1 : 0
    const bComplete = observedInteractions(b.latestMetrics) !== null ? 1 : 0

    if (aComplete !== bComplete) return bComplete - aComplete

    const aTime = a.latestMetrics ? new Date(a.latestMetrics.capturedAt).getTime() : 0
    const bTime = b.latestMetrics ? new Date(b.latestMetrics.capturedAt).getTime() : 0
    return bTime - aTime
  })[0]
}

function isSupportedMarket(value: string): value is TrendMarket {
  return value === 'BR' || value === 'US'
}

export const trendsRepository: TrendsRepository = {
  async listReels(): Promise<TrendsDataset> {
    const [postsResult, associationsResult, profilesResult, snapshotsResult] = await Promise.all([
      supabase
        .from('instagram_posts')
        .select('*')
        .eq('content_type', 'reel')
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

    const storagePaths = Array.from(new Set(
      postsResult.data
        .map((post) => post.video_storage_path)
        .filter((path): path is string => Boolean(path)),
    ))

    const signedUrlsByPath = new Map<string, string>()

    if (storagePaths.length) {
      const signedResult = await supabase.storage
        .from('reel-media-cache')
        .createSignedUrls(storagePaths, 60 * 60)

      if (!signedResult.error) {
        signedResult.data.forEach((entry) => {
          if (entry.path && entry.signedUrl) {
            signedUrlsByPath.set(entry.path, entry.signedUrl)
          }
        })
      }
    }

    const profiles = profilesResult.data.map(toProfileMetadata)
    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]))

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

    const associationsByPostId = new Map<string, TrendReelAssociation[]>()
    const reelPostIds = new Set(postsResult.data.map((post) => post.id))
    const metricsByProfile = new Map<string, ProfileMetricContext[]>()

    associationsResult.data.forEach((association: MonitoredProfilePostRow) => {
      if (!reelPostIds.has(association.instagram_post_id)) return

      const profile = profilesById.get(association.monitored_profile_id)
      if (!profile) return

      const snapshotContext = snapshotsByContext.get(
        contextKey(association.instagram_post_id, association.monitored_profile_id),
      )

      const latestMetrics = snapshotContext ? toMetrics(snapshotContext.latest) : null
      const mapped: TrendReelAssociation = {
        associationType: normalizeAssociationType(association.association_type),
        profile,
        latestMetrics,
        snapshotCount: snapshotContext?.count ?? 0,
      }

      const current = associationsByPostId.get(association.instagram_post_id)
      if (current) current.push(mapped)
      else associationsByPostId.set(association.instagram_post_id, [mapped])

      if (latestMetrics) {
        const profileMetrics = metricsByProfile.get(profile.id)
        const context = { postId: association.instagram_post_id, metrics: latestMetrics }
        if (profileMetrics) profileMetrics.push(context)
        else metricsByProfile.set(profile.id, [context])
      }
    })

    const items: TrendReelItem[] = []

    postsResult.data.forEach((post) => {
      const allAssociations = associationsByPostId.get(post.id) ?? []
      const postDomain = toPostDomain(post, allAssociations)

      const byMarket = new Map<TrendMarket, TrendReelAssociation[]>()

      allAssociations.forEach((association) => {
        if (!isSupportedMarket(association.profile.market)) return
        const current = byMarket.get(association.profile.market)
        if (current) current.push(association)
        else byMarket.set(association.profile.market, [association])
      })

      byMarket.forEach((marketAssociations, market) => {
        const primaryAssociation = choosePrimaryAssociation(marketAssociations)
        const latestMetrics = primaryAssociation?.latestMetrics ?? null

        items.push({
          id: post.id + ':' + market,
          post: postDomain,
          author: {
            instagramUsername: post.author_instagram_username,
            instagramExternalId: post.author_instagram_external_id,
          },
          associations: marketAssociations,
          market,
          profileMetadata: marketAssociations.map((association) => association.profile),
          primaryAssociationProfileId: primaryAssociation?.profile.id ?? null,
          latestMetrics,
          videoStoragePath: post.video_storage_path,
          videoCachedAt: post.video_cached_at,
          videoPlaybackUrl: post.video_storage_path
            ? signedUrlsByPath.get(post.video_storage_path) ?? null
            : null,
          observedInteractions: observedInteractions(latestMetrics),
          rankingContext: buildRankingContext(post, primaryAssociation, metricsByProfile),
        })
      })
    })

    return { items, profiles }
  },
}
