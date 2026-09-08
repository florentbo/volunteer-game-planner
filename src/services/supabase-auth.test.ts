import { beforeEach, expect, test, vi } from 'vitest'

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({ createClient }))
vi.mock('../lib/env', () => ({
  readBrowserEnvironment: () => ({
    supabaseUrl: 'http://127.0.0.1:54321',
    supabasePublishableKey: 'test-key',
  }),
}))

import { createBrowserServices } from './supabase-auth'

const signInWithOtp = vi.fn()

beforeEach(() => {
  signInWithOtp.mockReset()
  signInWithOtp.mockResolvedValue({ error: null })
  createClient.mockReturnValue({
    auth: {
      onAuthStateChange: vi.fn(),
      signInWithOtp,
      signOut: vi.fn(),
      verifyOtp: vi.fn(),
    },
  })
})

test('SC-2 requesting an OTP never permits account creation', async () => {
  const services = createBrowserServices()

  await services.auth.requestOtp('+32470000001')

  expect(signInWithOtp).toHaveBeenCalledExactlyOnceWith({
    phone: '+32470000001',
    options: { shouldCreateUser: false },
  })
})
