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

Constraints: keep all editor behaviour (element flow, shortcuts, autocomplete, autosave, Fountain export, print/PDF, docked sidebars from 900px and overlays below). Standard screenplay page metrics are fixed. Storia purple (#6166b3) and Montserrat carry the brand (user's choice this round). Quality bar: Notion / Linear sidebars and Highland 2.

Unresolved: dark mode for the editor; whether the home, folder and project screens follow this world.

## Direction contract

THESIS: The category standard, executed at Linear/Highland finish: a quiet, familiar navigator a screenwriter can use without learning anything. It refuses the bespoke world moves of earlier passes (numeral masthead, pulse plots, tinted cards, colour codes).

OWN-WORLD: Neutral grey sidebars (no lilac), white page, one accent: Storia purple as the solid selection fill and focus ring. Montserrat for the interface at 12-13px, 500 for headings and the selection; Courier Prime for the script only. 6px row radius, 1px neutral borders, no shadows on columns.

STORY: The writer sees every scene numbered with its full heading, filters to find one, sees who is in the script and which scenes each character is in, and jumps there.

FIRST VIEWPORT: Left 280px grey column: logo and collapse; a two-segment Scenes | Characters control; a filter field; numbered scene rows (28px) with full uppercase headings and length; current scene a solid purple row; a quiet "New scene" row at the end. Right 300px grey column: project name, documents as white bordered cards, current one outlined in purple. White page centred between.

FORM: the category standard (canon), chosen by the user over the roll; not on the ordered list. seed:5f532d8893952231

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
