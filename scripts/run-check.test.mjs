import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const runner = fileURLToPath(new URL('./run-check.mjs', import.meta.url))

function execute(command, ...args) {
  const cwd = mkdtempSync(join(tmpdir(), 'vgp-check-'))
  const result = spawnSync(
    process.execPath,
    [runner, 'probe', command, ...args],
    {
      cwd,
      encoding: 'utf8',
      timeout: 10000,
    },
  )
  const logs = readdirSync(join(cwd, '.logs'))
  return { ...result, log: readFileSync(join(cwd, '.logs', logs[0]), 'utf8') }
}

test('success retains stdout and stderr only in the log and forwards literal arguments', () => {
  const result = execute(
    process.execPath,
    '-e',
    'console.log(process.argv[1]); console.error("diagnostic")',
    'literal $(false); value',
  )
  assert.equal(result.status, 0)
  assert.match(result.stdout, /^PASS probe exit=0/)
  assert.equal(result.stderr, '')
  assert.match(result.log, /literal \$\(false\); value/)
  assert.match(result.log, /diagnostic/)
  assert.doesNotMatch(result.stdout, /diagnostic/)
})

test('failure preserves the real exit code and limits displayed output', () => {
  const result = execute(
    process.execPath,
    '-e',
    'for(let i=0;i<100;i++) console.log(`line-${i}`); process.exit(7)',
  )
  assert.equal(result.status, 7)
  assert.match(result.stdout, /^FAIL probe exit=7/)
  assert.match(result.stderr, /line-99/)
  assert.doesNotMatch(result.stderr, /line-0\n/)
  assert.match(result.log, /line-0\n/)
})

test('a missing executable fails clearly', () => {
  const result = execute('vgp-command-that-does-not-exist')
  assert.equal(result.status, 127)
  assert.match(result.stderr, /ENOENT/)
})

test('termination cannot be reported as success', () => {
  const result = execute(
    process.execPath,
    '-e',
    'process.kill(process.pid, "SIGTERM")',
  )
  assert.equal(result.status, 143)
  assert.match(result.stdout, /^FAIL probe exit=143/)
})
