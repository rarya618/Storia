---
name: Storia
description: A white script page between two quiet grey sidebars; Montserrat in sentence case for the interface, Courier Prime for the script, and Storia purple as a soft mark for where you are.
colors:
  accent: "#6166b3"
  select: "rgb(97 102 179 / 0.12)"
  on-select: "#484d9c"
  select-card: "#f7f7fc"
  select-border: "rgb(97 102 179 / 0.45)"
  ui: "#1f1f23"
  muted: "#66666e"
  ink: "#1d1d1f"
  paper: "#ffffff"
  tint: "#f7f7f8"
  wash: "#ececef"
  hair: "#e4e4e8"
  hair-strong: "#d2d2d8"
  signal: "#b5473c"
typography:
  wordmark:
    fontFamily: "Righteous, Montserrat, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    letterSpacing: "-0.025em"
  item:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  item-strong:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "18px"
    letterSpacing: "-0.025em"
  control:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "18px"
    letterSpacing: "0.005em"
  caption:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 500
  meta:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    fontFeature: "tnum"
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  script:
    fontFamily: "Courier Prime, Courier New, Courier, monospace"
    fontSize: "12pt"
    fontWeight: 400
    lineHeight: 1.2
  script-heading:
    fontFamily: "Courier Prime, Courier New, Courier, monospace"
    fontSize: "12pt"
    fontWeight: 700
    lineHeight: 1.2
  sheet:
    fontFamily: "Courier Prime, Courier New, Courier, monospace"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  key: "4px"
  chip: "5px"
  row: "6px"
  track: "7px"
  card: "8px"
  bar: "10px"
  full: "9999px"
spacing:
  hairline-gap: "1px"
  track-inset: "2px"
  row-y: "5px"
  row-x: "8px"
  column-x: "12px"
  edge: "16px"
  page-gutter: "24px"
  bar-height: "44px"
components:
  scene-row:
    textColor: "{colors.ui}"
    typography: "{typography.item}"
    rounded: "{rounded.row}"
    padding: "5px 8px"
  scene-row-hover:
    backgroundColor: "{colors.wash}"
  scene-row-current:
    backgroundColor: "{colors.select}"
    textColor: "{colors.on-select}"
    typography: "{typography.item-strong}"
  document-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ui}"
    rounded: "{rounded.card}"
    padding: "10px 12px"
  document-card-current:
    backgroundColor: "{colors.select-card}"
    textColor: "{colors.on-select}"
  document-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.sheet}"
    rounded: "{rounded.card}"
    padding: "22px 18px 0 26px"
  document-sheet-latest:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.on-select}"
    rounded: "{rounded.card}"
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ui}"
    typography: "{typography.control}"
    rounded: "{rounded.row}"
    height: "30px"
    padding: "0 12px"
  button-soft:
    backgroundColor: "{colors.select}"
    textColor: "{colors.on-select}"
    typography: "{typography.item-strong}"
    rounded: "{rounded.row}"
    height: "30px"
    padding: "0 12px"
  icon-button:
    textColor: "{colors.muted}"
    rounded: "{rounded.row}"
    size: "28px"
  icon-button-hover:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ui}"
  filter-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    typography: "{typography.control}"
    rounded: "{rounded.row}"
    height: "30px"
    padding: "0 8px"
  segmented-track:
    backgroundColor: "{colors.wash}"
    rounded: "{rounded.track}"
    padding: "2px"
  segmented-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ui}"
    typography: "{typography.control}"
    rounded: "{rounded.chip}"
    height: "26px"
  select:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ui}"
    rounded: "{rounded.row}"
    height: "28px"
    padding: "0 28px 0 10px"
  status-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ui}"
    rounded: "{rounded.bar}"
    height: "44px"
  sidebar:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ui}"
  wordmark:
    textColor: "{colors.accent}"
    typography: "{typography.wordmark}"
---

# Design System: Storia

## Overview

**Creative North Star: "The Quiet Navigator"**

Storia's world is the category standard for a writing tool, finished to the level of Linear's sidebars and Highland's page: a white script page centred between two neutral grey columns, with nothing on screen a screenwriter has to learn. The left column navigates the script (numbered scenes, or characters and the scenes they are in); the right column lists the project's documents. Both are quiet by default and become readable the moment you look at them. Storia purple appears only as a soft mark for where you are and as the focus ring.

