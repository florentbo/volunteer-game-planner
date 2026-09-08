import { spawn } from 'node:child_process'
import { closeSync, fstatSync, mkdirSync, openSync, readSync } from 'node:fs'
import { constants } from 'node:os'
import { resolve } from 'node:path'

const [label, command, ...args] = process.argv.slice(2)
if (!label || !/^[a-z0-9-]+$/.test(label) || !command) {
  console.error('Usage: node scripts/run-check.mjs <label> <command> [args...]')
  process.exit(2)
}

const directory = resolve('.logs')
mkdirSync(directory, { recursive: true, mode: 0o700 })
const log = resolve(directory, `${label}-${Date.now()}-${process.pid}.log`)
const descriptor = openSync(log, 'wx+', 0o600)
const started = Date.now()
const environment = { ...process.env, NO_COLOR: '1' }
delete environment.FORCE_COLOR
const child = spawn(command, args, {
  shell: false,
  stdio: ['ignore', descriptor, descriptor],
  env: environment,
})

let spawnError
let interrupted
child.on('error', (error) => {
  spawnError = error
})
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    interrupted = signal
    child.kill(signal)
  })
}

child.on('close', (code, signal) => {
  const terminalSignal = signal ?? interrupted
  const status = spawnError
    ? 127
    : terminalSignal
      ? 128 + (constants.signals[terminalSignal] ?? 1)
      : (code ?? 1)
  const elapsed = ((Date.now() - started) / 1000).toFixed(1)
  console.log(
    `${status === 0 ? 'PASS' : 'FAIL'} ${label} exit=${status} (${elapsed}s) log=${log}`,
  )
  if (status !== 0) {
    if (spawnError) console.error(spawnError.message)
    if (terminalSignal) console.error(`Terminated by ${terminalSignal}`)
    // Read only the end of even very large logs; retain the complete file on disk.
    const buffer = Buffer.alloc(16 * 1024)
    const size = fstatSync(descriptor).size
    const length = readSync(
      descriptor,
      buffer,
      0,
      buffer.length,
      Math.max(0, size - buffer.length),
    )
    const lines = buffer.subarray(0, length).toString('utf8').split('\n')
    console.error(lines.slice(-40).join('\n'))
  }
  closeSync(descriptor)
  process.exitCode = status
})
