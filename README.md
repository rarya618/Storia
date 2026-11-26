# Storia

Storia is a screenwriting app. Write the scene, and Storia sets the page: scene headings, action, cues, parentheticals, dialogue and transitions, formatted to industry margins as you type. It's for writers who want a calm place to draft without fighting the tool or the format.

It's in a closed beta, by invitation.

## What it does

- **The editor:** Enter and Tab move between elements as a screenwriter expects, with `INT.`/`EXT.` detection, character suggestions, a scene navigator, a page estimate and autosave.
- **Drafts:** writing is organised in folders, projects and drafts. Each draft wears its revision colour (white, blue, pink, yellow…) in the order it was made.
- **Boards:** each project has a board for planning the story on cards, in acts and groups, linked to the scenes they become.
- **In and out:** import Final Draft (`.fdx`) and WriterDuet (`.wdz`) scripts, export Fountain, and print or save a PDF with a title page.
- **On a phone:** the web app works on a phone, and a native app (early, not yet released) gives the editor native text and keyboard handling.

## The repository

| Folder | What it is |
|---|---|
| [`web/`](web) | The app and its landing page: Vite, React 18, TypeScript, Tailwind and Firebase. Published as `storia-web`, with releases in [`web/CHANGELOG.md`](web/CHANGELOG.md). |
| [`mobile/`](mobile) | The native app, for writing on the go: Expo with React Native and React Native Firebase. |
| [`packages/core/`](packages/core) | `@storia/core`, the logic both apps share: the screenplay rules, page counts, Fountain, the board and the data shapes. No UI. |

Each folder is its own npm project, with its own `node_modules` and lockfile, so install and run each one from inside it. The apps link core as `file:../packages/core` and import its TypeScript source directly; nothing is built or published.

The design (Revision Pages) is described in [`web/DESIGN.md`](web/DESIGN.md), and the product in [`web/PRODUCT.md`](web/PRODUCT.md). [`CLAUDE.md`](CLAUDE.md) is the detailed guide to how everything fits together.

## Getting started

You need Node, and Java 21 or newer for the Firebase emulators. The native app also needs Xcode or Android Studio.

```sh
cd packages/core && npm install
cd ../../web && npm install
```

The web app won't build without two files that stay out of git: `web/src/firebase/config.tsx`, which exports `firebaseConfig` (the Firebase web config), and `web/src/firebase/keys.tsx`, which exports `APISiteKey` (the reCAPTCHA v3 key for App Check).

### The web app

Development runs on the local Firebase emulators, so it never touches anyone's real scripts. In two terminals, from `web/`:

```sh
npm run emulators   # Auth, Firestore and the Realtime Database
npm run dev         # the app, on the emulators
```

Invite an email first (in the Emulator UI at http://127.0.0.1:4000, add `invites/<email>` = `true` to the Realtime Database, with the email's dots written as commas), then make the account at `/account/create`. It exists only in the emulators, which save their data to `web/.emulator-data/` when you stop them with Ctrl+C.

To try it on a phone on the same Wi-Fi, use `npm run emulators:lan` and `npm run dev:lan` instead, and open the network address it prints.

### The native app

The native app runs only in a development build, not Expo Go. It needs `mobile/GoogleService-Info.plist` and `mobile/google-services.json` from the Firebase project's settings, which also stay out of git.

```sh
cd mobile && npm install
npx expo run:ios      # build and install the development build
npx expo start        # serve it afterwards
```

A development build uses the web app's emulators, so start them with `npm run emulators:lan` in `web/` first.

## Checks

From the root, `npm run check` type-checks, lints and tests all three projects. Run it after any change to `packages/core`, since both apps depend on it.

## Releasing the web app

Releases follow semantic versioning (0.x while in beta) and are tagged `storia-web@<version>`. The steps, and how deploying to Firebase Hosting works, are in [`CLAUDE.md`](CLAUDE.md#versions-and-releases).

## History

Storia began as WriterStudio. A legacy Create React App and Electron app (which also lived in `web/`, until [426da51](https://github.com/rarya618/Storia/commit/426da51)) and a 2022 marketing site (`website/`, until [ac4e43c](https://github.com/rarya618/Storia/commit/ac4e43c)) are in the git history.

## Licence

[GNU General Public License v3.0](LICENSE).
