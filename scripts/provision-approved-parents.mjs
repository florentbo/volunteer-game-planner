import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import { normalizePhoneForAuth } from './provisioning.mjs'

const phonePattern = /^\+[1-9]\d{7,14}$/

function parseParents(raw) {
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Approved-parent data must be a non-empty array')
  }

  const phones = new Set()
  return parsed.map((candidate, index) => {
    if (!candidate || typeof candidate !== 'object') {
      throw new Error(`Parent ${index + 1} must be an object`)
    }

    const { phone, parentName, children } = candidate
    if (typeof phone !== 'string' || !phonePattern.test(phone)) {
      throw new Error(`Parent ${index + 1} must have an E.164 phone number`)
    }
    if (phones.has(phone)) {
      throw new Error(`Phone ${phone} appears more than once`)
    }
    phones.add(phone)

    if (typeof parentName !== 'string' || parentName.trim() === '') {
      throw new Error(`Parent ${index + 1} must have a name`)
    }
    if (
      !Array.isArray(children) ||
      children.some((child) => typeof child !== 'string' || child.trim() === '')
    ) {
      throw new Error(`Parent ${index + 1} has invalid children`)
    }

    return {
      phone,
      parentName: parentName.trim(),
      children: children.map((child) => child.trim()),
    }
  })
}

async function listAllUsers(client) {
  const users = []
  for (let page = 1; ; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: 1000,
    })
    if (error) throw error
    users.push(...data.users)
    if (data.users.length < 1000) return users
  }
}

async function provisionParent(client, existingUsers, parent) {
  const authPhone = normalizePhoneForAuth(parent.phone)
  let user = existingUsers.find((candidate) => candidate.phone === authPhone)

  if (!user) {
    const { data, error } = await client.auth.admin.createUser({
      phone: parent.phone,
      phone_confirm: true,
    })
    if (error) throw error
    user = data.user
    existingUsers.push(user)
  }

  const { error: profileError } = await client.from('parent_profiles').upsert({
    user_id: user.id,
    full_name: parent.parentName,
  })
  if (profileError) throw profileError

  const { error: deleteError } = await client
    .from('children')
    .delete()
    .eq('parent_user_id', user.id)
  if (deleteError) throw deleteError

  if (parent.children.length > 0) {
    const { error: childrenError } = await client.from('children').insert(
      parent.children.map((fullName, sortOrder) => ({
        parent_user_id: user.id,
        full_name: fullName,
        sort_order: sortOrder,
      })),
    )
    if (childrenError) throw childrenError
  }

  console.log(`Provisioned ${parent.phone}`)
}

const sourcePath = process.argv[2]
const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!sourcePath) {
  throw new Error('Pass the approved-parent JSON path as the first argument')
}
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
}

const parents = parseParents(await readFile(sourcePath, 'utf8'))
const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const users = await listAllUsers(client)

for (const parent of parents) {
  await provisionParent(client, users, parent)
}
