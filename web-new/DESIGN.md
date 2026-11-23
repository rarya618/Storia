---
name: Storia
description: White paper and black script, framed by quiet lilac sidebars; Montserrat in sentence case, with Storia purple marking where you are.
colors:
  accent: "#6166b3"
  on-accent: "#ffffff"
  ui: "#565ba8"
  muted: "#64689f"
  ink: "#1d1d1f"
  paper: "#ffffff"
  tint: "#f7f7fc"
  wash: "#efeff8"
  add: "#e8e9f5"
  add-hover: "#dfe1f2"
  hair: "#e2e3f1"
  hair-strong: "#cfd1e8"
  rule: "#eeeef7"
  pulse: "#b8badb"
  signal: "#b5473c"
  code-grey: "#a3a3a8"
  code-blue: "#7186c4"
  code-yellow: "#d9bb62"
typography:
  wordmark:
    fontFamily: "Righteous, Montserrat, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1
  item-title:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  title:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  row:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
    lineHeight: "18px"
    letterSpacing: "0.005em"
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  meta:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    fontFeature: "\"tnum\""
  tag:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "9px"
    fontWeight: 500
    letterSpacing: "0.04em"
  script:
    fontFamily: "Courier Prime, Courier New, Courier, monospace"
    fontSize: "12pt"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  card: "2px"
  sm: "4px"
  select: "5px"
  md: "6px"
  lg: "8px"
  bar: "10px"
  full: "9999px"
spacing:
  row-gap: "2px"
  sm: "8px"
  card-gap: "12px"
  panel: "15px"
  md: "16px"
  header: "44px"
  control: "28px"
components:
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    rounded: "{rounded.md}"
    size: "28px"
  icon-button-hover:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.accent}"
  select:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.select}"
    padding: "0 30px 0 12px"
    height: "28px"
  add-button:
    backgroundColor: "{colors.add}"
    textColor: "{colors.accent}"
    rounded: "{rounded.card}"
    height: "40px"
  add-button-hover:
    backgroundColor: "{colors.add-hover}"
  sidebar-row:
    backgroundColor: "transparent"
    textColor: "{colors.ui}"
    typography: "{typography.row}"
    rounded: "{rounded.card}"
    padding: "7px 10px"
  sidebar-row-hover:
    backgroundColor: "{colors.wash}"
  sidebar-row-current:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.card}"
  document-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ui}"
    typography: "{typography.item-title}"
    rounded: "{rounded.card}"
    padding: "15px"
  document-card-current:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  tag-pill:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.accent}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "1px 8px"
  status-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ui}"
    rounded: "{rounded.bar}"
    height: "44px"
  popover-menu:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ui}"
    rounded: "{rounded.lg}"
  suggestion-list:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.script}"
    rounded: "{rounded.md}"
  key-cap:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
---

# Design System: Storia

## Overview

**Creative North Star: "The Catalogue Sleeve"**

Storia's world is a catalogue entry set quietly on white. The script is the artwork: black Courier on unprinted paper, centred, with no frame or sheet. The interface is the catalogue information around it. Two narrow side columns hold the script's structure and the project's other documents, and their ground is a faint lilac tint of Storia purple. All the interface type is Montserrat in sentence case at normal tracking, in a soft purple ink. One solid purple card in each column says "you are here". Everything else is small, plain and calm.

The density is low and the page is open. Chrome sits at the edges: a 44px header row over the page, a scene column on the left, a project column on the right, and a small floating status bar at the bottom. Controls answer hover with a faint lilac wash, never an inversion. Lines separate the columns, and a soft purple-tinted float shadow lifts only the few things that hover over the page. Motion is short and functional: fills ease in over 120ms, and the sidebar slides open over 300ms.

This world started on the screenplay editor (`/document/:id`) and is the target system for all of Storia. It has been through three passes. The first build was black, red and bold, with Archivo, a 168px numeral, tracked capitals and black boxes. A quieter grey pass replaced it with Montserrat, a 44px numeral and a red "you are here". The current pass follows the user's Figma file: Storia purple and its tints, sidebars with a solid purple card for the current item, and no numeral masthead. The editor's surface brief at `.impeccable/surfaces/src-views-documentview-tsx.md` still describes the first build's direction contract, and this document supersedes it on look and layout. The app's folder sidebar (home, folder and project pages) is the first screen outside the editor to adopt this world. The rest of those pages, plus settings and auth, still carry the older purple Tailwind, Noto Sans and dark-mode look. That look is legacy drift awaiting migration, and new work must not borrow from it.

