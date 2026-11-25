import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { fileURLToPath } from 'node:url'
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// which build this is: the release from package.json, the commit it was built
// from, and when. The app shows it, and compares it with the deployed
// version.json to notice when a newer build has gone out
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }
const commit = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'unknown'
  }
})()
const builtAt = new Date().toISOString()

// writes dist/version.json beside index.html; firebase.json serves it uncached
const versionFile = (): Plugin => ({
  name: 'storia-version-file',
  apply: 'build',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version, commit, builtAt }) + '\n' })
  },
})

// two pages: index.html is the landing page at "/", static and with none of the
// app; app.html is the app, which every other path loads (firebase.json rewrites
// them to it). The dev and preview servers route the same way
const isAppPath = (url = '') => {
  const path = url.split('?')[0]
  return path !== '/' && path !== '/index.html' && !path.includes('.') && !path.startsWith('/@') && !path.startsWith('/node_modules/')
}
const appRoutes = (): Plugin => ({
  name: 'storia-app-routes',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.headers.accept?.includes('text/html') && isAppPath(req.url)) req.url = '/app.html'
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.headers.accept?.includes('text/html') && isAppPath(req.url)) req.url = '/app.html'
      next()
    })
  },
})

// npm run dev:lan (--mode lan) serves on this network as well, so a phone on the
// same Wi-Fi can open the app, and points the app at the emulators on this
// machine's LAN address, where npm run emulators:lan binds them
// (scripts/emulators-lan.mjs, whose lanAddress this matches)
const lanAddress = () => {
  const found = Object.entries(networkInterfaces())
    .flatMap(([name, list]) => (list ?? []).map(a => ({ name, ...a })))
    .filter(a => a.family === 'IPv4' && !a.internal)
  return (found.find(a => a.name === 'en0') ?? found[0])?.address
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const lan = mode === 'lan' ? lanAddress() : undefined
  if (mode === 'lan' && !lan) throw new Error('No network address found: join a Wi-Fi or wired network first.')
  return {
    plugins: [react(), versionFile(), appRoutes()],
    server: lan ? { host: true } : undefined,
    build: {
      rollupOptions: {
        input: {
          landing: fileURLToPath(new URL('./index.html', import.meta.url)),
          app: fileURLToPath(new URL('./app.html', import.meta.url)),
        },
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(version),
      __APP_COMMIT__: JSON.stringify(commit),
      __APP_BUILT_AT__: JSON.stringify(builtAt),
      __EMULATOR_HOST__: JSON.stringify(lan ?? '127.0.0.1'),
    },
  }
})