The density is that of a good desktop app: 13px rows about 29px tall (40px on touch), 12 to 13px Montserrat in sentence case, 1px neutral hairlines, and 6px corners throughout. Depth is flat. Docked columns carry a hairline and no shadow. The only shadows belong to things that genuinely float over the page: the status bar, the help button, menus, popovers and overlay drawers. The script keeps its own voice in Courier Prime at standard screenplay metrics, and the interface never borrows it.

The world was established on the screenplay editor (`document/:id`) and on the folder sidebar, which shares its row, and the app's pages now follow it: the project page (`project/:id`) as a shelf of title pages, the folder page (`folder/:id`) and home as grids of quiet cards. It deliberately rejects the bespoke moves of earlier passes: lilac-tinted sidebars, a numeral masthead, pulse plots, solid purple scene cards and colour-coded cast. The create dialogs and the settings and auth screens still carry the legacy purple Tailwind, Noto Sans and dark-mode look; that is drift awaiting migration, and new work must not borrow from it.

The native mobile app's WriterView (Figma: Design Kit, "WriterView Mobile") is the reference for what the editor shows, not for how it looks. The web keeps its own layout (docked or overlay sidebars, no bottom tab bar) and its own look. Its purple titles, purple-bordered cards, capitalised headings and EXT./DAY chips are not adopted here. What the two share: the modes and their names (Script, Characters, Scenes, Project), the header (back, document name, "Updated at" beneath), scenes numbered from 0 with screen time ("0:37"), and the fields each card or row carries. Mobile features the web doesn't have yet (version history, search, character descriptions, scene synopses, document tags) are left out of the web rather than stubbed.

**Key Characteristics:**
- White page, neutral grey sidebars, one accent.
- Soft selection: a 12% purple fill with deep purple text, never a solid purple block.
- Montserrat for the interface in sentence case; Courier Prime for the script only.
- 6px corners and 1px hairlines; flat columns, shadows only on floating surfaces.
- Stored capitals read in title case outside the script.
- Light single-stroke icons, muted until hovered.

## Colors

A neutral grey interface around a white page, with Storia purple held back for position and focus.

### Primary
- **Storia Purple** (accent): the wordmark, the focus ring (2px outline, 2px offset), the filter field's focus border, the help button's mark, and the base of every selection tint. White on it is 5.2:1, but the system no longer uses it as a solid fill.
- **Soft Selection** (select): the 12% purple fill behind the current scene, character scene or folder row.
- **Selection Ink** (on-select): text and meta on the soft selection, and the current document card's title (6.4:1).
- **Selected Card** (select-card): the current document card's faintly purple ground, edged with **Selection Edge** (select-border, purple at 45%).

### Neutral
- **Interface Ink** (ui): interface text, 16:1 on white.
- **Quiet Grey** (muted): secondary text, row meta, icons at rest, placeholders (5.6:1 on white, 5.3:1 on the sidebar).
- **Script Ink** (ink): the script itself and the autocomplete names.
- **Paper** (paper): the page, document cards, fields, selects, the segmented chip and every floating surface.
- **Sidebar Grey** (tint): the ground of both editor columns and the folder sidebar.
- **Wash** (wash): hover fills, the segmented track, key caps, the back button's disc.
- **Hairline** (hair): column edges, field and card borders, the ruled heading line, the nested-scenes rail.
- **Hairline Under Hover** (hair-strong): borders of fields, selects and cards on hover.
- Text selection uses Storia purple at 18%.

### Tertiary
- **Signal Red** (signal): errors only, such as a failed save in the header.

### Named Rules
**The One Accent Rule.** Purple marks position (the current item), focus and the wordmark. It is never decoration, never a category colour and never a button fill.

**The Soft Selection Rule.** The current item is a 12% purple fill with deep purple text at semi-bold (600). A solid purple row with white text is the replaced world and does not come back.

**The Grey Columns Rule.** Sidebars are neutral grey (no lilac or purple tint). Hover is a grey wash, not a purple one.

## Typography

**Interface Font:** Montserrat (with system-ui, sans-serif), weights 400, 500, 600 and 700 in use. Emphasis is 600 and the document title 700, the mobile app's SemiBold and Bold, both tracked tight at -0.025em as the mobile app tracks its headings; 500 is reserved for the small label voice, so names read clearly above it.
**Script Font:** Courier Prime (with Courier New, Courier, monospace).
**Wordmark:** Righteous, for the "Storia" logo only.

**Character:** Montserrat at small sizes reads as a calm, slightly geometric app voice; Courier Prime gives the script its industry look. They never swap roles.

