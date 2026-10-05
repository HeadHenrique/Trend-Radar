import type { PostMetricSnapshotRow, PostMetrics } from './types'

function snapshotTime(row: PostMetricSnapshotRow) {
  const captured = Date.parse(row.captured_at)
  if (Number.isFinite(captured)) return captured

  const created = row.created_at ? Date.parse(row.created_at) : Number.NaN
  return Number.isFinite(created) ? created : 0
}

function latestTimestamp(values: string[]) {
  return values.reduce((latest, current) => {
    return Date.parse(current) > Date.parse(latest) ? current : latest
  })
}

export function aggregateObservedMetrics(
  rows: PostMetricSnapshotRow[],
): PostMetrics | null {
  if (!rows.length) return null

  const sorted = rows.slice().sort((a, b) => {
    const timeDelta = snapshotTime(b) - snapshotTime(a)
    if (timeDelta !== 0) return timeDelta
    return String(b.id).localeCompare(String(a.id))
  })

  let likesCount: number | null = null
  let commentsCount: number | null = null
  let viewsCount: number | null = null
  let playsCount: number | null = null
  let sharesCount: number | null = null
  let savesCount: number | null = null

  const observedAt: string[] = []

  for (const row of sorted) {
    if (likesCount === null && row.likes_count !== null) {
      likesCount = row.likes_count
      observedAt.push(row.captured_at)
    }

    if (commentsCount === null && row.comments_count !== null) {
      commentsCount = row.comments_count
      observedAt.push(row.captured_at)
    }

    if (viewsCount === null && row.views_count !== null) {
      viewsCount = row.views_count
      observedAt.push(row.captured_at)
    }

    if (playsCount === null && row.plays_count !== null) {
      playsCount = row.plays_count
      observedAt.push(row.captured_at)
    }

    if (sharesCount === null && row.shares_count !== null) {
      sharesCount = row.shares_count
      observedAt.push(row.captured_at)
    }

    if (savesCount === null && row.saves_count !== null) {
      savesCount = row.saves_count
      observedAt.push(row.captured_at)
    }

    if (
      likesCount !== null &&
      commentsCount !== null &&
      viewsCount !== null &&
      playsCount !== null &&
      sharesCount !== null &&
      savesCount !== null
    ) {
      break
    }
  }

  if (
    likesCount === null &&
    commentsCount === null &&
    viewsCount === null &&
    playsCount === null &&
    sharesCount === null &&
    savesCount === null
  ) {
    return null
  }

  return {
    monitoredProfileId: sorted[0].monitored_profile_id,
    likesCount,
    commentsCount,
    viewsCount,
    playsCount,
    sharesCount,
    savesCount,
    capturedAt: latestTimestamp(observedAt),
  }
}
