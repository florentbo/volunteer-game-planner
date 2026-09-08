import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'
import { readBrowserEnvironment } from '../lib/env'
import type { AppServices, AuthService, ProfileService } from './types'

export function createBrowserServices(): AppServices {
  const environment = readBrowserEnvironment()
  const supabase = createClient<Database>(
    environment.supabaseUrl,
    environment.supabasePublishableKey,
  )

  const auth: AuthService = {
    subscribe(listener) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        listener(session ? { userId: session.user.id } : null)
      })
      return () => data.subscription.unsubscribe()
    },
    async requestOtp(phone) {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: false },
      })
      if (error) throw error
    },
    async verifyOtp(phone, token) {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      })
      if (error) throw error
    },
    async signOut() {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw error
    },
  }

  const profiles: ProfileService = {
    async getCurrent(userId) {
      const { data, error } = await supabase
        .from('parent_profiles')
        .select('user_id, full_name, children(full_name, sort_order)')
        .eq('user_id', userId)
        .order('sort_order', { referencedTable: 'children', ascending: true })
        .single()

      if (error) throw error

      return {
        userId: data.user_id,
        parentName: data.full_name,
        children: data.children.map((child) => child.full_name),
      }
    },
  }

  return { auth, profiles }
}