### Hierarchy
- **Title** (700, 14px, -0.025em): the document name in the editor header.
- **Item** (400, 13px, 18px line): scene locations, row names, menu items. **Item Strong** (600, -0.025em) for the current row, character names, document names and the project name.
- **Control** (500, 12.5px): segmented control labels and the filter field's text; 12.5px regular for sidebar empty-state notes and folder rows.
- **Label** (500, 12px, 18px line, 0.005em): section labels such as "In scene 4", "Everyone else", "Folders", "Keys", and the element label in the page's left margin (11px there).
- **Caption** (500, 11.5px): the column headings ("Documents" and its count), sidebar footers ("25 scenes") and the status bar.
- **Meta** (400, 11px, tabular numerals): Int/Ext and time, screen time, scene counts, document dates; scene numbers at 12px.
- **Body** (400, 14px): the keyboard reference.
- **Script** (12pt Courier Prime, 1.2 line): on screen the page scales as one unit to its own column width, 12 to 16px; scene headings 700 and uppercase; character cues and transitions uppercase.
- **Sheet** (10px Courier Prime, 1.2 line; 11.5px on the latest draft's larger sheet): the script in miniature on the project page's sheets, with the screenplay indents as proportions. It is still the script's voice, quoted, so the Two Voices Rule holds.

### Named Rules
**The Two Voices Rule.** Montserrat for everything that is interface, Courier Prime for everything that is script, including the script quoted in miniature on a sheet. The margin element label sits beside the script but speaks Montserrat.

**The Sentence Case Rule.** Interface labels are sentence case at normal tracking. No uppercase, letter-spaced labels or eyebrows.

**The Title Case Rule.** Scene headings and character cues are stored in capitals; outside the script they read in title case ("ALLEY BEHIND THE CLUB" becomes "Alley Behind The Club", "MARA'S FLAT" becomes "Mara's Flat"). Acronyms stay in capitals: a listed set (FBI, NYPD, ICU, POV and others), Roman numerals, and any word with no vowels. Text the writer typed in mixed case ("McGregor") is left as typed. Inside the script, capitals stay.

## Layout

The editor is three columns: a 280px left sidebar (scenes or characters), the writing desk, and a 300px right sidebar (documents). From 900px wide both sidebars dock beside the page, separated by a 1px hairline. Below 900px they become drawers over the page with a 20% black scrim, and opening the editor closes them. The folder sidebar on home, folder and project pages is the same 280px grey column, docked from 768px and an overlay below.

Every column and the editor header share a 44px top bar. Sidebar content sits 12px from the column edge, with rows that pad 8px inside, so text aligns at 20px; the header and the logo row inset 16px. Rows stack with a 1px gap, document cards with 6px. Scene rows are a grid: a 20px right-aligned number, the location, a 62px Int/Ext and time column, and a 34px screen time ("0:37"), as in the mobile app; eighths stay in the row's accessible label. Nested scene rows under an expanded character drop the length column and hang from a 1px hairline rail.

The writing desk centres the page with 16px gutters (24px from 640px). The page sizes itself to the desk's width with a container query, clamping the script between 12 and 16px so indents stay true to industry margins. Below 640px the page becomes full width at 13px with proportional indents for drafting; printing and the page count keep exact layout. A floating status bar sits 16 to 20px above the bottom edge on the left, and a round help button on the right.

On phones the header carries the current scene as a full-width row button (number, location, Int/Ext and time, chevron) that opens the scene list. On touch screens, rows grow to at least 40px and icon buttons to 40px square.

## Elevation & Depth

Flat by default. Columns are separated by hairlines and tonal grey, not shadows. Shadows belong only to surfaces that float over the page, and they are soft and neutral: a 1px 5% black ring plus a 16px 8% blur. Small in-surface lifts (the segmented chip, a hovered or current document card) use a 1 to 2px shadow at 4 to 8%.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 0 0 1px rgb(0 0 0 / 0.05), 0 4px 16px rgb(0 0 0 / 0.08)`): the status bar, the help button, the header menu and the shortcut popover.
- **Chip** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.04)`): the selected segment.
- **Card Lift** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.04)`): a document card on hover, and the current card.
- **Suggestion List** (`box-shadow: 0 4px 16px rgb(0 0 0 / 0.06)`): the character autocomplete under a cue.
- **Drawer**: an overlay sidebar below the docking width carries a large soft shadow over the scrim.

### Named Rules
**The Float-Only Shadow Rule.** A surface casts a shadow only if it floats over the page. Docked columns, rows and headers never do.

## Shapes

Gently rounded and consistent. Rows, icon buttons, fields and selects share a 6px corner; the segmented track is 7px with 5px chips inside it; document cards, menus and popovers are 8px; the status bar is 10px; key caps are 4px. The back button and help button are full circles. Borders are 1px hairlines that darken one step on hover. The ruled section label ends in a 1px line running to the column edge.

Icons are drawn, not set: a 24px grid, a single 1.4px stroke (2.4px for the dot menu), round caps and joins, in the current text colour, at 18px by default and 13 to 15px inside fields and rows.

## Components

### Sidebar rows
Quiet, familiar list rows, the backbone of the world.
- **Shape:** 6px corners, 5px by 8px padding, 13px Item type; 40px minimum on touch.
- **Rest:** Interface Ink on Sidebar Grey; meta columns in Quiet Grey with tabular numerals.
- **Hover:** a Wash fill, 120ms.
- **Current:** Soft Selection fill, Selection Ink for the name and its meta, name at 600. The current scene row also opens up beneath its heading, under the location column: the scene's first line of action in 12px regular Interface Ink (the script's own words, so not in Selection Ink), clamped to two lines, then its cast in title case as Meta behind a 13px two-person stroke icon. This is the web's form of the mobile app's expanded scene card. Rows with neither stay one line.
- **Variants:** the scene row (number from 0, location, Int/Ext and time, screen time); the character row (name at 600 over "3 scenes · 12 speeches · from scene 2", with a chevron that expands its scenes); the folder row (16px lead column, name, count); a quiet "New scene" row with a plus icon at the end of the list, in Quiet Grey until hovered.

### Document cards
- **Corner Style:** 8px.
- **Background:** Paper on the grey column, 1px Hairline border, 10px by 12px padding.
- **Content:** name (Item Strong, wrapping to two lines before it truncates), optional description 4px below (12px, two lines, Quiet Grey), "Updated …" date 8px below that (11px, Quiet Grey).
- **Hover:** border to Hairline Under Hover, Card Lift shadow. **Pressed:** Sidebar Ground fill, no shadow. **Focus:** the focus ring follows the card's 8px corners.
- **Current:** Selected Card ground, Selection Edge border, Selection Ink title, Card Lift shadow.

### Project and folder cards
Home and the folder page list projects and folders as quiet Document cards at page scale, in a grid of columns at least 240px wide whose rows share the tallest card's height.
- **Card:** Paper with a 1px Hairline and 8px corners, 14px by 16px padding, at least 132px tall. The name in Item Strong (two lines, the full name as a tooltip), the description in 12.5px Quiet Grey (three lines), and a Meta foot pinned to the bottom: on home, a project's folder on its own line, then the count and the activity ("5 documents · Updated 10 minutes ago").
- **States:** hover to Hairline Under Hover with the Card Lift, pressed to Sidebar Ground, focus ring on the 8px corners. No purple at rest or on hover.
- **Order:** most recently updated first, compared as times (dates are stored as `Date.toString()`).
- **New:** each grid ends in a dashed Hairline Under Hover card (New project, New folder) that hovers to Interface Ink; an empty grid says Start the first project or Create the first folder.

### Document sheets
The project page's shelf: each document shown as its own first page, so a draft is recognised by how it opens.
- **Sheet:** Paper with a 1px Hairline, 8px corners and the Card Lift shadow; the document's first written blocks in Sheet type, fading to Paper over the last 56px. 236 by 300px, the latest draft 340 by 360px with a Selection Edge border; on phones sheets take letter proportions (17:22), the latest full width and the rest two across.
- **Beneath:** the name (Item Strong; Selection Ink on the latest), an optional description (12px, two lines, Quiet Grey), then pages, scenes and runtime as a three-cell hairline box (11px labels over 13px 600 tabular figures), the cast behind the two-person icon as Meta, and "Updated …".
- **Order:** last edited first, by time; the latest is chosen only once every document has loaded, and only it carries purple and the soft Continue writing.
- **States:** loading and unreadable documents are Sidebar Grey slabs with the name and a one-line Meta status; a document with nothing written says "Nothing written yet" and counts 0 / 0 / 0:00. The shelf ends with a dashed Hairline Under Hover sheet, New document, which hovers grey; an empty project offers "Start the first draft" at the latest size.
- **Hover:** border to Hairline Under Hover with a slightly deeper lift; the focus ring follows the 8px corners.

### Text buttons
- **Button:** Paper with a 1px Hairline and 6px corners, 30px tall, 12.5px at 500; hover to Hairline Under Hover, pressed to Sidebar Ground. At least 40px on touch screens.
- **Soft:** the one primary action on a surface takes the soft selection (Soft Selection fill, Selection Ink, 600, tracked tight), never a solid purple fill; hover adds the Selection Edge.

### Segmented control
- **Track:** Wash with 2px inset and 7px corners; segments share the width equally.
- **Segments:** 26px tall, 12.5px at 500, Quiet Grey; hover to Interface Ink.
- **Selected:** a Paper chip with 5px corners and the Chip shadow.

### Inputs / Fields
- **Filter field:** 30px, Paper, 1px Hairline, 6px corners, a 15px search icon in Quiet Grey, 12.5px text; a clear button appears once there is text; Escape clears.
- **Select:** 28px, Paper, 1px Hairline, 6px corners, a drawn chevron in Quiet Grey; disabled at 45% opacity.
- **Hover:** border to Hairline Under Hover.
- **Focus:** the filter field's border turns Storia Purple with a 1px purple ring; other controls take the 2px purple focus outline at a 2px offset. Script lines show the caret and the margin element label instead of a ring.

### Icon buttons
- **Shape:** 28px square, 6px corners (40px on touch).
- **Rest:** Quiet Grey icon, no fill.
- **Hover / Expanded:** Wash fill, Interface Ink icon.
- **Back button:** the same button as a circle on a Wash disc.

### Navigation
The header is a 44px bar over the desk: show-scenes button (when hidden), the round back button, the document title at 14px and 700 with the save status ("Updated at 13:25") beneath it in 11.5px Quiet Grey (Signal Red with a Retry link on failure), on every width as in the mobile app; then the dot menu and show-project. The dot menu opens a Float surface with 8px corners and 13px items that take a Wash hover, at least 40px on touch screens. Menus are plain disclosures (a button with aria-expanded and aria-controls, not the ARIA menu pattern): Escape closes them and returns focus to their button, and tabbing out or clicking outside closes them. Column headers carry the wordmark or project name with a collapse icon. Sidebar footers state a count in Caption type above a hairline.

The app pages share the same 44px header: the round back button (none on home, where the title aligns with the content edge), the page name in Title over its activity or counts in 11.5px Quiet Grey, then Text buttons, with one soft primary at most. Home's account menu is a Float surface: the writer's name (600) and email, Settings and Log out as 13px Wash-hover items, and the plan and version in Meta beneath a rule.

### Floating status bar
A Float surface, 44px tall with 10px corners, at the bottom left of the desk: word count (from 640px), the element select, "Scene 11", and estimated running time in tabular numerals in the scene rows' form (6:25, or 1:42:08 past an hour), plus a collapse button that shrinks it to a 44px square.

### Character autocomplete
A Paper list with a Hairline border, 6px corners and the Suggestion List shadow, hanging under a character cue. Names are in the script's capitals and Script Ink; the active option takes a Wash fill.

### Ruled section label
Label type in Quiet Grey followed by a 1px Hairline running to the edge, used to head groups in the keyboard reference.

## Do's and Don'ts

### Do:
- **Do** mark the current item with the soft selection: Storia purple at 12% with Selection Ink text at 600.
- **Do** keep sidebars Sidebar Grey with a 1px Hairline at the column edge and no shadow when docked.
- **Do** use Montserrat in sentence case for every interface string, and Courier Prime only for the script.
- **Do** show stored capitals in title case outside the script, keeping acronyms, Roman numerals, vowel-less words and writer-typed mixed case.
- **Do** use 6px corners for rows, icon buttons, fields and selects, and 8px for cards and popovers.
- **Do** give floating surfaces the Float shadow and Paper ground.
- **Do** draw icons as single 1.4px strokes on a 24px grid in the current text colour.
- **Do** make rows and icon buttons at least 40px on touch screens.

### Don't:
- **Don't** fill a row, card or button with solid Storia purple and white text.
- **Don't** tint sidebars or hovers lilac or purple.
- **Don't** use purple for categories, cast colour codes or decoration.
- **Don't** set interface labels in uppercase with wide tracking, or add eyebrow labels above headings.
- **Don't** put shadows on docked columns, rows or the header.
- **Don't** use Courier Prime for interface text, or Montserrat inside the script.
- **Don't** bring back a numeral masthead, pulse plots or solid scene cards.