**Key Characteristics:**
- Black script on unprinted white; the interface around it in Storia purple and its tints, light only (`color-scheme: light`).
- Lilac-tinted side columns separated from the page by a 1px lilac hairline.
- Montserrat for the interface: 400 for rows and titles, 500 for labels and the current row. Righteous only for the "Storia" logo.
- Sentence-case labels at normal tracking; stored capitals (locations, cast) shown in title case.
- Courier Prime is reserved for the script itself.
- A solid purple card marks the current scene, the current document and the current folder or project.
- A muted four-colour cast code (grey, blue, yellow, white keyline) identifies characters in pairs, always decoded to a name beside it.
- Muted red appears only when something failed.

## Colors

Storia purple and five light tints of it carry the interface, black carries the script, and a muted red is held back for failures.

### Primary
- **Storia Purple** (`accent`; white on it is 5.2:1): solid fills for the current scene, document and folder or project row, icon strokes, the select chevron and text, the logo, the current scene's pulse on phones, and the focus ring.
- **On Purple** (`on-accent`): text and pulses on a purple card.

### Secondary
- **Signal Red** (`signal`, 5.6:1 on white): the "Not saved" status and anything else that failed and needs the writer to act. Nothing decorative, and no longer a position marker.

### Tertiary
- **Code Grey, Code Blue, Code Yellow** (`code-grey`, `code-blue`, `code-yellow`), plus white with a `hair-strong` keyline as the fourth code: each speaking character gets an ordered pair, shown as two small blocks. They never appear as text, surfaces or UI states. On a purple card the blocks take a fine white keyline so they still read.

### Neutral
- **Interface Ink** (`ui`, 6.1:1 on white): the default text colour of the whole interface, from rows and titles to the status bar and menus.
- **Soft Ink** (`ink`, about 16.8:1): the script, its caret and the autocomplete names. The interface does not use it.
- **Lilac Pencil** (`muted`, 5.2:1 on white, 4.9:1 on the tint): secondary text such as scene numbers and runtimes, counts, document descriptions and dates, save status, ruled headings, key-cap text, the script's margin element label and placeholders.
- **Unprinted White** (`paper`): the page, the project column, document cards, floating surfaces and tag pills.
- **Lilac Tint** (`tint`, 5% purple): the ground of the scene column and the app's folder sidebar.
- **Lilac Wash** (`wash`, 10%): hover on rows, cards, icons and menu items; the select's fill; the back button's circle; key caps.
- **Add Lilac** (`add`, 15%; `add-hover` on hover): the "Add more" button only.
- **Lilac Hairline** (`hair`): column edges, document card borders, the autocomplete border, key-cap borders and the line after a ruled heading.
- **Hairline, Pressed** (`hair-strong`): a select's border on hover, the white cast code's keyline and the scene ticks in the phone pulse.
- **Quiet Rule** (`rule`): the line under the phone pulse strip. Never text.
- **Pulse Lilac** (`pulse`): every scene pulse at rest.

### Named Rules
**The You-Are-Here Rule.** A solid Storia purple card means "this is where you are", and nothing else gets that fill. There is one per column: the current scene, the current document, the current folder or project.

**The Red Means Broken Rule.** Signal red is only for a failure the writer must act on. It never marks position, hover or emphasis.

**The Decoded Code Rule.** A cast colour code always sits beside the character's name. Colour alone never identifies anyone.

**The Tint Ladder Rule.** The fills are a ladder of Storia purple: 5% `tint` for a column's ground, 10% `wash` for hover and dropdowns, 15% `add` for the add button, then solid `accent` for the current item. Don't invent steps in between.

## Typography

**Interface Font:** Montserrat (300, 400, 500, 600 loaded), with system-ui and sans-serif as fallbacks
**Logo Font:** Righteous, for the "Storia" wordmark only
**Script Font:** Courier Prime (400 and 700, with italics), for the screenplay only

**Character:** One calm geometric sans at a narrow band of sizes, from 9px to 15px, so nothing shouts. The script's Courier is the largest, darkest text on any screen. Righteous gives the logo a single rounded flourish and appears nowhere else.

### Hierarchy
- **Wordmark** (Righteous 400, 20px, line-height 1): "Storia" in the purple at the top of each sidebar.
- **Item title** (400, 15px/22px): a document's name on its card in the project column.
- **Title** (400, 14px): the draft's name in the editor header.
- **Row** (400, 13px/18px; 500 on the current row): scene names, folder and project names in the sidebars, and menu items.
- **Label** (500, 12.5px/18px, 0.005em, sentence case): ruled headings ("Folders", "Keys", "Elements"), the 12px select text and the add button (14px). The script margin uses it at 11px in `muted` for the element name.
- **Body** (400, 14px): shortcut descriptions. Helper sentences run at 12.5px/20px in `muted`.
- **Meta** (400, 11–12.5px, tabular figures): scene numbers, runtimes, counts, dates, cast names on a card, the status bar (11.5px) and save status (12px).
- **Tag** (500, 9px, 0.04em, uppercase): place and time pills on the current scene card. This is the one uppercase in the interface.
- **Script** (Courier Prime 400, line-height 1.2; scene headings 700; headings, cues and transitions uppercase): sized in `ch` and `em` so the page scales as one unit. It runs at `clamp(12px, …, 16px)` from the writing column's own width, 13px on phones, and exactly 12pt with line-height 1 in print.

