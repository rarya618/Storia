---
version: 1
slug: "src-views-home-tsx"
primary_target: "src/views/Home.tsx"
related_targets: ["src/components/ContinueWriting.tsx","src/components/Cards.tsx","src/components/Sidebar.tsx"]
---

# Home (home)

Scope: the home route, first surface of Storia's replacement world (Revision Pages). Mode: Operate. The rest of the app adopts the world afterwards; until then the world is scoped to a modifier class so other routes keep the incumbent look.

Audience and job: writers new to the format, disabled writers, writers on any device and outside the industry, coming back to their latest draft or starting a project or folder.

Content: greeting, the latest draft (where you left off), projects, folders, account menu. Constraints: the script page keeps industry format; calm, distraction-free writing; standard Tailwind type sizes outside the editor, nothing below text-sm on this world's surfaces; WCAG AA contrast; no invented claims.

## Direction contract

THESIS: Every draft wears its industry revision colour (white, blue, pink, yellow, green, goldenrod…), so home teaches the production ritual by using it. Refuses the grey SaaS dashboard with one accent and the cream-paper writing-app rut.

OWN-WORLD: Goldenrod rail as a flat field; white ground; ink #1B1B1F text and solid ink primary buttons; revision colours as coloured paper (sheets, card edge bands, chips), never as text colour; Atkinson Hyperlegible for the interface, Courier Prime for script only; ink focus rings; soft paper shadows only on stacked sheets.

STORY: The writer is greeted, sees their latest draft as its coloured page with which revision it is, continues writing in one click, and scans projects whose bands show how many drafts each holds.

FIRST VIEWPORT: Goldenrod folder rail left (280px). 64px bar: New folder, ink New project, account menu. Greeting at text-4xl over counts. Latest draft as a fanned stack (its sheet on its revision colour, earlier drafts offset behind in theirs), beside it the revision chip, draft name text-3xl, project and folder, figures, the revision strip of colour chips with this draft marked, ink Continue writing. Projects grid below with revision bands.

FORM: Revision Pages, position 1 of 7 (IMPECCABLE'S PICK, chosen over the assigned Marquee). seed:c4f2d87f108f36d1. Signature move: revision colour as draft identity, shown as fanned sheets and card edge bands.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- When folder, project, editor and signed-out screens adopt the world.
- Whether the editor's chrome takes Atkinson Hyperlegible.
