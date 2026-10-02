import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { PostCard } from '../components/PostCard'
import { PostDetailDrawer } from '../components/PostDetailDrawer'
import { PostsToolbar } from '../components/PostsToolbar'
import { StatePanel } from '../components/StatePanel'
import { postsRepository } from '../features/posts/repository'
import type {
  PostAssociationType,
  PostContentType,
  PostLibraryItem,
  PostPeriod,
  PostSort,
} from '../features/posts/types'

function dateValue(value: string | null) {
  return value ? new Date(value).getTime() : null
}

function metricValue(post: PostLibraryItem, kind: 'likes' | 'comments') {
  if (!post.latestMetrics) return null
  return kind === 'likes' ? post.latestMetrics.likesCount : post.latestMetrics.commentsCount
}

function compareNullableDesc(a: number | null, b: number | null) {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return b - a
}

function matchesPeriod(post: PostLibraryItem, period: PostPeriod) {
  if (period === 'all') return true
  if (!post.publishedAt) return false

  const days = period === '30d' ? 30 : period === '90d' ? 90 : 365
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return new Date(post.publishedAt).getTime() >= cutoff
}

export default function Posts() {
  const { role } = useAuth()
  const [posts, setPosts] = useState<PostLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [contentType, setContentType] = useState<'all' | PostContentType>('all')
  const [profileId, setProfileId] = useState('all')
  const [association, setAssociation] = useState<'all' | PostAssociationType>('all')
  const [period, setPeriod] = useState<PostPeriod>('all')
  const [sort, setSort] = useState<PostSort>('recent')
  const [selectedPost, setSelectedPost] = useState<PostLibraryItem | null>(null)

  const loadPosts = useCallback(async () => {
    if (!role) {
      setPosts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      setPosts(await postsRepository.listPosts())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível carregar os conteúdos.')
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const filterProfiles = useMemo(() => {
    const byId = new Map<string, { id: string; label: string; username: string }>()

    posts.forEach((post) => {
      post.associations.forEach((item) => {
        if (byId.has(item.profile.id)) return
        byId.set(item.profile.id, {
          id: item.profile.id,
          label: item.profile.displayName || '@' + item.profile.instagramUsername,
          username: item.profile.instagramUsername,
        })
      })
    })

    return Array.from(byId.values()).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
  }, [posts])

  const counts = useMemo(() => ({
    total: posts.length,
    reels: posts.filter((post) => post.contentType === 'reel').length,
    images: posts.filter((post) => post.contentType === 'image').length,
    carousels: posts.filter((post) => post.contentType === 'carousel').length,
    videos: posts.filter((post) => post.contentType === 'video').length,
    others: posts.filter((post) => post.contentType === 'unknown').length,
  }), [posts])

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase()

    const result = posts.filter((post) => {
      const searchable = [
        post.caption ?? '',
        post.authorInstagramUsername ?? '',
        post.instagramShortcode ?? '',
        post.hashtags.join(' '),
      ].join(' ').toLowerCase()

      const matchesSearch = !term || searchable.includes(term)
      const matchesType = contentType === 'all' || post.contentType === contentType
      const matchesProfile =
        profileId === 'all' ||
        post.associations.some((item) => item.profile.id === profileId)
      const matchesAssociation =
        association === 'all' ||
        post.associations.some((item) => item.associationType === association)

      return matchesSearch &&
        matchesType &&
        matchesProfile &&
        matchesAssociation &&
        matchesPeriod(post, period)
    })

    return result.slice().sort((a, b) => {
      if (sort === 'likes') {
        return compareNullableDesc(metricValue(a, 'likes'), metricValue(b, 'likes'))
      }

      if (sort === 'comments') {
        return compareNullableDesc(metricValue(a, 'comments'), metricValue(b, 'comments'))
      }

      const aDate = dateValue(a.publishedAt)
      const bDate = dateValue(b.publishedAt)

      if (aDate === null && bDate === null) return 0
      if (aDate === null) return 1
      if (bDate === null) return -1

      return sort === 'oldest' ? aDate - bDate : bDate - aDate
    })
  }, [posts, search, contentType, profileId, association, period, sort])

  return (
    <div className="page">
      <PageHeader
        eyebrow="Content evidence"
        title="Biblioteca de Conteúdos"
        description="Posts e Reels reais monitorados, com autoria, associações e a observação mais recente de métricas."
      />

      {!role ? (
        <StatePanel
          state="error"
          title="Usuário sem papel de negócio"
          description="Sua sessão está autenticada, mas trend_radar_role não é viewer, editor ou admin."
        />
      ) : (
        <>
          <PostsToolbar
            search={search}
            contentType={contentType}
            profileId={profileId}
            association={association}
            period={period}
            sort={sort}
            profiles={filterProfiles}
            onSearchChange={setSearch}
            onContentTypeChange={setContentType}
            onProfileChange={setProfileId}
            onAssociationChange={setAssociation}
            onPeriodChange={setPeriod}
            onSortChange={setSort}
          />

          {error ? (
            <StatePanel state="error" title="Erro ao carregar conteúdos" description={error} />
          ) : loading ? (
            <StatePanel state="loading" />
          ) : posts.length === 0 ? (
            <StatePanel
              state="empty"
              title="Nenhum conteúdo monitorado ainda."
              description="Os conteúdos aparecerão aqui após a coleta dos perfis monitorados."
            />
          ) : (
            <section className="posts-library-panel">
              <div className="posts-library-header">
                <div>
                  <span className="eyebrow">Biblioteca</span>
                  <h2>{counts.total} {counts.total === 1 ? 'conteúdo' : 'conteúdos'}</h2>
                </div>
                <div className="post-count-chips" aria-label="Distribuição por tipo">
                  {counts.reels ? <span>{counts.reels} Reels</span> : null}
                  {counts.images ? <span>{counts.images} Imagens</span> : null}
                  {counts.carousels ? <span>{counts.carousels} Carrosséis</span> : null}
                  {counts.videos ? <span>{counts.videos} Vídeos</span> : null}
                  {counts.others ? <span>{counts.others} Outros</span> : null}
                </div>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="posts-empty-filter">
                  <StatePanel
                    state="empty"
                    title="Nenhum conteúdo corresponde aos filtros."
                    description="Ajuste a busca ou os filtros para navegar pelos conteúdos monitorados."
                  />
                </div>
              ) : (
                <div className="posts-grid">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} onOpen={setSelectedPost} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      <PostDetailDrawer post={selectedPost} onClose={() => setSelectedPost(null)} />
    </div>
  )
}
