---
name: Storia
description: Every draft wears the colour a production prints its revision on; ink type in Figtree on white, a soft paper rail, and Courier Prime for the script.
colors:
  ink: "#1B1B1F"
  ink-hover: "#3A3A40"
  muted: "#57534E"
  paper: "#FFFFFF"
  rail: "#F3F1EC"
  rail-hover: "#E9E5DE"
  tint: "#F7F5F1"
  wash: "#EFEBE4"
  hair: "#E6E1D8"
  hair-strong: "#CFC8BC"
  signal: "#b5473c"
  text-selection: "rgb(143 182 234 / 0.4)"
  revision-white: "#FFFFFF"
  revision-white-edge: "#D9D4CB"
  revision-blue: "#CFE3FF"
  revision-blue-edge: "#8FB6EA"
  revision-pink: "#FFD3E0"
  revision-pink-edge: "#E99BB3"
  revision-yellow: "#FFF1A8"
  revision-yellow-edge: "#DCC64E"
  revision-green: "#CDEFC4"
  revision-green-edge: "#8CCB7C"
  revision-goldenrod: "#F5C451"
  revision-goldenrod-edge: "#C9962A"
  revision-buff: "#F0DDB8"
  revision-buff-edge: "#CDB07A"
  revision-salmon: "#FFC2AD"
  revision-salmon-edge: "#E68E70"
  revision-cherry: "#F7A1B0"
  revision-cherry-edge: "#D86479"
typography:
  wordmark:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
  display:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: "2.5rem"
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: "2.25rem"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.5rem"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: "1.25rem"
    letterSpacing: "0em"
  small:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  meta:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
    fontFeature: "tnum"
  control:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: "1.25rem"
  script:
    fontFamily: "Courier Prime, Courier New, Courier, monospace"
    fontSize: "12pt"
    fontWeight: 400
    lineHeight: 1.2
  sheet:
    fontFamily: "Courier Prime, Courier New, Courier, monospace"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.2
  sheet-large:
    fontFamily: "Courier Prime, Courier New, Courier, monospace"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  strip: "3px"
  row: "6px"
  control: "8px"
  segment: "7px"
  card: "10px"
  bar: "12px"
  full: "9999px"
spacing:
  rule-gap: "12px"
  gutter: "16px"
  card-x: "16px"
  card-y: "14px"
  grid-gap: "16px"
  gutter-wide: "32px"
  section-gap: "40px"
  bar-height: "64px"
  rail-width: "280px"
components:
  rail:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.ink}"
    width: "{spacing.rail-width}"
  rail-row:
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.row}"
    padding: "8px 8px"
  rail-row-hover:
    backgroundColor: "{colors.rail-hover}"
  rail-row-current:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 16px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  icon-button:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    size: "36px"
  icon-button-hover:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "14px 16px"
  card-band:
    height: "10px"
  card-new:
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    height: "120px"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.sheet}"
    rounded: "{rounded.control}"
    padding: "22px 18px 0 26px"
  sheet-large:
    typography: "{typography.sheet-large}"
    padding: "28px 18px 0 34px"
  revision-chip:
    backgroundColor: "{colors.revision-blue}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.full}"
    height: "28px"
    padding: "0 12px"
  revision-strip-page:
    backgroundColor: "{colors.revision-pink}"
    rounded: "{rounded.strip}"
    width: "18px"
    height: "26px"
  scene-row:
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.row}"
    padding: "5px 8px"
  scene-row-current:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  segmented-track:
    backgroundColor: "{colors.rail-hover}"
    rounded: "{rounded.card}"
    padding: "3px"
  segmented-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.segment}"
    height: "32px"
  filter-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    typography: "{typography.small}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 10px"
  status-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.bar}"
    height: "48px"
  page-edge:
    backgroundColor: "{colors.revision-blue}"
    height: "6px"
  menu:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    width: "288px"
  menu-item:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "10px 16px"
  wordmark:
    textColor: "{colors.ink}"
    typography: "{typography.wordmark}"
---

# Design System: Storia

## Overview

**Creative North Star: "Revision Pages"**

On a film or TV production, every round of script changes is printed on the next colour of paper: white, then blue, pink, yellow, green, goldenrod, buff, salmon, cherry. Storia gives each document in a project the next colour in that order, so a writer learns the ritual by using it. The draft's colour is its identity: it shows as the paper of its first-page sheet, as a stripe in the project card's band, as a chip that names it ("Blue pages"), and as a page in the strip of all the project's drafts. That paper is the only colour in the world.

