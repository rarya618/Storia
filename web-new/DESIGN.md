---
name: Storia
description: Quiet white, soft ink and light hairlines; the script catalogued in Montserrat, with one muted red for "you are here".
colors:
  ink: "#1d1d1f"
  paper: "#ffffff"
  muted: "#6a6a6e"
  hair: "#e3e3e5"
  hair-strong: "#d6d6d9"
  rule: "#efeff0"
  wash: "#f5f5f6"
  pulse: "#bdbdc2"
  signal: "#b5473c"
  code-grey: "#a3a3a8"
  code-blue: "#7186c4"
  code-yellow: "#d9bb62"
typography:
  display:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\""
  title:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: "24px"
  wordmark:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "18px"
    letterSpacing: "0.01em"
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
  data:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "\"tnum\""
  script:
    fontFamily: "Courier Prime, Courier New, Courier, monospace"
    fontSize: "12pt"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  none: "0px"
  xs: "1px"
  sm: "4px"
  md: "6px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  panel: "20px"
  lg: "32px"
  header: "56px"
  control: "32px"
components:
  button-box:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "32px"
  button-box-hover:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
  button-box-open:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
  select-box:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 30px 0 12px"
    height: "32px"
  popover-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "20px"
  suggestion-list:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.script}"
    rounded: "{rounded.md}"
  suggestion-option-active:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
    padding: "6px 12px"
  key-cap:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  scene-marker:
    backgroundColor: "{colors.signal}"
    rounded: "{rounded.full}"
    size: "5px"
---

# Design System: Storia

## Overview

**Creative North Star: "The Catalogue Sleeve"**

Storia's world is a catalogue entry set quietly on white: unprinted paper, soft near-black ink, light grey hairlines, and labels in Montserrat at sentence case and normal tracking. The writing is the artwork and the interface is the catalogue information around it. The current scene number is the one anchor, a thin numeral that names where you are; everything else is small, plain and calm. Colour and depth are spent almost nowhere, so the few marks that carry them (the muted red "you are here", the cast colour code) read instantly.

The density is low and the page is open. Chrome sits at the edges: a single 56px header row and two narrow side columns, with the script centred on the white and no frame or sheet. Controls answer hover with a faint wash, not an inversion. Motion is short and functional: fills ease in 120ms, a small red dot slides to the current scene, and the numeral counts through its values.

This world started on the screenplay editor (`/document/:id`) and is the target system for all of Storia. Its first build was bolder (Archivo expanded, a 168px numeral, tracked capitals, 1px black boxes, an inverting hover and a red edge bar on open controls); a quieter pass replaced it at the user's request ("the design should be understated"). The editor's surface brief at `.impeccable/surfaces/src-views-documentview-tsx.md` still describes the bold type and weight in its direction contract, and this document supersedes it on those points; its thesis (the numeral as the anchor, the shape plot as the navigator) still holds. The home, folder, project, settings and auth screens still carry the older purple, Noto Sans and Norican look; that look is legacy drift awaiting migration, and new work must not borrow from it.

**Key Characteristics:**
- Unprinted white (`paper`) and soft ink (`ink`), light only (`color-scheme: light`).
- Light grey hairlines and 6px corners on controls; separation by line, not by shadow.
- Montserrat for the interface at four weights: 300 for the numeral, 400 for body, 500 for labels and titles, 600 for the wordmark.
- Sentence-case labels at normal tracking; stored capitals (locations, cast) shown in title case.
- Courier Prime is reserved for the script itself.
- Muted signal red means "you are here" and nothing else.
- A muted four-colour cast code (grey, blue, yellow, white keyline) identifies characters in pairs, always decoded to a name beside it.

## Colors

A soft black-and-white world with one reserved muted red and a small, muted pigment set used only for coding characters.

### Primary
- **Soft Ink** (`ink`, about 16.8:1 on white): all primary text, icon strokes, the current draft in the breadcrumb, data values and the text caret. Selection is ink at 10%.

### Secondary
- **Signal Red** (`signal`, 5.6:1 on white): the current scene's pulse in the script shape, its gutter number, the travelling dot beside it, and the "Not saved" status. Nothing decorative.

