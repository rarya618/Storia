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

Deploying uses Firebase Hosting: the hosting site is `new-storia` in project `script-writer-studio`, served from `dist/` with an SPA rewrite to `/index.html`. Realtime Database rules live in `web-new/database.rules.json` (owner-only access) and deploy with `npx firebase-tools deploy --only database`. When you add a new RTDB path or query, update the rules to match.

## Required gitignored files

`web-new/src/firebase/keys.tsx` (exports `APISiteKey`, the reCAPTCHA v3 key for App Check) and `web-new/src/firebase/config.tsx` (exports `webDevelopmentConfig`, `webProductionConfig`, `electronTestConfig`) are gitignored, and the app won't build without them. Never commit them. `firebase/main.tsx` chooses which config to use through the hardcoded `isTesting` / `isElectronApp` flags.

## web-new architecture

**Two Firebase databases, used for different things:**
- **Firestore** (`db`) stores only user profiles in the `users/{uid}` collection (`addUser`, `getUser`).
- **Realtime Database** (`rtdb`) stores all content in three top-level paths: `folders/`, `projects/`, and `documents/`.

**Denormalised writes:** a child is written to its own path *and* copied as a summary into its parent. For example, `writeProjectData` writes `projects/{id}` and also `folders/{folderId}/projects/{id}` = `{id, name, type}`, then bumps the folder's `lastUpdated`. `writeDocumentData` does the same into `projects/{projectId}/documents/{id}`. When you add a rename, move, or delete, update both copies. Ownership lookups are RTDB queries on `orderByChild('owner')` or `orderByChild('folderId')`.

**Data access** lives in `src/firebase/database.tsx`. It returns refs and queries, not data. Views subscribe themselves with `onValue(ref, onData, onError)` inside a `useEffect` and return the unsubscribe function. Every view handles loading (`Loading`, which offers a retry after 12s), error, and not-found states (`LoadError`). The data shapes are in `src/datatypes/`, where `Block.tsx` holds the `BasicBlock`/`Folder`/`Project` hierarchy.

**Screenplay documents:** every document is a screenplay. Its `content` is an array of `ScriptBlock` (`{id, type, text}`), where `type` is one of the six screenplay elements. The editor loads a document once with `get()` (it doesn't use `onValue`, so remote updates can't overwrite what you're typing) and autosaves after a debounce through `saveDocumentContent`, then `touchParents` bumps the `lastUpdated` of the project and folder that hold it, so home and the folder page sort by writing activity. The logic has no UI dependencies and lives in `src/screenplay/`: the element flow for Enter/Tab/Backspace, character suggestions, page estimates, and Fountain export. The UI is in `components/screenplay/` and `views/DocumentView.tsx`. Page layout uses `ch` units of 12pt Courier, so indents match industry margins and the whole page scales as one unit. Printing uses a separate static copy (`PrintScript`) and the `@media print` rules in `screenplay.css`.

**Auth/session:** login uses Firebase Auth email/password. The app tracks the session through the `sessionStorage` keys `"Auth Token"` and `"User ID"`, which views read directly. `main.tsx` waits for `auth.authStateReady()` before rendering, so database reads go out authenticated. At the same point it syncs `sessionStorage` with the Firebase user: it restores the session in new tabs and clears it when Firebase has signed the user out. Logging out (`logOut` in `misc/session.ts`) signs out of Firebase and clears `sessionStorage`.

**State and routing:** there is no state library. `App.tsx` defines every route (`/`, `account/login|create|logout`, `home`, `folder/:id`, `project/:id`, `document/:id`) and owns the shared UI state: the error the create dialogs show inline, the sidebar toggle (persisted in `localStorage` under `sidebarVisible`), the dot menu, and settings visibility. It passes this state down as props, and views take the `PropsWithSidebar` type exported from `views/Home.tsx`. A new top-level view needs to be registered in `App.tsx` and wired up with these props.

**Styling:** every screen follows `DESIGN.md` (light only). The colour tokens are CSS variables (`--accent`, `--paper`, `--tint`, `--hair`, `--muted`, `--signal` and so on) on the `.sw` class in `src/screenplay/world.css`, which also holds the shared component classes (`sw-button`, `sw-button-soft`, `sw-input`, `sw-label`, `sw-icon`, `sw-dialog`, `sw-spinner` and others). Tailwind handles layout and reads the tokens with arbitrary values like `text-[color:var(--muted)]`. The app is light only, and Tailwind has no custom colours or dark mode. Icons are drawn strokes from `components/screenplay/StrokeIcon.tsx`. Signed-out screens wrap their content in `AuthCard` (`components/AuthCard.tsx`), and the form helpers (`FieldError`, `readForm`, `useEscape`) are in `misc/forms.ts`. Page titles are set with `useTitle` from `misc/title.tsx`.
