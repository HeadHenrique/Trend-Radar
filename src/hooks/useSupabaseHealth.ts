import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ConnectionStatus } from '../types'

interface HealthState {
  status: ConnectionStatus
  message: string
}

export function useSupabaseHealth(): HealthState {
  const [state, setState] = useState<HealthState>({
    status: 'loading',
    message: 'Validando conexão com o Supabase...',
  })

  useEffect(() => {
    let active = true

    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (!active) return
        if (error) {
          setState({ status: 'error', message: error.message })
          return
        }
        setState({
          status: 'success',
          message: 'Conexão com o projeto Supabase disponível.',
        })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Falha ao validar a conexão.',
        })
      })

    return () => {
      active = false
    }
  }, [])

  return state
}
