import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const root = process.cwd()
const viteCli = resolve(root, 'node_modules', 'vite', 'bin', 'vite.js')
const env = { ...process.env, NODE_ENV: 'development' }
const processes = [
  spawn(process.execPath, [resolve(root, 'server', 'index.js')], { cwd: root, env, stdio: 'inherit' }),
  spawn(process.execPath, [viteCli, '--host', '0.0.0.0'], { cwd: root, env, stdio: 'inherit' }),
]

let stopping = false

function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of processes) {
    if (child.exitCode === null) child.kill('SIGTERM')
  }
  process.exitCode = code
}

for (const child of processes) {
  child.on('error', (error) => {
    process.stderr.write(`${error.message}\n`)
    stop(1)
  })
  child.on('exit', (code) => {
    if (!stopping) stop(code || 0)
  })
}

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
