# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

WriterStudio (branded "Storia" in the newer app) is a screenwriting/story-planning tool. The repo holds several independent npm projects with no root `package.json`. Run commands from inside each subdirectory.

- **`web-new/`**: the active rewrite (Vite + React 18 + TypeScript + Tailwind + Firebase). Almost all current work happens here.
- `web/`: legacy app (Create React App + Electron, Firestore-based). Kept for reference.
- `website/`: marketing site (CRA) with a register-interest page.
- `mobile/`: early Expo/React Native prototype.

## Commands (`web-new/`)

```sh
npm run dev      # Vite dev server
npm run build    # tsc type-check, then vite build -> dist/
npm run lint     # eslint, --max-warnings 0 (any warning fails)
npm run preview  # serve the built dist/
```

There is no test setup in `web-new`. Use `npm run build` as the type-check gate.

Deploying uses Firebase Hosting: the hosting site is `new-storia` in project `script-writer-studio`, served from `dist/` with an SPA rewrite to `/index.html`.

## Required gitignored files

`web-new/src/firebase/keys.tsx` (exports `APISiteKey`, the reCAPTCHA v3 key for App Check) and `web-new/src/firebase/config.tsx` (exports `webDevelopmentConfig`, `webProductionConfig`, `electronTestConfig`) are gitignored, and the app won't build without them. Never commit them. `firebase/main.tsx` chooses which config to use through the hardcoded `isTesting` / `isElectronApp` flags.

## web-new architecture

**Two Firebase databases, used for different things:**
- **Firestore** (`db`) stores only user profiles in the `users/{uid}` collection (`addUser`, `getUser`).
- **Realtime Database** (`rtdb`) stores all content in three top-level paths: `folders/`, `projects/`, and `documents/`.

**Denormalised writes:** a child is written to its own path *and* copied as a summary into its parent. For example, `writeProjectData` writes `projects/{id}` and also `folders/{folderId}/projects/{id}` = `{id, name, type}`, then bumps the folder's `lastUpdated`. `writeDocumentData` does the same into `projects/{projectId}/documents/{id}`. When you add a rename, move, or delete, update both copies. Ownership lookups are RTDB queries on `orderByChild('owner')` or `orderByChild('folderId')`.

**Data access** lives in `src/firebase/database.tsx`. It returns refs and queries, not data. Views subscribe themselves with `onValue(ref, snapshot => setState({id, ...snapshot.val()}))` inside a `useEffect`. The data shapes are in `src/datatypes/`: `Block.tsx` holds the `BasicBlock`/`Folder`/`Project` hierarchy, and a `Document`'s `content` is a separate `StandardBlock` type (`{id, text}`).

**Auth/session:** login uses Firebase Auth email/password, but the app then tracks the session through `sessionStorage` keys `"Auth Token"` and `"User ID"` (read by `hooks/useAuth.ts` and directly in views). Logging out (`logOut` in `views/Login.tsx`) signs out of Firebase and clears `sessionStorage`.

**State and routing:** there is no state library. `App.tsx` defines every route (`/`, `account/login|create|logout`, `home`, `folder/:id`, `project/:id`) and owns the shared UI state: the error banner, the sidebar toggle (persisted in `localStorage` under `sidebarVisible`), the dot menu, and settings visibility. It passes this state down as props, and views take the `PropsWithSidebar` type exported from `views/Home.tsx`. A new top-level view needs to be registered in `App.tsx` and wired up with these props.

**Styling:** Tailwind with custom `purple*` colours in `tailwind.config.js`, with `dark:` variants throughout. Shared class strings are TS constants in `src/styles/` (`colors.tsx`, `forms.tsx`) and get concatenated into `className`. Icons come from FontAwesome. Page titles are set with `useTitle` from `misc/title.tsx`.
