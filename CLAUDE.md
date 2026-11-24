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

Deploying uses Firebase Hosting: the hosting site is `new-storia` in project `script-writer-studio`, served from `dist/` with an SPA rewrite to `/index.html`. Realtime Database rules live in `web-new/database.rules.json` (owner-only access) and deploy with `npx firebase-tools deploy --only database`. When you add a new RTDB path or query, update the rules to match. `firebase.json` serves the hashed JS and CSS as immutable and everything else (`index.html`, `version.json`, every route) as `no-cache`, so a reload always reaches the latest deploy.

## Versions and releases

`web-new` is published as `storia-web`, versioned in its `package.json` (semver, 0.x while in beta), with each release in `web-new/CHANGELOG.md` and tagged `storia-web@<version>`. `vite.config.ts` builds the version, the short commit hash and the build time into the app (`__APP_VERSION__`, `__APP_COMMIT__`, `__APP_BUILT_AT__`, read through `misc/version.ts`) and writes them to `dist/version.json`. The account menu shows "Version 0.1.0 · a1b2c3d". `UpdatePrompt`, mounted in `App.tsx`, polls `version.json` every 10 minutes and whenever the tab comes back into view, and offers a reload when the deployed build differs from the running one.

Add user-facing changes under "Unreleased" in the changelog as they land. To release, from `web-new/`:

1. `npm version <patch|minor> --no-git-tag-version` (updates `package.json` and the lockfile).
2. Rename "Unreleased" in `CHANGELOG.md` to the new version and date, and open a fresh "Unreleased" above it.
3. Commit as `web: storia-web <version>`, then `git tag storia-web@<version>`.
4. Build and deploy from that commit (`npm run build`, then `npx firebase-tools deploy --only hosting`), so the hash in the app matches the tag.

## Required gitignored files

`web-new/src/firebase/keys.tsx` (exports `APISiteKey`, the reCAPTCHA v3 key for App Check) and `web-new/src/firebase/config.tsx` (exports `webDevelopmentConfig`, `webProductionConfig`, `electronTestConfig`) are gitignored, and the app won't build without them. Never commit them. `firebase/main.tsx` chooses which config to use through the hardcoded `isTesting` / `isElectronApp` flags.

## web-new architecture

**Two Firebase databases, used for different things:**
- **Firestore** (`db`) stores only user profiles in the `users/{uid}` collection (`addUser`, `getUser`).
- **Realtime Database** (`rtdb`) stores all content in three top-level paths: `folders/`, `projects/`, and `documents/`.

**Denormalised writes:** a child is written to its own path *and* copied as a summary into its parent. For example, `writeProjectData` writes `projects/{id}` and also `folders/{folderId}/projects/{id}` = `{id, name, type}`, then bumps the folder's `lastUpdated`. `writeDocumentData` does the same into `projects/{projectId}/documents/{id}`. When you add a rename, move, or delete, update both copies. Ownership lookups are RTDB queries on `orderByChild('owner')` or `orderByChild('folderId')`.

