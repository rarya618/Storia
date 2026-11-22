# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
The primary users are aspiring screenwriters: students and emerging writers drafting spec scripts and shorts. They often write on laptops in short sessions and are still learning the screenplay format as they go.

## Product Purpose
Storia is a writing app, pitched on its marketing site as "the only app you need for all your writing needs". Writers organise their work into folders, projects and documents, and write screenplays in an editor that handles industry formatting for them. Success means a writer can turn an idea into a correctly formatted draft without fighting the tool or the format.

## Positioning
Calm, focused writing: a distraction-free environment that gets out of the way, as opposed to the feature-heavy industry tools (Final Draft, WriterDuet, Highland). It is web-based, so there's nothing to install.

## Operating Context
- Writers work in short sessions on laptops, sometimes on phones or tablets.
- They need standard screenplay output: US Letter, 12pt Courier, industry margins. Scripts are printed or saved as PDF, and exchanged with other tools as Fountain files.
- Work is organised as folders containing projects, and projects containing documents. Every document is currently a screenplay.

## Capabilities and Constraints
- Screenplay editor features:
  - six elements: scene heading, action, character, parenthetical, dialogue, transition
  - Enter/Tab element flow, `INT.`/`EXT.` detection, ⌘/Ctrl+1–6 element shortcuts
  - character autocomplete and a scene navigator
  - autosave, page estimate, Fountain export, print/PDF with a title page
- Stack: Vite, React 18, TypeScript, Tailwind and Firebase (Auth, Realtime Database, Firestore for profiles).
- The product is in invite-only beta ("Exclusive beta now open").
- Undecided: story-planning tools such as the legacy app's story map and idea cards, collaboration and sharing, and other writing formats.

## Brand Commitments
- The name is Storia.
- The redesign of the screenplay editor is the start of a new visual identity that the rest of Storia will adopt. The current purple, Norican and Noto Sans look is not binding.

## Evidence on Hand
- The product has no testimonials, customer names, user counts or press. Future work must not invent any.
- The legacy Electron app's editor and story-planning views are in `../web/src` for reference.

## Product Principles
- The writing comes first. Interface chrome earns its place or gets out of the way.
- The tool handles the format, so writers learn it by doing rather than by reading rules.
- Keep tools close but quiet: structure, characters and notes are within reach without competing with the page.
- Calm over feature count: one clear way to do each thing.
- Draft anywhere: the editor has to work for real on phones and tablets, not just shrink.
