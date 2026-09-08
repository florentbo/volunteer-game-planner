type BrowserEnvironment = {
  supabaseUrl: string
  supabasePublishableKey: string
}

export function readBrowserEnvironment(): BrowserEnvironment {
  const supabaseUrl = readEnvironmentVariable('VITE_SUPABASE_URL')
  const supabasePublishableKey = readEnvironmentVariable(
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  )

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Configuration Supabase manquante')
  }

  return { supabaseUrl, supabasePublishableKey }
}

function readEnvironmentVariable(name: string): string | undefined {
  const value: unknown = import.meta.env[name]
  return typeof value === 'string' ? value : undefined
}
