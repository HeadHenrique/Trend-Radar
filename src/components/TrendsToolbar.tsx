import { ChevronDown, Search } from 'lucide-react'
import type {
  TrendPeriod,
  TrendProfileMetadata,
  TrendSort,
} from '../features/trends/types'

interface TrendsToolbarProps {
  search: string
  profileId: string
  period: TrendPeriod
  sort: TrendSort
  profiles: TrendProfileMetadata[]
  viewsAvailable: boolean
  onSearchChange: (value: string) => void
  onProfileChange: (value: string) => void
  onPeriodChange: (value: TrendPeriod) => void
  onSortChange: (value: TrendSort) => void
}

export function TrendsToolbar({
  search,
  profileId,
  period,
  sort,
  profiles,
  viewsAvailable,
  onSearchChange,
  onProfileChange,
  onPeriodChange,
  onSortChange,
}: TrendsToolbarProps) {
  return (
    <section className="trends-toolbar" aria-label="Filtros de Tendências">
      <label className="search-control trends-search">
        <Search size={15} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar legenda, autor, username, shortcode ou hashtag"
        />
      </label>

      <label className="toolbar-select">
        <span>Perfil</span>
        <select value={profileId} onChange={(event) => onProfileChange(event.target.value)}>
          <option value="all">Todos os perfis</option>
          {profiles.map((profile) => (
            <option value={profile.id} key={profile.id}>
              {profile.displayName || '@' + profile.instagramUsername} (@{profile.instagramUsername})
            </option>
          ))}
        </select>
        <ChevronDown size={13} />
      </label>

      <label className="toolbar-select">
        <span>Formato</span>
        <select value="reel" disabled aria-label="Formato fixo: Reels">
          <option value="reel">Reels</option>
        </select>
        <ChevronDown size={13} />
      </label>

      <label className="toolbar-select">
        <span>Período</span>
        <select value={period} onChange={(event) => onPeriodChange(event.target.value as TrendPeriod)}>
          <option value="7d">7 dias</option>
          <option value="30d">30 dias</option>
          <option value="90d">90 dias</option>
          <option value="all">Todo período</option>
        </select>
        <ChevronDown size={13} />
      </label>

      <label className="toolbar-select">
        <span>Ordenar por</span>
        <select value={sort} onChange={(event) => onSortChange(event.target.value as TrendSort)}>
          <option value="highlight">Em destaque</option>
          <option value="engagement">Mais engajados</option>
          <option value="likes">Mais curtidos</option>
          <option value="comments">Mais comentados</option>
          <option value="recent">Mais recentes</option>
          <option value="views" disabled={!viewsAvailable}>
            Mais visualizados{viewsAvailable ? '' : ' — indisponível'}
          </option>
        </select>
        <ChevronDown size={13} />
      </label>
    </section>
  )
}
