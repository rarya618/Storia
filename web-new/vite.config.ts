import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/bundler-plugins/vite'

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

// a production build with SENTRY_AUTH_TOKEN (in the gitignored .env.production.local)
// uploads its source maps to Sentry, so a reported error's stack trace reads as the
// source, then deletes them from dist/ so they're never deployed. 'hidden' leaves
// the bundles without a link to them. Without the token there are no maps at all
const sourceMaps = (authToken: string | undefined) => authToken ? [sentryVitePlugin({
  org: 'russal-arya',
  project: 'storia-web',
  authToken,
  // the release the app reports under (misc/monitoring.ts)
  release: { name: 'storia-web@' + version, dist: commit, inject: false, setCommits: false },
  sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
  telemetry: false,
})] : []

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const lan = mode === 'lan' ? lanAddress() : undefined
  if (mode === 'lan' && !lan) throw new Error('No network address found: join a Wi-Fi or wired network first.')
  // every variable, not only VITE_ ones; this stays in the config and never reaches the app
  const authToken = command === 'build' && mode === 'production' ? loadEnv(mode, process.cwd(), '').SENTRY_AUTH_TOKEN || undefined : undefined
  if (command === 'build' && mode === 'production' && !authToken) console.warn('No SENTRY_AUTH_TOKEN: building without source maps, so Sentry stack traces will be minified.')
  return {
    // Sentry's plugin last, as its docs ask
    plugins: [react(), versionFile(), appRoutes(), ...sourceMaps(authToken)],
    server: lan ? { host: true } : undefined,
    build: {
      sourcemap: authToken ? 'hidden' : false,
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
