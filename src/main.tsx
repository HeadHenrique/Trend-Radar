import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('[Trend Radar] Elemento #root não encontrado.')
}

const root = createRoot(rootElement)

function ConfigError({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <div className="auth-screen">
        <div className="auth-card">
          <span className="eyebrow">Configuração</span>
          <h1>Trend Radar não conseguiu iniciar</h1>
          <p>{children}</p>
        </div>
      </div>
    </StrictMode>
  )
}

function validateEnvironment() {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!projectUrl || !publishableKey) {
    const missing = [
      !projectUrl ? 'VITE_SUPABASE_URL' : null,
      !publishableKey ? 'VITE_SUPABASE_PUBLISHABLE_KEY' : null,
    ].filter(Boolean)

    return `Variáveis ausentes na Vercel: ${missing.join(', ')}. Configure o ambiente Production e faça um novo deploy.`
  }

  try {
    new URL(projectUrl)
  } catch {
    return 'VITE_SUPABASE_URL possui um valor inválido.'
  }

  if (!publishableKey.startsWith('sb_publishable_')) {
    return 'VITE_SUPABASE_PUBLISHABLE_KEY não parece ser uma publishable key válida.'
  }

  return null
}

async function bootstrap() {
  const environmentError = validateEnvironment()

  if (environmentError) {
    root.render(<ConfigError>{environmentError}</ConfigError>)
    return
  }

  try {
    const [{ default: App }, { AuthProvider }] = await Promise.all([
      import('./App'),
      import('./auth/AuthContext'),
    ])

    root.render(
      <StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </StrictMode>,
    )
  } catch (error) {
    console.error('[Trend Radar] Falha ao inicializar a aplicação.', error)
    root.render(
      <ConfigError>
        Falha ao inicializar a aplicação. Verifique a configuração do ambiente e o console do navegador.
      </ConfigError>,
    )
  }
}

void bootstrap()