Everything around the paper is ink on white. The interface is set in Figtree, bold where it names things, never smaller than `text-sm`. The folder rail is a soft, warm neutral paper tint with a hairline edge, and the current folder or project in it is a white slip laid on top. The one primary action on a surface is a solid ink button with white text, and focus rings are ink. The script keeps its own voice in Courier Prime at industry metrics, quoted in miniature on the sheets.

The world rejects the grey SaaS dashboard with one accent, and the cream-paper writing-app look: the rail is a neutral warm grey rather than cream, there is no serif display face, and all the colour sits in saturated revision paper rather than in the chrome.

The world is scoped by the `.sw-rev` class beside `.sw`; a surface joins it by adding the class. It covers every screen: home (`/home`), the folder page (`folder/:id`), the project page (`project/:id`), the folder rail, the screenplay editor (`document/:id`) with its scene and project rails. the dialogs, Settings, loading and load errors, and the signed-out screens. The bare `.sw` defaults in `world.css` are what's left of the previous world (purple, Montserrat) and are never seen on their own; a new surface always carries `sw sw-rev`.

**Key Characteristics:**
- Revision colours are the only colour, and they appear only as paper.
- Ink text, ink primary buttons, ink focus rings, on a white ground.
- A warm neutral paper rail (#F3F1EC) whose current row is a white slip.
- Figtree for the interface, `text-sm` at the smallest; Courier Prime for the script only.
- 8px controls and 10px cards; soft ink-tinted shadows that belong to paper.
- Sentence case throughout; stored capitals read in title case outside the script.

## Colors

Ink on white with a warm neutral rail; colour arrives only as the paper a draft is printed on.

### Primary
- **Ink** (ink): interface text, the script, the wordmark, the solid primary button, the focus ring (2px outline, 2px offset), the input focus border, and the 2px outline that marks the current page in the revision strip, the latest draft on the project shelf and the open document's card in the editor's project rail. 16:1 on white.
- **Ink Hover** (ink-hover): the primary button under the pointer.

### Secondary: the revision papers
Nine paper colours, each with a darker **edge** for its border, in the order a production prints them: **White** (revision-white), **Blue**, **Pink**, **Yellow**, **Green**, **Goldenrod**, **Buff**, **Salmon**, **Cherry**. A project's documents are ordered by when they were made (`createdOn`, oldest first, ties by id); the first is White, each next one takes the next colour, and after Cherry the cycle starts again. They are applied through two variables, `--sheet-ground` (the paper) and `--edge` (its border), which sheets, chips, the strip and the stack read.

### Neutral
- **Paper** (paper): the page ground, cards, buttons, inputs, menus, and the current rail row.
- **Paper Rail** (rail): the ground of the folder rail and the editor's scene and project rails, a soft warm neutral tint. **Rail Hover** (rail-hover) is its row and icon hover.
- **Pressed Paper** (tint): pressed fills, loading slabs, and an unreadable document's placeholder sheet.
- **Wash** (wash): icon-button hover, key caps, a breadcrumb link's hover, the plain stripe on a project with no documents, the hatching in an unreadable strip slot, and the quietest rules.
- **Hairline** (hair): the rail edge, card borders, the current rail row's ring.
- **Strong Hairline** (hair-strong): button and input borders, the dashed New card, an unreadable slot's dashed edge, borders under hover.
- **Quiet Ink** (muted): secondary text, meta, icons at rest; 7.4:1 on white and 6.6:1 on the rail.
- **Text Selection** (text-selection): selected text takes the Blue edge at 40%.

### Tertiary
- **Signal Red** (signal): errors only.

### Named Rules
**The Revision Paper Rule.** Revision colours are the only colour in the world, and they live only on paper: sheets, the stack, card bands, chips and the strip. They are never text colour, never a button, link or icon colour, and never a category code chosen by hand. A draft's colour comes from its position in the project's creation order, nothing else.

**The Ink Rule.** Where another app would reach for an accent, Storia uses ink: the one primary action is solid ink with white text, focus rings are ink, and "this one" is marked with an ink outline (the strip's current page, the shelf's latest draft) or a white slip (the rail's current row).

**The Neutral Rail Rule.** The rail is a warm neutral paper tint, never a revision colour and never cream. Its hover is one step darker; its current row is white.

## Typography

**Interface Font:** Figtree (with system-ui, sans-serif), weights 400, 600, 700 and 800 in use.
**Script Font:** Courier Prime (with Courier New, Courier, monospace).

**Character:** Figtree is a plain, friendly sans that holds up bold at large sizes and stays open at `text-sm`; Courier Prime is the script's industry face. They never swap roles.

### Hierarchy
- **Wordmark** (800, `text-2xl`, -0.02em, Ink): "Storia" in the rail and, with the rail hidden, in the bar.
- **Display** (700, `text-3xl`, `text-4xl` from 640px, tracked tight): the page heading (home's greeting, the folder or project name).
- **Headline** (700, `text-3xl`, tracked tight): the latest draft's name in Where you left off.
- **Title** (600, `text-lg`, 24px line, tracked tight): card names, two lines before they clamp. Shelf document names are 700 at `text-lg`, `text-xl` on the latest.
- **Body** (400, `text-base`): page meta under the heading, descriptions on the page and in Where you left off, inputs, menu items, the New card's label.
- **Section** (700, `text-lg`, Ink; `sw-section`): page section headings ("Where you left off", "Projects 5", "Documents 5"), with the count beside the name at 400 in Quiet Ink and no rule after it; the space above a section separates it.
- **Label** (700, `text-sm`, normal tracking, Ink): the rail's "Folders", form labels, and small panel headings ("Keys", "Account").
- **Small** (400, `text-sm`): rail rows, card descriptions and feet, the figures line, cast, dates, the strip's caption and the lesson line, the editor's save status, status bar and keyboard reference. This is the floor everywhere except the editor's dense rails.
- **Meta** (400, `text-xs`, tabular numerals, Quiet Ink): only inside the editor's scene rail, for scene numbers, Int/Ext and time, screen time, a character's counts and the current scene's cast.
- **Control** (700, `text-sm`): buttons and revision chips; Continue writing in Where you left off is `text-base` at 48px tall.
- **Script** (12pt Courier Prime, 1.2 line): the editor page. On screen the page scales as one unit to its column, 12 to 16px, through a container query; below 640px it drafts at 13px with proportional indents, while printing and the page count keep exact layout. Scene headings are 700 and uppercase; cues and transitions uppercase. The margin element label beside the script is Figtree.
- **Sheet** (10px Courier Prime, 1.2 line; **Sheet Large** 11.5px on the latest draft): the script quoted in miniature on sheets, with the screenplay indents as proportions.

### Named Rules
**The Standard Scale Rule.** Outside the editor, interface text uses Tailwind's standard sizes only (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`), never arbitrary pixel sizes. In this world the floor is `text-sm`; the one exception is Meta (`text-xs`) in the editor's scene rail, where a row carries four columns in 280px. Shared classes reach the scale through `@apply`. Only two things keep exact sizes: the script page, set to industry screenplay metrics, and the sheets' miniature Courier (10px, 11.5px on the latest), which is the script drawn to scale.

**The Two Voices Rule.** Figtree for everything that is interface, Courier Prime for everything that is script, including the script in miniature on a sheet. A sheet with nothing written says "Nothing written yet" in Figtree, because that line is interface.

**The Sentence Case Rule.** Interface text is sentence case at normal tracking. No uppercase, letter-spaced labels and no eyebrow labels above headings; a section is named by its own heading.

**The Title Case Rule.** Scene headings and character cues are stored in capitals; outside the script they read in title case ("ALLEY BEHIND THE CLUB" becomes "Alley Behind The Club"). Acronyms stay in capitals: a listed set (FBI, NYPD, ICU, POV and others), Roman numerals, and any word with no vowels. Text the writer typed in mixed case ("McGregor") is left as typed. Inside the script, capitals stay.

## Layout

A 280px rail on the left and the content on white. From 768px the rail docks with a 1px Hairline edge; below it overlays the page over a 20% black scrim and casts a shadow. Hiding the rail moves the wordmark into the bar.

The bar is 64px and holds controls only: the show-folders button when the rail is hidden, the breadcrumb on folder and project pages, then text buttons on the right with at most one ink primary, and home's account menu. Content insets 16px on phones and 32px from 640px. The page heading leads the content and is followed by 40px; sections are separated by 40px, each headed by a Label with a hairline rule 12px after it.

Cards sit in a grid of columns at least 256px wide with 16px gaps; cards in a row share the tallest card's height, and a row without descriptions stays short. Every grid ends in a dashed New card.

Where you left off places the fanned stack (300 by 340px; full width and 260px tall on phones) beside its details with a 48px gap, stacking them on phones. The project shelf lays documents out as sheets that wrap: the latest at 340px wide and 360px tall, the rest 236 by 300px, 32px apart with 40px between rows; on phones sheets take letter proportions (17:22), the latest full width and the rest two across.

The editor is three columns: the 280px scene rail, the writing desk, and the 300px project rail, both rails on Paper Rail with a hairline edge and a 64px header like the bar. From 900px both rails dock; below that they open as drawers over a 20% black scrim, and the bar gains a full-width current-scene row (number, location in bold, Int/Ext and time, chevron) that opens the scene list. A 6px page edge in the document's revision paper runs under the bar, and the desk centres the page with 16px gutters (24px from 640px). The status bar floats at the desk's bottom left and a round help button at its bottom right.

## Elevation & Depth

Mostly flat, with soft ink-tinted shadows that belong to paper. The rail, the bar and section rules never cast one. Paper lifts: sheets carry a faint resting shadow and deepen on hover, the stack's under-sheets cast a wider soft shadow so the pile reads as physical, a card lifts on hover, and the rail's current row is a white slip with a hairline ring and a 1px shadow. Menus are Float surfaces.

### Shadow Vocabulary
- **Sheet Rest** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.04)`; the top of the stack `0 1px 3px rgb(27 27 31 / 0.08)`): every sheet at rest.
- **Sheet Hover** (`box-shadow: 0 2px 8px rgb(27 27 31 / 0.1)`): a sheet when its link is hovered.
- **Stack Under** (`box-shadow: 0 1px 2px rgb(27 27 31 / 0.08), 0 4px 10px rgb(27 27 31 / 0.06)`): the earlier drafts fanned under the latest.
- **Card Hover** (`box-shadow: 0 2px 8px rgb(27 27 31 / 0.08)`): a card under the pointer, with its border to Strong Hairline.
- **Rail Slip** (`box-shadow: 0 0 0 1px var(--hair), 0 1px 2px rgb(27 27 31 / 0.06)`): the current rail row.
- **Float** (`box-shadow: 0 0 0 1px rgb(0 0 0 / 0.05), 0 4px 16px rgb(0 0 0 / 0.08)`): the account menu, the editor's dot menu, the status bar, the help button and the keyboard reference popover.
- **Segment** (`box-shadow: 0 1px 2px rgb(27 27 31 / 0.1), 0 0 0 1px var(--hair)`): the selected segment of the editor's segmented control.
- **Current Card Ring** (`box-shadow: 0 0 0 1px var(--ui)` with an Ink border): the open document's card in the project rail, a 2px ink outline rather than a lift.
- **Rail Drawer** (`box-shadow: 0 4px 16px rgb(0 0 0 / 0.12)`): the folder rail opened over the page below 768px; the editor's rails opened as drawers below 900px take Tailwind's `shadow-xl`.

### Named Rules
**The Paper Lifts Rule.** Only paper lifts: sheets, the stack, cards on hover, the rail's white slip, and floating menus. Docked chrome (the rail, the bar, headings and rules) is flat.

## Shapes

Gently rounded. Buttons, inputs, icon buttons, the filter field, selects and sheets share an 8px corner; cards, the New card, menus and the segmented track are 10px (its segments 7px); the status bar is 12px; rail rows keep 6px; strip pages are 3px; chips and the help button are full rounds. Borders are 1px, except the New card's 2px dash and the 2px ink outline on the shelf's latest sheet. The card band is a straight 10px strip along the card's top edge, divided into equal stripes by 1px ink lines at 10%.

Icons are drawn, not set: a 24px grid, a single 1.4px stroke, round caps and joins, in the current text colour, 15 to 18px in this world.

## Components

### Buttons
Bold and plain.
- **Shape:** 8px corners, 40px tall, 16px side padding, Control type.
- **Default:** Paper with a 1px Strong Hairline; hover turns the border Ink; pressed fills Pressed Paper.
- **Primary:** solid Ink with white text and an Ink border; hover to Ink Hover. One per surface at most (New project on home; Continue writing on the latest draft).
- **Focus:** the 2px Ink ring at a 2px offset. Disabled at 55% opacity.
- **Touch:** at least 40px on coarse pointers.

### Icon buttons
- **Shape:** 36px square, 8px corners (40px on touch). Quiet Ink at rest; Wash fill and Ink on hover or when expanded; on the rail the hover is Rail Hover.

### Inputs
- **Style:** Paper, 1px Strong Hairline, 8px corners, 9px by 12px padding, Body type, Quiet Ink placeholders.
- **Focus:** the border turns Ink with a 1px Ink ring. **Error:** a Signal Red border and ring.

### Rail
- **Ground:** Paper Rail with a 1px Hairline on its right edge, 280px wide. The wordmark and a hide button sit in a 64px header. "Folders" is a Label with a + icon button (New folder) at its right; that and the Folders section's New card on home are the only ways to make a folder, so home's bar carries only New project.
- **Rows:** Small type, 8px vertical padding, 6px corners, 1px gaps. A folder row has a chevron to expand its projects and a quiet count; project rows indent beneath it. Projects in no folder follow under a "Projects" Label, 24px below the folders, with their names level with the folder names. That section shows only when there are such projects.
- **Hover:** Rail Hover. **Current:** a white slip with the Rail Slip shadow, the name at 700.

### Cards
Projects and folders on home and the folder page.
- **Shape:** Paper, 1px Hairline, 10px corners, 14px by 16px inside.
- **Band:** a project card opens with a 10px band of one stripe per document, in revision order (White, Blue, Pink…), capped at nine; a project with no documents shows one plain Wash stripe; folder cards have no band.
- **Content:** the name in Title type (the full name as a tooltip), the description in Small Quiet Ink (two lines), then a foot pinned to the bottom under a Wash rule: on home a project's folder behind a 15px folder icon ("No folder" when it has none); a folder's project names in Ink; then the count (the number leading in Ink at 600 with tabular numerals, the unit quiet) and the activity, each wrapping whole.
- **Hover:** border to Strong Hairline with the Card Hover shadow. **Pressed:** Pressed Paper. **Focus:** the ring follows the 10px corners.
- **New:** a 2px dashed Strong Hairline card at least 120px tall, a plus beside the label in Body Quiet Ink, ending each grid.
- **Order:** most recently updated first, compared as times.

### Sheets
A document shown as its own first page, on its revision's paper.
- **Sheet:** the revision paper with its edge as a 1px border, 8px corners, the Sheet Rest shadow; the first fourteen written blocks in Sheet type with screenplay indents as proportions, fading into the paper over the last 56px. With no revision it is Paper with a Hairline that darkens on hover.
- **Large:** the latest draft's sheet sets the script in Sheet Large with wider margins.
- **Empty:** "Nothing written yet", centred, in Small Quiet Ink.

### Revision stack (signature)
Home's latest draft as a fanned pile: its sheet on its revision paper, with the two drafts made before it lying underneath, each on its own colour, offset (8px by 6px at 1°, then 16px by 12px at 2°) with the Stack Under shadow. A first draft lies over its own next pages in its own colour. On hover the pile fans a little further over 220ms (`cubic-bezier(0.22, 1, 0.36, 1)`); reduced motion turns the movement off.

### Revision chip
A full-round pill, 28px tall, 12px side padding, Control type in Ink, on the revision's paper with its edge as the border: "Blue pages". It sits beside the strip on home and under each sheet on the project shelf.

### Revision strip
The project's drafts as a row of small pages, oldest first: 18 by 26px, 3px corners, each on its paper with its edge, 4px apart. The draft being shown takes a 2px Ink outline at a 2px offset. A document that couldn't be read is a hatched slot (Wash and Paper diagonals) with a dashed Strong Hairline edge. Its caption follows in Small Quiet Ink ("2nd of 5 in Paper Boats"), and a lesson line beneath explains the ritual once. The strip appears only when a project has more than one document.

### Where you left off
Home's first section: the latest-edited draft of the most recently updated project with documents, chosen once all that project's documents have loaded (a Pressed Paper slab holds its place meanwhile; the section is left out when nothing is readable). The whole block is one link to the editor. Beside the revision stack: the name in Headline type, the project, folder and when in Body Quiet Ink, the description (three lines), the figures line and cast in Body, the strip with its chip and caption, the lesson line, then the ink Continue writing at 48px.

### Project shelf
The project page lists documents as sheets, last edited first; the latest (chosen once all have loaded) is larger, outlined in 2px Ink, and carries the ink Continue writing. Beneath each sheet: the name, an optional description (two lines, Small Quiet Ink), the figures line ("**5** pages · **16** scenes · **4:04** runtime"), the cast behind the two-person icon, when, and the revision chip. Loading and unreadable documents are Pressed Paper slabs with a Hairline, the name, and a one-line status. The shelf ends with a dashed New document sheet.

### Breadcrumb
Where the page sits, in the bar where a back button would be: each place above it as a `text-sm` Quiet Ink link (6px corners, Wash and Ink on hover, truncating at 14rem), a 14px drawn chevron between, then the page itself at 700 in Ink, marked `aria-current`. Folder and project pages start at Home; the editor starts at the folder, since its rail carries the wordmark home. Below 640px only the nearest place above stays. The project heading no longer repeats its folder, because the breadcrumb already names it.

### Page heading
The name in Display type, then its counts or activity in Body Quiet Ink 8px below, then the writer's description in Body at up to 65ch. On home the heading greets the writer by time of day and first name ("Good morning, Sam").

### Editor (`document/:id`)
The script page is unchanged: Courier Prime at industry metrics on white, with no frame; the white is the page.
- **Bar:** 64px. The show-scenes button when the rail is hidden, then the breadcrumb (folder › project) ending in the document name (`text-base` at 700, the page's `h1`), with its revision chip beside it (24px tall, hidden below 640px) and the save status beneath in Small Quiet Ink ("Updated at 09:21 AM"; Signal Red with a Retry link on failure), then the dot menu (a Float menu with 10px corners: Export as Fountain, Print or save as PDF) and show-project.
- **Page edge:** a 6px band under the bar in the document's revision paper with a 1px bottom border in its edge colour, so the page you're writing on wears its colour.
- **Scene rail:** the wordmark header, then a segmented control (Scenes, Characters) and the filter field. Scene rows are a grid of an 18px right-aligned number, the location in Small, a 60px Int/Ext and time column and a 32px screen time ("0:15"), with Meta for everything but the location. Hover is Rail Hover; the current scene is a white slip with only its location bold, and it opens to show the scene's first line of action (Small, Ink, two lines) and its cast behind a 14px two-person icon. A quiet "New scene" row ends the list, and a footer states the count. Character rows put the name at 700 over its counts in Meta, with a chevron that expands its scenes on a 1px hairline rail; "In scene 4" and "Everyone else" are Labels.
- **Segmented control:** a Rail Hover track with 3px inset and 10px corners; 32px segments in `text-sm` at 600, Quiet Ink; the selected one a Paper chip with the Segment shadow.
- **Filter field:** 36px, Paper, a Strong Hairline, 8px corners, a search icon, `text-sm` text; focus turns the border Ink with a 1px Ink ring; Escape clears.
- **Select:** 36px, Paper, Strong Hairline, 8px corners, a drawn chevron, `text-sm`; the border turns Ink on hover.
- **Project rail:** 300px, the project name (`text-base` at 700, linking to the project) in its header, a "Documents" Label with the count, then a card per document 8px apart: a 10px band in the document's revision paper, the name (`text-base`, Title weight), an optional description (two lines), and "Updated …" with "Blue pages" opposite it in Small Quiet Ink. The open document's card is outlined in Ink (Current Card Ring).
- **Status bar:** a Float surface 48px tall with 12px corners at `text-sm`: word count (from 640px), the element select, "Scene 1", running time in tabular numerals, and a button that collapses it to a 48px square.
- **Help:** a 40px round Float button opening the keyboard reference in a Float popover (`text-sm`, keys as Wash caps with a Hairline, "Keys" and "Elements" Labels).
- **Character autocomplete:** a Paper list under a cue, names in the script's capitals in Ink, Wash on the active option.

### Account menu
A Float surface with 10px corners, 288px wide: the writer's name (Body at 700) and email (Small Quiet Ink), then Settings and Log out as Body menu items (10px by 16px, Wash hover, 40px on touch), then the plan and version in Small Quiet Ink under a rule.

### Dialogs and Settings
The New folder, project and document dialogs and Settings are native modal `<dialog>` elements in Revision Pages (`.sw.sw-rev`): a Float surface with 12px corners, at most 440px wide (480px for Settings), 24px side padding, over a 20% black backdrop that closes it; Escape closes it and focus returns to the opener. The title at `text-lg` 700, labelled 40px inputs (a Description label ends in "(optional)" in Quiet Ink), then Cancel and the ink primary right-aligned. A failed submit shows its message inline in Signal Red at `text-sm`; the named field takes focus. Settings lists the account as a two-column ruled list (`text-sm` Quiet Ink terms, `text-base` values) with "Not set" or "Couldn't load" rather than loading forever.

### Loading and load errors
Both carry `.sw.sw-rev`. Home, folders and projects share one frame (`Shell`), so moving between them never redraws the rail. It marks the destination at once, and its folders survive a trip into the editor and back. A screen change never passes through an empty frame. Screens start from what the tab has already seen, so most of them draw their content on the first frame. When one has to load, the previous screen stays up and can't be clicked, for 300ms at most, and after that the next one shows with its spinner. The swap itself is immediate, with no dissolve, so two screens never show through each other. The bar holds still, and only the content under it settles in, over 200ms with a 4px drop (`.sw-screen-in`), or a 150ms fade with reduced motion. The editor arrives the same way. It draws the script the project's shelf already read, its bar and rails appear at once, and only the page settles. Switching documents from the project rail settles the new page too. The spinner waits 350ms before fading in (`.sw-wait`), so quick loads show nothing at all. When the content arrives, it settles in with `.sw-enter`: a 260ms fade with a 6px drop on `cubic-bezier(0.16, 1, 0.3, 1)`, like a page coming to rest (a 160ms fade only with reduced motion). It is used once per screen, on the main column, the editor, the signed-out card and a load error, and never on sections inside a screen. A 22px Hairline ring with one Quiet Ink arc turning every 800ms (2400ms with reduced motion); after 12s a quiet line and a plain Try again. A load error is centred at most 384px wide: the title at `text-lg` 700, the reason in Quiet Ink, then an ink Try again and a plain Log out, or Go home when the thing wasn't found.

### Signed-out screens
Log in, create account and page not found (`AuthCard`) sit on the rail's paper tint: the wordmark at `text-4xl` 800 in ink, centred 32px above one white page (12px corners, a Hairline Under Hover border, at most 420px wide, 24px side padding, 32px from 640px) with the next two revisions, blue and pink, fanned beneath it (translated and turned by a degree or two, less on phones). The title at `text-2xl` 700, labelled 40px inputs 16px apart, then one ink primary at full width, 48px tall. Errors show inline in Signal Red at `text-sm`; the named field takes focus and a Signal Red border; an unticked terms box takes a 2px Signal Red ring. A `text-sm` Quiet Ink line sits 40px below with an ink text link, underlined in Hairline Under Hover and turning ink on hover.

## Do's and Don'ts

### Do:
- **Do** give each document its revision colour by creation order, White first, and show it only as paper: sheet, band stripe, chip, strip page.
- **Do** make the one primary action on a surface solid Ink with white text.
- **Do** mark the current item in Ink: a white slip on the rail, a 2px Ink outline on the strip and shelf.
- **Do** set interface text in Figtree at Tailwind's standard sizes, `text-sm` at the smallest (`text-xs` only for Meta in the editor's scene rail).
- **Do** keep Courier Prime for the script and its miniatures, and keep the script's own sizes in the editor.
- **Do** use 8px corners for controls and sheets and 10px for cards and menus.
- **Do** draw icons as single 1.4px strokes on a 24px grid in the current text colour.
- **Do** add `.sw-rev` beside `.sw` when a surface joins this world, and read the tokens through the variables rather than restating hex values.

### Don't:
- **Don't** use a revision colour as text, a button fill, a link or an icon colour, or to code anything other than a draft's place in the order.
- **Don't** add another accent colour; the previous world's purple is retired.
- **Don't** tint the rail cream or with a revision colour.
- **Don't** set interface text at an arbitrary pixel size, or below `text-sm` outside the scene rail's Meta; only the script page and the sheets' miniature script keep exact sizes.
- **Don't** set interface labels in uppercase with wide tracking, or add eyebrow labels above headings.
- **Don't** put shadows on the rail, the bar, headings or rules.
- **Don't** use Courier Prime for interface text, or Figtree inside the script.
