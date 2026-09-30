import {
  Bell,
  ChartNoAxesCombined,
  Compass,
  Crosshair,
  FileText,
  Gauge,
  Globe2,
  Settings,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Compass size={19} /></div>
          <div>
            <strong>CALIBER</strong>
            <span>TREND RADAR</span>
          </div>
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
          <small>Instagram Social Intelligence</small>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">Inteligência executiva</span>
            <strong>Caliber Trend Radar</strong>
          </div>
          <div className="topbar-meta">
            <span>Brasil</span>
            <span>•</span>
            <span>Estados Unidos</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