### Tertiary
- **Code Grey, Code Blue, Code Yellow** (`code-grey`, `code-blue`, `code-yellow`), plus paper with a light grey keyline as the fourth code: each speaking character gets an ordered pair as two small blocks. They never appear as text, surfaces or UI states.

### Neutral
- **Unprinted White** (`paper`): the page, every control's resting fill, popovers, and the knock-out fill under each script-shape pulse so later lines occlude earlier ones.
- **Pencil Grey** (`muted`, 5.4:1 on white): secondary text such as breadcrumb ancestors and slashes, place and time, save status, ruled headings, data-list keys, the select chevron, the margin element label, key-cap text and unselected scene numbers.
- **Hairline** (`hair`): structural 1px lines: control and panel borders, the header rule, the top rule of a data list, the line after a ruled heading.
- **Hairline, Pressed** (`hair-strong`): the border of a control under hover or open, and the short scene ticks in the compact pulse.
- **Quiet Rule** (`rule`): the quietest dividers, between data-list rows, under the compact sticky strip and inside the phone menu. Never text.
- **Wash** (`wash`): the only surface tint: hover and open fills on controls, the active autocomplete row, key caps.
- **Pulse Grey** (`pulse`): the hairline of every scene in the script shape except the current one.

### Named Rules
**The You-Are-Here Rule.** Signal red marks only the writer's current position or a failure they must act on. If a red mark does not answer "where am I" or "what broke", it is wrong.

**The Decoded Code Rule.** A cast colour code always sits beside the character's name. Colour alone never identifies anyone.

**The Wash Rule.** The only fills besides paper are `wash` and ink at low alpha (10% for text selection, 5% for hovering a scene in the script shape). State is shown by a wash and a slightly firmer border, never by inversion or a coloured bar.

## Typography

**Display Font:** Montserrat (300, 400, 500, 600 loaded), with system-ui and sans-serif as fallbacks
**Body Font:** Montserrat
**Script Font:** Courier Prime, for the screenplay only

**Character:** One calm geometric sans used at a narrow range of sizes and weights, so nothing shouts: a light 300 numeral for the anchor and 500-weight sentence-case labels for everything around it. Courier Prime keeps the script in the industry's typewriter voice and stays out of the interface.

### Hierarchy
- **Display** (300, 44px, line-height 1, -0.02em, tabular figures): the current scene number, zero-padded to two digits. One per screen. 32px in the compact layout; three-digit numbers step down to 70%.
- **Title** (500, 15px/24px): the current scene's location under the numeral, in title case. 14px/20px in the compact layout.
- **Wordmark** (600, 15px, 0.01em): "Storia" in the header, from 640px.
- **Label** (500, 12.5px/18px, 0.005em, sentence case): the interface voice: buttons, the element picker, breadcrumbs, save status, ruled headings, cast names (title case), data-list keys, place and time. The element name in the script margin uses it at 11px in `muted`.
- **Body** (400, 14px): shortcut descriptions. Helper sentences run at 13px/20px in `muted`.
- **Data** (400, 13px, tabular figures): data-list values.
- **Script** (Courier Prime 400, line-height 1.2; scene headings 700; headings, cues and transitions uppercase): sized in `ch` and `em` so the page scales as one unit, `clamp(9px, …, 16px)` on screen, never below 14px in the three-column layout, 13px on phones, exactly 12pt with line-height 1 in print.

### Named Rules
**The One Anchor Rule.** The scene numeral is the only large type on a screen, and at 44px light it is an anchor, not a poster. Titles, names and headings stay between 11 and 15px.

**The Sentence Case Rule.** Interface labels are sentence case at normal tracking. Text the script stores in capitals (locations, character names) is shown in title case outside the script. No tracked uppercase in the interface.

**The Courier Fence Rule.** Courier Prime appears only in the script and in the autocomplete list that completes a script line. Every other piece of text, key caps included, is Montserrat.

## Layout

