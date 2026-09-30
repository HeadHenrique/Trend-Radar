import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const projectUrl =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://zqwlyqnwcpddmknjnune.supabase.co'

const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_10_P2uU1Zs12fC1JeaQT0w_wE-WTT1D'

export const supabase = createClient<Database>(projectUrl, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const supabaseProjectRef = 'zqwlyqnwcpddmknjnune'
