---
version: 1
slug: "src-views-projectview-tsx"
primary_target: "src/views/ProjectView.tsx"
related_targets: []
---

# Project page (project/:id)

Scope: the project route, moved off the legacy look onto the editor's quiet navigator world (DESIGN.md). Mode: Operate.

Audience and job: aspiring screenwriters arriving from the folder sidebar or home. Most visits are a hop into the editor: pick the draft and go (user, 2026-11-23).

Content per document (user): last updated, script stats (pages, scenes, runtime), opening lines, characters. These need each document's content; the project's `documents` summaries hold only id, name and type.

Constraints: keep the folder sidebar as is (user). The CreateDocument modal and dark mode are not kept; the page is light-only like the editor. Data stays read-only from RTDB; no new paths.

## Direction contract

THESIS: You recognise a draft by how it opens. Every document is shown as its real first page, so the project page is a desk of scripts, not a file list. It refuses the category's table-of-files and its icon-plus-name grid.

OWN-WORLD: The editor's world unchanged: white page beside the grey folder column, Montserrat in sentence case (700 project title, 600 names, tight tracking), Courier Prime only on the sheets, Storia purple only for the latest draft's edge and name and the one primary action, which takes the soft selection (12% fill, Selection Ink, 600), never a solid fill (One Accent Rule). 8px sheets with a hairline and the card lift; stats in a three-cell hairline box with labelled segments and tabular figures.

STORY: The writer sees which draft they last touched, how it opens, how long it runs and who is in it, then continues it in one click, or opens an older draft or adds a new one.

FIRST VIEWPORT: Folder sidebar left. 44px header, level with the sidebar's logo row: round back, project name over "Folder · Updated …", New document and menu right. The description in muted 13px. A ruled "Documents 4" label. A shelf: the latest draft as a larger sheet (about 340px) with a purple edge, a soft-purple Continue writing beneath its stats; the others as 236px sheets in last-edited order, wrapping to new rows.

FORM: Title-page shelf; position 4 of my ordered list (dealt lead). seed:bf557a87b6e8dfbd

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Raises
- From the boarding pass and gate board: stats in labelled segments with tabular figures.
- From the split-flap concourse: fixed sheet size and order by last edit, latest first.

## Unresolved
- Creation keeps the shared CreateDocument modal (legacy look, shared with folder and project creation; its restyle is its own pass). The shelf ends with a quiet New document sheet that opens it.
- Sheets show the document's own first blocks only; nothing is added that the writer didn't write.
