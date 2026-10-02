import { ChevronDown, Search } from 'lucide-react'
import type {
  PostAssociationType,
  PostContentType,
  PostPeriod,
  PostSort,
} from '../features/posts/types'

export interface PostsToolbarProfile {
  id: string
  label: string
  username: string
}

interface PostsToolbarProps {
  search: string
  contentType: 'all' | PostContentType
  profileId: string
  association: 'all' | PostAssociationType
  period: PostPeriod
  sort: PostSort
  profiles: PostsToolbarProfile[]
  onSearchChange: (value: string) => void
  onContentTypeChange: (value: 'all' | PostContentType) => void
  onProfileChange: (value: string) => void
  onAssociationChange: (value: 'all' | PostAssociationType) => void
  onPeriodChange: (value: PostPeriod) => void
  onSortChange: (value: PostSort) => void
}

export function PostsToolbar({
  search,
  contentType,
  profileId,
  association,
  period,
  sort,
  profiles,
  onSearchChange,
  onContentTypeChange,
  onProfileChange,
  onAssociationChange,
  onPeriodChange,
  onSortChange,
}: PostsToolbarProps) {
  return (
    <section className="posts-toolbar" aria-label="Filtros da biblioteca">
      <label className="search-control posts-search">
        <Search size={15} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar legenda, autor, shortcode ou hashtag"
        />
      </label>

      <label className="toolbar-select">
        <span>Tipo</span>
        <select
          value={contentType}
          onChange={(event) => onContentTypeChange(event.target.value as 'all' | PostContentType)}
        >
          <option value="all">Todos</option>
          <option value="reel">Reels</option>
          <option value="carousel">Carrossel</option>
          <option value="image">Imagem</option>
          <option value="video">Vídeo</option>
        </select>
        <ChevronDown size={13} />
      </label>

      <label className="toolbar-select">
        <span>Perfil</span>
        <select value={profileId} onChange={(event) => onProfileChange(event.target.value)}>
          <option value="all">Todos</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.label} (@{profile.username})
            </option>
          ))}
        </select>
        <ChevronDown size={13} />
      </label>

      <label className="toolbar-select">
        <span>Associação</span>
        <select
          value={association}
          onChange={(event) => onAssociationChange(event.target.value as 'all' | PostAssociationType)}
        >
          <option value="all">Todas</option>
          <option value="author">Autor</option>
          <option value="collaborator">Collab</option>
          <option value="discovered">Descoberto</option>
        </select>
        <ChevronDown size={13} />
      </label>

      <label className="toolbar-select">
        <span>Período</span>
        <select value={period} onChange={(event) => onPeriodChange(event.target.value as PostPeriod)}>
          <option value="all">Todo período</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
          <option value="365d">Último ano</option>
        </select>
        <ChevronDown size={13} />
      </label>

      <label className="toolbar-select">
        <span>Ordenação</span>
        <select value={sort} onChange={(event) => onSortChange(event.target.value as PostSort)}>
          <option value="recent">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
          <option value="likes">Mais curtidos</option>
          <option value="comments">Mais comentados</option>
        </select>
        <ChevronDown size={13} />
      </label>
    </section>
  )
}
