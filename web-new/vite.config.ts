import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), versionFile()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_COMMIT__: JSON.stringify(commit),
    __APP_BUILT_AT__: JSON.stringify(builtAt),
  },
})
