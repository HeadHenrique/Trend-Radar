import type {
  MonitoredProfile,
  PostAssociationType,
  ProfileGroup,
  ProfilePriority,
} from './types'

export const groupLabels: Record<ProfileGroup, string> = {
  own: 'Próprio',
  competitor: 'Concorrente',
  reference: 'Referência',
  trendsetter: 'Trendsetter',
}

export const marketLabels: Record<string, string> = {
  BR: 'Brasil',
  US: 'Estados Unidos',
}

export const priorityLabels: Record<ProfilePriority, string> = {
  1: 'Alta',
  2: 'Média',
  3: 'Baixa',
}

export const associationLabels: Record<PostAssociationType, string> = {
  author: 'Autor',
  collaborator: 'Collab',
  discovered: 'Descoberto',
}

export function roleCanEdit(role: string | null) {
  return role === 'editor' || role === 'admin'
}

export function formatFollowers(value: number | null) {
  if (value === null) return 'Dados insuficientes'
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatDateTime(value: string | null, empty = 'Não informado') {
  if (!value) return empty

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatDate(value: string | null, empty = 'Não informado') {
  if (!value) return empty

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(value))
}

export function profileStatusLabel(profile: MonitoredProfile, pendingLabel = 'Pendente') {
  if (!profile.active) return 'Pausado'
  if (profile.monitoringStatus === 'pending') return pendingLabel
  if (profile.monitoringStatus === 'error') return 'Erro'
  return 'Saudável'
}

export function profileStatusClass(profile: MonitoredProfile) {
  if (!profile.active) return 'paused'
  return profile.monitoringStatus
}
