/// <reference types="vite/client" />

// set at build time in vite.config.ts
declare const __APP_VERSION__: string
declare const __APP_COMMIT__: string
declare const __APP_BUILT_AT__: string
// where a dev build finds the emulators: 127.0.0.1, or this machine's LAN address under npm run dev:lan
declare const __EMULATOR_HOST__: string

interface ImportMetaEnv {
  // Sentry's DSN for production builds (src/misc/monitoring.ts); without it nothing is reported
  readonly VITE_SENTRY_DSN?: string
}
