---
version: 1
slug: "src-views-folderview-tsx"
primary_target: "src/views/FolderView.tsx"
related_targets: []
---

# Folder page (folder/:id)

Scope: the folder route, moved off the legacy look onto the editor's quiet navigator world (DESIGN.md), as the sibling of the project page. Mode: Operate.

Audience and job: writers choosing which project in a folder to open, or starting a new one.

Content per project (user, 2026-11-23): a name and description card: name, description, document count, last update. No script content, so no extra reads beyond the folder's project query. The Public/Private badge is dropped (user): nothing can be shared yet, so it carried no information.

Constraints: keep the folder sidebar as is. The CreateProject dialog was restyled into the world on 2026-11-23 (f16dcae). Light-only like the editor.

## Direction contract

THESIS: A folder is a calm index of projects: each one a quiet document card a writer can read at a glance and open in one click. It refuses the legacy grid's purple titles, icons and badges.

OWN-WORLD: DESIGN.md's Document cards at page scale: Paper on white with a 1px Hairline and 8px corners, Item Strong names tracked tight, 12.5px Quiet Grey descriptions, Meta for counts and dates. No purple on the page except focus; the project page carries the shelf's purple, the folder page carries none.

STORY: The writer sees every project in the folder, most recently updated first, with what it's about and how many documents it holds, then opens one or adds a new one.

FIRST VIEWPORT: Folder sidebar left. 44px header level with the logo row: round back to Home, folder name in Title over its activity, New project right. The description in muted 13px. A ruled "Projects n" label. A responsive grid of equal-height cards (about 240px minimum), ending with a dashed New project card.

FORM: Document card grid, extended from the project page; no roll, the user chose the form. seed: none (pinned) "Name and description card"; world: inherited (DESIGN.md, extension of the project page)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Home still carries the legacy look.