### Named Rules
**The Small Voice Rule.** Interface text stays between 9 and 15px, and the script is always the loudest thing on the screen. If interface type is larger than the script, it is wrong.

**The Sentence Case Rule.** Interface labels are sentence case at normal tracking. Text the script stores in capitals (locations, character names) is shown in title case outside the script. The 9px place and time tags are the single exception.

**The Courier Fence Rule.** Courier Prime appears only in the script and in the autocomplete list that completes a script line. Every other piece of text, key caps included, is Montserrat, except the Righteous logo.

## Layout

The editor is a full-height row of three parts: the 280px scene column on the left, the writing column in the middle, and the 300px project column on the right. From 900px the side columns are docked beside the page. Each can be hidden on its own, and the editor remembers the choice per viewer. Below 900px they open as overlays, with a black 20% scrim and a large drop shadow, and a single 28px continuous script pulse sits under the header with a `rule` line beneath it.

Each column opens with a 44px header row: 15px side padding in the sidebars and 14px in the writing column, with an 8px gap. The scene column's header holds the logo, the Scenes/Characters select and a collapse icon. The project column's header holds a collapse icon and the project's name as a 26px washed link. The writing header holds the show-column icons, a round back button, the draft's name, the save status (from 640px) and a dots menu. Sidebar content scrolls on its own with 15px side padding and 24px at the bottom. Scene rows sit 2px apart and document cards 12px apart.

The page sits centred in the writing column with 16px side gutters (24px from 640px). The column is a size container, so the script sizes itself to whatever width the sidebars leave. The script page follows standard screenplay metrics in `ch` of Courier: an 85ch page with 15ch left and 10ch right margins, character cues indented 22ch, parentheticals 16ch, dialogue 10ch. On phones the indents become proportional so the text stays readable; print and the page count keep exact layout. Print outputs only the script on US Letter with 1in margins and a 1.5in binding margin.

The floating status bar sits 16px from the bottom and sides (20px from 640px), with the round shortcuts button opposite it. The bottom of the page has 144px of padding so the last line can scroll clear of them.

The app's folder sidebar is the same 280px column on the tint, docked and sticky from 768px. Below 768px it overlays the page with a 30% scrim and closes after you pick a folder or project. It slides between 0 and 280px wide over 300ms with an ease-out, its contents fading with it.

## Elevation & Depth

