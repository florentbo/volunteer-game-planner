import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const status = execFileSync('supabase', ['status', '--output', 'env'], {
  encoding: 'utf8',
})

const values = Object.fromEntries(
  status
    .split('\n')
    .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
    .filter((match) => match !== null)
    .map((match) => [match[1], match[2]]),
)

const apiUrl = values.API_URL
const publishableKey = values.PUBLISHABLE_KEY ?? values.ANON_KEY
const serviceRoleKey = values.SERVICE_ROLE_KEY

if (!apiUrl || !publishableKey || !serviceRoleKey) {
  throw new Error('Supabase local status did not expose the required API keys')
}

writeFileSync(
  '.env.local',
  [
    `VITE_SUPABASE_URL=${apiUrl}`,
    `VITE_SUPABASE_PUBLISHABLE_KEY=${publishableKey}`,
    `SUPABASE_URL=${apiUrl}`,
    `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`,
    '',
  ].join('\n'),
  { mode: 0o600 },
)

console.log('Wrote local Supabase values to .env.local')
