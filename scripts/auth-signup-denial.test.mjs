import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createClient } from '@supabase/supabase-js'

test('direct public OTP signup is denied for an unprovisioned phone', async () => {
  const url = process.env.SUPABASE_URL
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  assert.ok(url, 'SUPABASE_URL must be set; run npm run env:local first')
  assert.ok(
    publishableKey,
    'VITE_SUPABASE_PUBLISHABLE_KEY must be set; run npm run env:local first',
  )

  const client = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error } = await client.auth.signInWithOtp({
    phone: '+32479999999',
    options: { shouldCreateUser: true },
  })

  assert.equal(error?.code, 'signup_disabled')
})