At 1320px and wider the editor is three columns inside a 1720px max container with 32px side padding and 32px gaps: a 240px scene column on the left (numeral, location, cast, data list), the page in the flexible centre, and a 236px script-shape column on the right. Both side columns are sticky with 40px vertical padding and scroll independently. The breakpoint is where the centre column still leaves the script at 14px.

Below 1320px the columns stack. Only a sticky strip stays pinned while you write: the compact numeral row (numeral, location, place and time) above one continuous full-width pulse, closed by a `rule` line. The cast list follows it unpinned, then the page. Side gutters are 16px, 24px from 640px.

The header is a 56px row over a 1px `hair` rule, 16px padding (32px from 640px) and 8px gaps (16px from 640px). The wordmark, slash breadcrumb and status appear from 640px, the project ancestor from 768px; Export, Print and Shortcuts appear from 768px, and below that a single menu box opens a panel holding status, export, print and the shortcut list. Controls are 32px tall.

The left column spaces its groups at 32px (numeral, location, "In this scene", data list), with 16px from numeral to location and 12px from heading to list.

The script page follows standard screenplay metrics in `ch` of Courier: an 85ch page with 15ch left and 10ch right margins, character cues indented 22ch, parentheticals 16ch, dialogue 10ch. On phones the indents become proportional so the text stays readable; print and the page count keep exact layout. Print outputs only the script on US Letter with 1in margins and a 1.5in binding margin.

## Elevation & Depth

The world is flat. Surfaces are paper on paper, separated by hairlines; there is no blur and no layered tonal surface. The single shadow is a faint ambient one under the character autocomplete list, which floats over the script text it completes. The shortcuts panel and phone menu carry only a `hair` border. The white cast-code block's inset keyline is a border drawn with `box-shadow`, not depth.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 4px 16px rgb(0 0 0 / 0.06)`): the autocomplete list only.

### Named Rules
**The Hairline-Not-Shadow Rule.** Separate things with a 1px line in `hair` or `rule`. A layer that floats over the script may take the faint float shadow; nothing else is lifted.

## Shapes

Soft but restrained. Controls (boxes, the element picker) and the autocomplete list have 6px corners, key caps 4px, cast-code blocks 1px. The focus ring matches the controls: a 2px outline of ink at 35% alpha, offset 2px, with a 6px radius. Its shape is the system's; its 35% alpha is not settled: it measures about 2.2:1 on white, short of the 3:1 a focus indicator needs, so a new surface should keep the soft 6px form but darken the ring rather than copy that alpha. The shortcuts panel and phone menu are square (0px). The current-scene marker is a 5px circle.

The recurring geometry is the hairline: control borders, the ruled heading (a label followed by a 1px `hair` line to the column edge), and the script shape's pulses, drawn with non-scaling strokes (1px, 1.5px for the current scene). Icons are drawn on a 24px grid in a 1.4px stroke with square caps, inline as SVG; the select's chevron is drawn with two small `muted` triangles rather than a glyph.

## Components

### Buttons
Light and quiet: a pale bordered box that takes a faint wash when you point at it.
- **Shape:** gently rounded (6px), 32px tall, 12px side padding, 8px gap; icon-only boxes use 8px padding around an 18px stroke icon.
- **Default (the only kind):** paper fill, ink label text, 1px `hair` border.
- **Hover:** `wash` fill and a `hair-strong` border over 120ms.
- **Open / On:** the same wash and border as hover, held while the control is expanded.
- **Focus:** the soft 6px focus ring.
- **Disabled:** 40% opacity, not-allowed cursor.
- **Inline text action:** "Retry" beside a failed save is an underlined text button (4px underline offset), not a box.

### Inputs / Fields
- **Element picker (select):** a box matching the buttons, 32px tall, with a two-triangle `muted` chevron 12 to 16px from the right edge. Hover firms the border to `hair-strong`. 9rem wide on phones with 10px left and 26px right padding so "Parenthetical" fits, 14.5rem from 640px. Disabled at 45% opacity.
- **Script lines:** borderless auto-growing fields on the white. The focused line shows an ink caret and its element name in the left margin (from 640px) instead of a focus ring. Placeholders show only on the active line.
- **Character autocomplete:** a white list under the cue with a `hair` border, 6px corners and the float shadow. Names stay uppercase Courier, as the script writes them; the active row takes the `wash`.