**Data access** lives in `src/firebase/database.tsx`. It returns refs and queries, not data. Views subscribe themselves with `onValue(ref, onData, onError)` inside a `useEffect` and return the unsubscribe function. Every view handles loading (`Loading`, which offers a retry after 12s), error, and not-found states (`LoadError`). Home, folder and project views start from what the tab last saw (`misc/seen.ts`, an in-memory cache that home's lists also feed) and remember each snapshot they receive, so a screen usually draws its content on the first frame. A new subscription on those screens should do the same. The data shapes are in `src/datatypes/`, where `Block.tsx` holds the `BasicBlock`/`Folder`/`Project` hierarchy.

**Screenplay documents:** every document is a screenplay. Its `content` is an array of `ScriptBlock` (`{id, type, text}`), where `type` is one of ten elements: the six screenplay basics (heading, action, character, parenthetical, dialogue, transition) plus shot, act (act breaks), lyrics and note. `SPEECH` in `screenplay/types.ts` lists the types printed under a cue without a blank line, and `prints()` is false for notes, which every count, the print copy and the sheets leave out. `readBlocks` reads a type it doesn't know as action, so a script written by a newer build survives an older tab's save. The editor loads a document once with `get()` (it doesn't use `onValue`, so remote updates can't overwrite what you're typing). It first draws the copy remembered in `misc/seen.ts`, if any, and autosave waits until the fresh copy has arrived; if the two differ, the fresh one replaces the page and autosaves after a debounce through `saveDocumentContent`, then `touchParents` bumps the `lastUpdated` of the project and folder that hold it, so home and the folder page sort by writing activity. The logic has no UI dependencies and lives in `src/screenplay/`: the element flow for Enter/Tab/Backspace, character suggestions, page estimates, Fountain export, and import from Final Draft (`finalDraft.ts`, .fdx XML) and WriterDuet (`writerDuet.ts`, used by the New document dialog). A .wdz is a ZIP (read by `misc/unzip.ts`) holding `script.json`, which stores no text, only each draft's edit history; the reader replays it, with undo and redo kept per line. The UI is in `components/screenplay/` and `views/DocumentView.tsx`. Page layout uses `ch` units of 12pt Courier, so indents match industry margins and the whole page scales as one unit. Printing uses a separate static copy (`PrintScript`) and the `@media print` rules in `screenplay.css`.

**Auth/session:** login uses Firebase Auth email/password. The app tracks the session through the `sessionStorage` keys `"Auth Token"` and `"User ID"`, which views read directly. `main.tsx` waits for `auth.authStateReady()` before rendering, so database reads go out authenticated. At the same point it syncs `sessionStorage` with the Firebase user: it restores the session in new tabs and clears it when Firebase has signed the user out. Logging out (`logOut` in `misc/session.ts`) signs out of Firebase and clears `sessionStorage`.

**State and routing:** there is no state library. `App.tsx` defines every route (`/`, `account/login|create|logout`, `home`, `folder/:id`, `project/:id`, `document/:id`) and owns the shared UI state: the error the create dialogs show inline, and the sidebar toggle (persisted in `localStorage` under `sidebarVisible`). It passes this state down as props, and views take the `PropsWithSidebar` type exported from `views/Home.tsx`. A new top-level view needs to be registered in `App.tsx` and wired up with these props. `home`, `folder/:id` and `project/:id` sit under the `Shell` layout route (`components/Shell.tsx`), which owns the page frame, the folder rail (`Sidebar`, with New folder and the account menu at its foot) and the New folder and Settings dialogs, and keeps them mounted between those screens, so those views render only their content (dialogs, `main`, `Loading` or `LoadError`), with no `Sidebar` or full-screen wrapper of their own. Shell also keeps the previous screen up until the next one is ready: `Loading` holds its screen while it is mounted (`useHoldScreen` in `misc/screenHold.ts`), and once the next screen has no spinner left, or after 300ms, it replaces the previous one outright.

**Styling:** every screen follows `DESIGN.md` (light only). The app's world is Revision Pages: each document wears the industry revision colour for its place in the project (white, blue, pink, yellow… by creation order, from `src/screenplay/revisions.ts`), that paper is the only colour, and the interface is set in Figtree with ink (#1B1B1F) for text, the primary button and focus. A surface joins the world by putting `sw sw-rev` on its root; the tokens (`--rail`, `--ui`, `--muted`, `--hair`, `--wash`, `--paper`, `--signal` and so on) and the shared classes (`sw-button`, `sw-button-soft` (the ink primary), `sw-input`, `sw-label`, `sw-icon`, `sw-card`, `sw-band`, `sw-rev-chip`, `sw-rev-strip`, `sw-stack`, `sw-sheet`, `sw-rail`, `sw-dialog`, `sw-spinner` and others) live in `src/screenplay/world.css`. Every screen, the signed-out ones included, carries both classes; the bare `.sw` defaults are what's left of the previous purple world and are never used on their own. Tailwind handles layout and reads the tokens with arbitrary values like `text-[color:var(--muted)]`; Tailwind has no custom colours or dark mode. Text outside the script uses Tailwind's standard sizes (`text-sm` and up; `text-xs` only for the editor's dense rail meta), never arbitrary ones like `text-[13px]`; the script page and the project sheets' miniature Courier keep exact sizes for screenplay metrics. Icons are drawn strokes from `components/screenplay/StrokeIcon.tsx`. Signed-out screens wrap their content in `AuthCard` (`components/AuthCard.tsx`), and the form helpers (`FieldError`, `readForm`, `useEscape`) are in `misc/forms.ts`. Page titles are set with `useTitle` from `misc/title.tsx`.
