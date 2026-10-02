import {
  Bell,
  ChartNoAxesCombined,
  Crosshair,
  FileText,
  Gauge,
  Globe2,
  LogOut,
  Settings,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useSupabaseHealth } from '../hooks/useSupabaseHealth'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/trends', label: 'Tendências', icon: ChartNoAxesCombined },
  { to: '/competitors', label: 'Concorrentes', icon: Crosshair },
  { to: '/usa', label: 'EUA', icon: Globe2 },
  { to: '/profiles', label: 'Perfis', icon: UsersRound },
  { to: '/posts', label: 'Posts', icon: FileText },
  { to: '/opportunities', label: 'Oportunidades', icon: Sparkles },
  { to: '/alerts', label: 'Alertas', icon: Bell },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

export function Layout() {
  const health = useSupabaseHealth()
  const { user, role, signOut } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src="/caliber-orbit-logo.webp" alt="Caliber Orbit" />
        </div>

        <nav>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className={`connection-pill ${health.status}`}>
            <span />
            {health.status === 'loading'
              ? 'Conectando'
              : health.status === 'success'
                ? 'Supabase conectado'
                : 'Falha na conexão'}
          </div>
          <small>{role ? `Papel: ${role}` : 'Sem papel de negócio'}</small>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">Inteligência executiva</span>
            <strong>Caliber Trend Radar</strong>
          </div>

          <div className="topbar-user">
            <div>
              <strong>{user?.email ?? 'Usuário interno'}</strong>
              <span>{role ?? 'sem acesso de negócio'}</span>
            </div>
            <button className="icon-button" type="button" onClick={() => void signOut()} aria-label="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}
