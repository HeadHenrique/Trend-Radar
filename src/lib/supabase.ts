import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

function getSupabaseConfig() {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!projectUrl) {
    throw new Error(
      '[Orbit] Configuração ausente: defina VITE_SUPABASE_URL no ambiente.',
    )
  }

  if (!publishableKey) {
    throw new Error(
      '[Orbit] Configuração ausente: defina VITE_SUPABASE_PUBLISHABLE_KEY no ambiente.',
    )
  }

  if (!publishableKey.startsWith('sb_publishable_')) {
    throw new Error(
      '[Orbit] VITE_SUPABASE_PUBLISHABLE_KEY precisa ser uma publishable key válida.',
    )
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(projectUrl)
  } catch {
    throw new Error(
      '[Orbit] VITE_SUPABASE_URL possui um valor inválido.',
    )
  }

  return {
    projectUrl,
    publishableKey,
    projectRef: parsedUrl.hostname.split('.')[0] || parsedUrl.hostname,
  }
}

const config = getSupabaseConfig()

export const supabase = createClient<Database>(
  config.projectUrl,
  config.publishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)

export const supabaseProjectRef = config.projectRef