### Navigation
The header is one row: a back box, the wordmark, a slash breadcrumb (ancestors and slashes in `muted`, the current draft in ink, ancestors darken to ink on hover), then status, picker and boxed actions on the right. The script shape is the scene navigator: every scene line is a real button, hover lays a 5% ink tint over the row, and the current scene is red.

### Popover Panel
A white panel with a 1px `hair` border, square corners and no shadow, opening 44px below its trigger, 25rem wide. The shortcuts list uses ruled headings ("Keys", "Elements") over a two-column list of key caps (Montserrat 12px in `muted` on `wash`, 4px corners, `hair` border) and 14px descriptions. On phones it opens with a `rule`-divided strip holding status, Export and Print.

### Scene Masthead (signature)
The current scene catalogued: the light numeral, which counts to its new value over 320ms with a cubic ease-out when you move between scenes (instant under reduced motion), the location in title case, place and time in `muted` labels, an "In this scene" ruled heading over cast codes and title-case names, and a data list of page, length in eighths, scenes and cast. The data list is a stack of rows with `muted` label keys on the left and 13px tabular values on the right, 8px row padding, a `hair` rule on top and `rule` lines between. When a scene has no dialogue, a 13px `muted` helper sentence takes the cast list's place. Nothing sits above the numeral.

### Script Shape (signature)
The whole script as stacked hairline pulses, one per scene, 16px apart: line length follows the scene's length and the peaks are its dialogue (up to 11px tall). Each pulse is backed by a paper fill so later lines occlude the ones behind them. Every pulse is `pulse` grey at 1px except the current scene's, which is `signal` at 1.5px. Zero-padded scene numbers sit in an 11px gutter to the left, `muted` or `signal` for the current one. A 5px red dot slides to the current scene over 360ms on `cubic-bezier(0.25, 1, 0.5, 1)`. In the compact layout it becomes one continuous 34px-tall pulse with each scene a proportional stretch (at least 12px), separated by short `hair-strong` ticks.

### Cast Code
Two 10 by 6px blocks with a 2px gap and 1px corners, coloured from the code set; the white block carries a light grey inset keyline. Always followed by the character's name in title-case label type.

## Do's and Don'ts

### Do:
- **Do** draw controls as a 1px `hair` box on `paper` with 6px corners, 32px tall.
- **Do** answer hover and the open state with a `wash` fill and a `hair-strong` border, over 120ms.
- **Do** set interface labels in Montserrat 500 at 12.5px, sentence case, normal tracking.
- **Do** show locations and character names in title case outside the script.
- **Do** keep one numeral anchor per screen, in Montserrat 300 at 44px (32px compact), with nothing above it.
- **Do** use a ruled heading (a `muted` label, then a `hair` line to the edge) to title a group of content.
- **Do** draw every scene pulse in `pulse` grey and only the current scene in `signal`.
- **Do** reserve `signal` for the current position or a failure the writer must act on.
- **Do** pair every cast colour code with the character's name.
- **Do** draw icons as 1.4px square-capped strokes on a 24px grid, inline as SVG.

### Don't:
- **Don't** set interface text in tracked uppercase, or bring back Archivo, the oversized numeral, black boxes, the inverting hover or the red edge bar from the first build.
- **Don't** add shadows, blur or layered tonal surfaces beyond the autocomplete's faint float; separate with hairlines.
- **Don't** use `signal` red decoratively, for hover, or as a cast code colour.
- **Don't** use Courier Prime for interface text, or Montserrat for the script.
- **Don't** introduce the legacy purple, Noto Sans or Norican look into screens built in this world; it is the system being replaced.
- **Don't** use `rule`, `hair` or `pulse` grey for text; they fail contrast and exist only for lines.
- **Don't** add a dark theme by inverting tokens; the world is light-only until a dark variant is designed.
