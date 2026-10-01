import { AlertCircle, CirclePause, CirclePlay, Pencil, UserRound } from 'lucide-react'
import type { KeyboardEvent, MouseEvent } from 'react'
import {
  formatDateTime,
  formatFollowers,
  groupLabels,
  marketLabels,
  priorityLabels,
  profileStatusClass,
  profileStatusLabel,
} from '../features/profiles/presentation'
import type { MonitoredProfile } from '../features/profiles/types'

interface ProfileListTableProps {
  profiles: MonitoredProfile[]
  canEdit: boolean
  showGroup?: boolean
  onOpenDetails: (profile: MonitoredProfile) => void
  onEdit: (profile: MonitoredProfile) => void
  onToggleActive: (profile: MonitoredProfile) => void
}

export function ProfileListTable({
  profiles,
  canEdit,
  showGroup = true,
  onOpenDetails,
  onEdit,
  onToggleActive,
}: ProfileListTableProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>, profile: MonitoredProfile) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpenDetails(profile)
  }

  function stopAndRun(
    event: MouseEvent<HTMLButtonElement>,
    action: (profile: MonitoredProfile) => void,
    profile: MonitoredProfile,
  ) {
    event.stopPropagation()
    action(profile)
  }

  return (
    <div className="profiles-table-wrap">
      <table className="profiles-table">
        <thead>
          <tr>
            <th>Perfil</th>
            {showGroup ? <th>Grupo</th> : null}
            <th>Mercado</th>
            <th>Seguidores</th>
            <th>Status</th>
            <th>Última coleta</th>
            <th>Prioridade</th>
            {canEdit ? <th aria-label="Ações" /> : null}
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr
              key={profile.id}
              className="profile-row-clickable"
              role="button"
              tabIndex={0}
              aria-label={`Abrir detalhes de @${profile.instagramUsername}`}
              onClick={() => onOpenDetails(profile)}
              onKeyDown={(event) => handleKeyDown(event, profile)}
            >
              <td>
                <div className="profile-identity">
                  {profile.profilePictureUrl ? (
                    <img src={profile.profilePictureUrl} alt="" />
                  ) : (
                    <div className="profile-avatar-fallback">
                      <UserRound size={16} />
                    </div>
                  )}
                  <div>
                    <strong>{profile.displayName || `@${profile.instagramUsername}`}</strong>
                    <span>@{profile.instagramUsername}</span>
                  </div>
                </div>
              </td>
              {showGroup ? <td>{groupLabels[profile.profileGroup]}</td> : null}
              <td>{marketLabels[profile.primaryMarketCode] ?? profile.primaryMarketCode}</td>
              <td>{formatFollowers(profile.followersCount)}</td>
              <td>
                <div className="profile-status-cell">
                  <span className={`profile-badge ${profileStatusClass(profile)}`}>
                    {profile.monitoringStatus === 'error' && profile.active ? <AlertCircle size={12} /> : null}
                    {profileStatusLabel(profile, 'Aguardando primeira coleta')}
                  </span>
                  {canEdit && profile.monitoringStatus === 'error' && profile.lastCollectionError ? (
                    <details className="profile-error-details" onClick={(event) => event.stopPropagation()}>
                      <summary>Ver erro</summary>
                      <p>{profile.lastCollectionError}</p>
                    </details>
                  ) : null}
                </div>
              </td>
              <td>{formatDateTime(profile.lastCollectedAt, 'Aguardando primeira coleta')}</td>
              <td>{priorityLabels[profile.priority]}</td>
              {canEdit ? (
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      title="Editar"
                      onClick={(event) => stopAndRun(event, onEdit, profile)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      title={profile.active ? 'Pausar' : 'Reativar'}
                      onClick={(event) => stopAndRun(event, onToggleActive, profile)}
                    >
                      {profile.active ? <CirclePause size={15} /> : <CirclePlay size={15} />}
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
