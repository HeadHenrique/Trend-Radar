import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { session, signIn, loading: sessionLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!sessionLoading && session) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await signIn(email.trim(), password)
      const destination =
        typeof location.state === 'object' &&
        location.state &&
        'from' in location.state &&
        typeof location.state.from === 'string'
          ? location.state.from
          : '/dashboard'

      navigate(destination, { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <div className="brand-mark"><Compass size={19} /></div>
          <div>
            <strong>CALIBER</strong>
            <span>ORBIT</span>
          </div>
        </div>

        <span className="eyebrow">Acesso interno</span>
        <h1>Entrar</h1>
        <p>Use o e-mail e a senha do usuário autorizado no Supabase Auth.</p>

        <label className="form-field">
          <span>E-mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Senha</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <div className="form-error">{error}</div> : null}

        <button className="primary-button" type="submit" disabled={submitting || sessionLoading}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
