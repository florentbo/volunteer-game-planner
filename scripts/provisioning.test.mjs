import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizePhoneForAuth } from './provisioning.mjs'

test('normalizes an E.164 phone number to Supabase Auth storage form', () => {
  assert.equal(normalizePhoneForAuth('+32470000001'), '32470000001')
})
