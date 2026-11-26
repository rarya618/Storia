// npm run emulators:lan: the local emulators, reachable from other devices on
// this network (a phone on the same Wi-Fi), for npm run dev:lan.
//
// They bind to this machine's LAN address rather than 0.0.0.0, because the
// Realtime Database emulator tells each client which host to reconnect to: the
// one it is bound to. Told 0.0.0.0, a phone would lose the database on its first
// reconnect. The ports and the rules come from firebase.json; the config written
// here is gitignored and rewritten on every run, since the address changes from
// one network to the next.
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'

// keep in step with lanAddress in vite.config.ts, so both find the same one
const lanAddress = () => {
  const found = Object.entries(networkInterfaces())
    .flatMap(([name, list]) => (list ?? []).map(a => ({ name, ...a })))
    .filter(a => a.family === 'IPv4' && !a.internal)
  return (found.find(a => a.name === 'en0') ?? found[0])?.address
}

const host = lanAddress()
if (!host) {
  console.error('No network address found: join a Wi-Fi or wired network first.')
  process.exit(1)
}

const base = JSON.parse(readFileSync(new URL('../firebase.json', import.meta.url), 'utf8'))
const emulators = { ...base.emulators }
for (const name of ['auth', 'firestore', 'database']) emulators[name] = { ...emulators[name], host }
const config = 'firebase.lan.local.json'
writeFileSync(new URL(`../${config}`, import.meta.url), JSON.stringify({ database: base.database, emulators }, null, 2) + '\n')

console.log(`Emulators on ${host}; run npm run dev:lan and open the Network address it prints.`)
const child = spawn(
  'npx',
  ['-y', 'firebase-tools', 'emulators:start', '--config', config, '--only', 'auth,firestore,database', '--import=.emulator-data', '--export-on-exit'],
  { stdio: 'inherit', cwd: new URL('..', import.meta.url) },
)
// Ctrl+C reaches the emulators too (same process group); wait for them to save
process.on('SIGINT', () => {})
child.on('exit', code => process.exit(code ?? 0))