The page and the columns are flat: paper and tint side by side, separated by a 1px `hair` line. Only things that float over the writing are lifted, and they share one soft, purple-tinted shadow. Overlay sidebars on narrow screens take a stronger drop shadow, because they cover the page.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 1px 2px rgb(40 44 110 / 0.05), 0 4px 16px rgb(40 44 110 / 0.08)`): the status bar, the shortcuts button and panel, and the dots menu.
- **Suggest** (`box-shadow: 0 4px 16px rgb(0 0 0 / 0.06)`): the character autocomplete under a cue.
- **Overlay** (Tailwind `shadow-xl`; `0 4px 16px rgb(40 44 110 / 0.12)` on the app sidebar): a sidebar opened over the page below its docking width.

### Named Rules
**The Float-Only-Over-The-Page Rule.** A surface gets a shadow only when it hovers over the writing. Columns, cards and rows are separated by a hairline or a tint step, never by a shadow.

## Shapes

Mostly square, softened only where something is touched. Rows, scene cards, document cards and the add button have 2px corners. Key caps and small hover targets have 4px, the select 5px, icon buttons 6px, menus and the shortcuts panel 8px, and the status bar 10px. The back button, shortcuts button and tag pills are fully round. Cast-code blocks are 10 by 6px with 1px corners.

The focus ring is a 2px solid Storia purple outline, offset 2px, with 6px corners (5.2:1 on white). Script lines show the caret and the margin element label instead of a ring.

Icons are drawn on a 24px grid in a 1.4px stroke with round caps and joins, inline as SVG, in the purple. The dots icon uses a 2.4px stroke so its points read. The select's chevron is drawn as two small purple triangles rather than a glyph. Scene pulses are non-scaling hairlines: 1px at rest, 1.4–1.5px for the current scene.

## Components

### Icon buttons
Quiet until pointed at.
- **Shape:** 28px square, 6px corners, an 18px stroke icon in `accent` (16px for back and chevrons).
- **Hover / open:** a `wash` fill over 120ms.
- **Back:** the same button, fully round, resting on `wash`.

### Select
- **Style:** a 28px (26px in the scene header) washed box with no visible border, 5px corners, 12px purple text and the two-triangle purple chevron.
- **Hover:** the border firms to `hair-strong`. **Disabled:** 45% opacity.
- **Uses:** Scenes/Characters in the scene column (100px wide), the element picker in the status bar (124px).

### Add button
A full-width 40px block in `add` with 2px corners and a 14px, 500-weight purple label ("Add more"); `add-hover` on hover. One per column at most.

### Sidebar rows
- **Default:** 13px text in `ui` on the column's ground, 2px corners, 10px side padding, a `wash` fill on hover over 120ms.
- **Scene row:** a 16px right-aligned number in `muted`, the location in title case, the runtime in `muted` 11px, then the scene's pulse underneath.
- **Folder row (app sidebar):** a 16px chevron that expands the folder, the name, and the project count in `muted` 11px. Projects sit under it, indented to the name.
- **Current:** a solid `accent` card with white text at 500 weight. The current scene card grows to show a three-line summary, a taller pulse in white, the cast with codes, place and time tags, and the runtime.

### Document cards
A list in the project column. Each card has a 1px `hair` border, 2px corners and 15px padding. It shows the name at 15px, up to five lines of description at 12.5px in `muted`, and "Updated …" at 11px in `muted` 16px below. Hover takes the `wash`. The current document is a solid `accent` card in white with no border.

### Tag pills
White, fully round, 9px uppercase 500 at 0.04em in `accent`, with 8px side padding. They appear only on the current scene card, for place and time.

### Status bar
A floating white bar with the float shadow, 44px tall with 10px corners. It shows the word count, the element picker, the scene number and the estimated runtime at 11.5px, and has a collapse icon. Collapsed, it becomes a 44px square with an expand icon. The word count hides below 640px.

### Menus and popovers
White with the float shadow and 8px corners. Dots menu: 192px wide, 6px vertical padding, items at 13px with 14px side padding, `wash` on hover. The shortcuts panel is 25rem wide with 20px padding. It uses ruled headings ("Keys", "Elements") over a two-column list of key caps (Montserrat 12px in `muted` on `wash`, 4px corners, `hair` border) and 14px descriptions.

### Character autocomplete
A white list under the cue with a `hair` border, 6px corners and the suggest shadow. Names stay uppercase Courier in `ink`, as the script writes them; the active row takes the `wash`.

### Ruled heading
A `muted` label followed by a 1px `hair` line to the column edge, 12px between them. It titles a group: "Folders" in the app sidebar, "Keys" and "Elements" in the shortcuts panel.

### Scene pulse (signature)
Each scene is drawn as a hairline whose length follows the scene's length and whose peaks are its dialogue. In the scene column every row carries its own pulse, 4px of amplitude at rest and 9px on the current card in white. On phones the whole script becomes one continuous 28px pulse under the header: each scene is a proportional stretch, at least 12px wide and tappable, separated by short `hair-strong` ticks, with the current scene in `accent`.

### Cast code
Two 10 by 6px blocks with a 2px gap and 1px corners, coloured from the code set; the white block carries a `hair-strong` inset keyline. Always followed by the character's name in title case.

## Do's and Don'ts

### Do:
- **Do** set a sidebar on the 5% `tint` with a 1px `hair` edge, 280px wide (300px for the project column), with a 44px header row and 15px side padding.
- **Do** mark the current item with a solid `accent` card and white text, one per column.
- **Do** answer hover with the `wash` over 120ms.
- **Do** set interface text in Montserrat between 9 and 15px, in `ui` or `muted`, sentence case.
- **Do** show locations and character names in title case outside the script.
- **Do** use a ruled heading to title a group of content.
- **Do** keep shadows to surfaces that float over the page, using the float shadow.
- **Do** pair every cast colour code with the character's name.
- **Do** draw icons as 1.4px strokes on a 24px grid, inline as SVG, in `accent`.

### Don't:
- **Don't** bring back the first two builds' marks: Archivo, the scene numeral masthead, black boxes, tracked uppercase labels, the inverting hover, the red edge bar or the red "you are here".
- **Don't** use `signal` red for anything but a failure the writer must act on.
- **Don't** use the solid `accent` fill for buttons, hover or emphasis; it means "current".
- **Don't** add shadows to columns, cards or rows.
- **Don't** use Courier Prime for interface text, Montserrat for the script, or Righteous for anything but the logo.
- **Don't** carry over the legacy look into screens built in this world: Tailwind's `purple-tint` classes, FontAwesome icons, Noto Sans, Norican or `dark:` variants.
- **Don't** use `rule`, `hair`, `hair-strong` or `pulse` for text; they exist only for lines.
- **Don't** add a dark theme by inverting tokens; the world is light-only until a dark variant is designed.
