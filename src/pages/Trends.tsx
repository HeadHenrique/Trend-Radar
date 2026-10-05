import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { PostDetailDrawer } from '../components/PostDetailDrawer'
import { StatePanel } from '../components/StatePanel'
import { TrendReelCard } from '../components/TrendReelCard'
import { TrendsToolbar } from '../components/TrendsToolbar'
import {
  compareTrendReels,
  matchesTrendNiche,
  trendNicheOptions,
} from '../features/trends/presentation'
import { trendsRepository } from '../features/trends/repository'
import type {
  TrendMarket,
  TrendNicheKey,
  TrendPeriod,
  TrendReelItem,
  TrendSort,
  TrendsDataset,
} from '../features/trends/types'

function matchesPeriod(item: TrendReelItem, period: TrendPeriod) {
  if (period === 'all') return true
  if (!item.post.publishedAt) return false

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return new Date(item.post.publishedAt).getTime() >= cutoff
}

export default function Trends() {
  const { role } = useAuth()
  const [dataset, setDataset] = useState<TrendsDataset>({ items: [], profiles: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [market, setMarket] = useState<TrendMarket>('BR')
  const [niche, setNiche] = useState<TrendNicheKey>('all')
  const [search, setSearch] = useState('')
  const [profileId, setProfileId] = useState('all')
  const [period, setPeriod] = useState<TrendPeriod>('all')
  const [sort, setSort] = useState<TrendSort>('highlight')
  const [selectedReel, setSelectedReel] = useState<TrendReelItem | null>(null)
  const [playingReelId, setPlayingReelId] = useState<string | null>(null)

  const loadReels = useCallback(async () => {
    if (!role) {
      setDataset({ items: [], profiles: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      setDataset(await trendsRepository.listReels())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível carregar os Reels.')
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    void loadReels()
  }, [loadReels])

  useEffect(() => {
    setProfileId('all')
    setSelectedReel(null)
    setPlayingReelId(null)
  }, [market])

  const marketProfiles = useMemo(
    () => dataset.profiles
      .filter((profile) => profile.market === market)
      .sort((a, b) => {
        const aLabel = a.displayName || a.instagramUsername
        const bLabel = b.displayName || b.instagramUsername
        return aLabel.localeCompare(bLabel, 'pt-BR')
      }),
    [dataset.profiles, market],
  )

  const marketReels = useMemo(
    () => dataset.items.filter((item) => item.market === market),
    [dataset.items, market],
  )

  const viewsAvailable = useMemo(
    () => marketReels.some((item) => item.latestMetrics?.viewsCount !== null &&
      item.latestMetrics?.viewsCount !== undefined),
    [marketReels],
  )

  useEffect(() => {
    if (!viewsAvailable && sort === 'views') setSort('highlight')
  }, [sort, viewsAvailable])

  const filteredReels = useMemo(() => {
    const term = search.trim().toLowerCase()

    return marketReels
      .filter((item) => {
        const searchable = [
          item.post.caption ?? '',
          item.author.instagramUsername ?? '',
          item.post.instagramShortcode ?? '',
          item.post.hashtags.join(' '),
          ...item.profileMetadata.flatMap((profile) => [
            profile.instagramUsername,
            profile.displayName ?? '',
          ]),
        ].join(' ').toLowerCase()

        const matchesSearch = !term || searchable.includes(term)
        const matchesProfile =
          profileId === 'all' ||
          item.associations.some((association) => association.profile.id === profileId)

        return matchesSearch &&
          matchesProfile &&
          matchesPeriod(item, period) &&
          matchesTrendNiche(item, niche)
      })
      .sort((a, b) => compareTrendReels(a, b, sort))
  }, [marketReels, niche, period, profileId, search, sort])

  useEffect(() => {
    if (
      playingReelId &&
      !filteredReels.some((item) => item.id === playingReelId)
    ) {
      setPlayingReelId(null)
    }
  }, [filteredReels, playingReelId])

  const completeMetricsCount = useMemo(
    () => filteredReels.filter((item) => item.observedInteractions !== null).length,
    [filteredReels],
  )

  function handleOpenReel(item: TrendReelItem) {
    setPlayingReelId(null)
    setSelectedReel(item)
  }

  function handlePlayReel(item: TrendReelItem) {
    setPlayingReelId(item.id)
  }

  const hasMarketProfiles = marketProfiles.length > 0
  const hasMarketReels = marketReels.length > 0

  return (
    <div className="page trends-reels-page">
      <PageHeader
        eyebrow="Radar de conteúdo"
        title="Tendências"
        description="Descubra os Reels e movimentos que estão ganhando atenção no mercado empresarial."
      />

      {!role ? (
        <StatePanel
          state="error"
          title="Usuário sem papel de negócio"
          description="Sua sessão está autenticada, mas trend_radar_role não é viewer, editor ou admin."
        />
      ) : (
        <>
          <section className="trends-market-section" aria-label="Mercado">
            <div className="trends-market-tabs" role="tablist" aria-label="Selecionar mercado">
              <button
                type="button"
                role="tab"
                aria-selected={market === 'BR'}
                className={market === 'BR' ? 'active' : ''}
                onClick={() => setMarket('BR')}
              >
                Brasil
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={market === 'US'}
                className={market === 'US' ? 'active' : ''}
                onClick={() => setMarket('US')}
              >
                EUA
              </button>
            </div>

            <div className="trend-niche-chips" aria-label="Filtrar por nicho">
              {trendNicheOptions.map((option) => (
                <button
                  type="button"
                  key={option.key}
                  aria-pressed={niche === option.key}
                  className={niche === option.key ? 'active' : ''}
                  onClick={() => setNiche(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <TrendsToolbar
            search={search}
            profileId={profileId}
            period={period}
            sort={sort}
            profiles={marketProfiles}
            viewsAvailable={viewsAvailable}
            onSearchChange={setSearch}
            onProfileChange={setProfileId}
            onPeriodChange={setPeriod}
            onSortChange={setSort}
          />

          {error ? (
            <StatePanel state="error" title="Erro ao carregar Tendências" description={error} />
          ) : loading ? (
            <StatePanel state="loading" />
          ) : market === 'US' && !hasMarketProfiles ? (
            <StatePanel
              state="empty"
              title="Nenhuma referência dos EUA monitorada ainda."
              description="Adicione referências e trendsetters americanos para começar a acompanhar sinais do mercado dos EUA."
            />
          ) : !hasMarketReels ? (
            <StatePanel
              state="empty"
              title="Os Reels aparecerão após a primeira coleta."
              description="Há perfis monitorados neste mercado, mas nenhum Reel real foi coletado ainda."
            />
          ) : (
            <section className="trends-reels-library">
              <div className="trends-reels-summary" aria-label="Resumo dos Reels">
                <div>
                  <span>Reels encontrados</span>
                  <strong>{filteredReels.length}</strong>
                </div>
                <div>
                  <span>Perfis monitorados</span>
                  <strong>{marketProfiles.length}</strong>
                </div>
                <div>
                  <span>Métricas completas</span>
                  <strong>{completeMetricsCount}</strong>
                </div>
              </div>

              <div className="trends-reels-heading">
                <div>
                  <span className="eyebrow">Sinais observáveis</span>
                  <h2>{market === 'BR' ? 'Reels do Brasil' : 'Reels dos EUA'}</h2>
                </div>
                <div className="trends-coverage-note">
                  <span>{viewsAvailable ? 'Views disponíveis no recorte' : 'Views ainda indisponíveis'}</span>
                </div>
              </div>

              {filteredReels.length === 0 ? (
                <div className="trends-reels-empty">
                  <StatePanel
                    state="empty"
                    title="Nenhum Reel corresponde aos filtros."
                    description="Ajuste busca, nicho, perfil ou período para ampliar o recorte."
                  />
                </div>
              ) : (
                <div className="trends-reels-grid">
                  {filteredReels.map((item) => (
                    <TrendReelCard
                      key={item.id}
                      item={item}
                      isPlaying={playingReelId === item.id}
                      onOpen={handleOpenReel}
                      onPlay={handlePlayReel}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      <PostDetailDrawer
        post={selectedReel?.post ?? null}
        trendItem={selectedReel}
        onClose={() => setSelectedReel(null)}
      />
    </div>
  )
}
