---
version: 1
slug: "src-views-documentview-tsx"
primary_target: "src/views/DocumentView.tsx"
related_targets: ["src/components/screenplay"]
---

# Screenplay editor (document/:id)

Scope: the screenplay editor route, which leads Storia's visual world (the rest of the app adopts it later). Mode: Operate. Current round: both editor sidebars, the left scene/character navigator and the right project documents column, plus the shared editor tokens they sit on.

Audience and job: aspiring screenwriters drafting in short laptop sessions, sometimes on phones. Their job is to write correctly formatted scenes without fighting the format and to move around a long script quickly.

Problems this round answers (user, 2026-11-23): a long script is hard to scan; the Characters view is thin; spacing and font sizes need updating.

Constraints: keep all editor behaviour (element flow, shortcuts, autocomplete, autosave, Fountain export, print/PDF, docked sidebars from 900px and overlays below). Standard screenplay page metrics are fixed. Revision Pages carries the brand (user's choice, 2026-11-24); the previous purple world is retired here. Quality bar: Notion / Linear sidebars and Highland 2.

Unresolved: dark mode for the editor; whether the home, folder and project screens follow this world.

## Direction contract

THESIS: The editor is an extension of Revision Pages (see the home brief): the page and its document wear the draft's industry revision colour, while the navigator stays a quiet, familiar list a screenwriter can use without learning anything. Refuses the purple soft-selection world it replaced and any decoration that competes with the page.

OWN-WORLD: Inherited from Revision Pages: paper-tint rails (#F3F1EC) with hairline edges and a white-slip current row; white page; ink #1B1B1F text, ink primary and ink focus; revision colour only on paper (the 6px page-edge band, the header chip, each document card's band); Figtree for the interface at Tailwind standard sizes (text-xs only for dense rail meta); Courier Prime for the script at industry metrics, unchanged.

STORY: The writer sees which draft they're in and its colour, every scene numbered with its full heading, filters or switches to characters, jumps to a scene, and moves between drafts by colour.

FIRST VIEWPORT: Left 280px paper rail: wordmark and collapse; Scenes | Characters; filter; numbered scene rows ([18px | 1fr | 60px | 32px]), the current scene a white slip opened to its first line and cast; New scene. Centre: 64px header (round back, document name, revision chip, save status, menu), the page-edge band, the white page. Right 300px paper rail: project name, documents as cards banded in their revision colours, the current one outlined in ink. Floating 48px status bar and a round help button.

FORM: extension of Revision Pages (home's seed:c4f2d87f108f36d1); no roll, an extension inside the established world.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
