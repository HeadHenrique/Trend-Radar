import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { session, role, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <span className="eyebrow">Caliber Trend Radar</span>
          <h1>Carregando sessão</h1>
          <p>Validando seu acesso ao ambiente interno.</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!role) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <span className="eyebrow">Segurança</span>
          <h1>Acesso não autorizado</h1>
          <p>
            Sua sessão é válida, mas o usuário não possui um
            trend_radar_role autorizado. Solicite acesso a um administrador.
          </p>
          <button className="secondary-button" type="button" onClick={() => void signOut()}>
            Sair
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
