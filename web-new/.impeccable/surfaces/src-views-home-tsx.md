---
version: 1
slug: "src-views-home-tsx"
primary_target: "src/views/Home.tsx"
related_targets: []
---

# Home (home)

Scope: the home route, moved off the legacy look onto the editor's quiet navigator world (DESIGN.md), after the project and folder pages. Mode: Operate.

Audience and job: a signed-in writer getting back to a project, or starting a project or folder. Projects without a folder live only here.

Content: every project as the folder page's card, with its folder named in the foot; every folder as a card with its project count. Both most recently updated first. The account menu keeps the user's name and email, Settings, Log out, and the plan and version lines. The disabled search button and the "Soon" menu items are dropped, as on the other pages.

Constraints: keep the folder sidebar as is. CreateFolder and CreateProject use the restyled create dialog (f16dcae); SettingsView keeps its legacy look for now. Light-only like the editor.

## Direction contract

THESIS: Home is the writer's index: projects first, because getting back to the writing is the job, then folders. It refuses the legacy single grid that mixed folders and projects by creation date under a purple "View All".

OWN-WORLD: DESIGN.md's world unchanged: white page beside the grey folder column, the shared quiet cards (Paper, Hairline, 8px, Item Strong names, Meta foot), Text buttons with New project as the one soft-selection primary, and a Float menu for the account. No other purple.

STORY: The writer sees their projects by recency with where each lives and how much is in it, opens one, or adds a project or folder; the account menu holds settings and log out.

FIRST VIEWPORT: Folder sidebar left. 44px header with the title aligned to the content edge: "Home" over "n folders · n projects"; New folder (hidden on phones, where the Folders section's card offers it), soft New project, and the account dots right. A ruled "Projects n" grid ending in a New project card, then a ruled "Folders n" grid ending in a New folder card.

FORM: Card grids in two sections, extended from the folder page; no roll, the user asked for home to follow. seed: none (pinned) "update the home page too"; world: inherited (DESIGN.md, extension of the folder page)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- The settings dialog still carries the legacy look.
