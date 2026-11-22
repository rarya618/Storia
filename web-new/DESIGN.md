---
name: Storia
description: Unprinted white, black ink and hairlines; the script catalogued like a record sleeve.
colors:
  ink: "#0d0d0d"
  paper: "#ffffff"
  muted: "#5c5c5c"
  hair: "#0d0d0d"
  rule: "#e4e4e4"
  signal: "#d8241a"
  code-grey: "#8a8a8a"
  code-blue: "#2445d4"
  code-yellow: "#f0c000"
typography:
  display:
    fontFamily: "Archivo, Noto Sans, Arial, sans-serif"
    fontSize: "min(10.5vw, 168px)"
    fontWeight: 200
    lineHeight: 0.82
    letterSpacing: "-0.035em"
    fontFeature: "\"tnum\""
    fontVariation: "\"wdth\" 125"
  title:
    fontFamily: "Archivo, Noto Sans, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.24em"
    fontVariation: "\"wdth\" 112"
  wordmark:
    fontFamily: "Archivo, Noto Sans, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.34em"
    fontVariation: "\"wdth\" 125"
  label:
    fontFamily: "Archivo, Noto Sans, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.26em"
    fontVariation: "\"wdth\" 112"
  body:
    fontFamily: "Archivo, Noto Sans, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    fontFeature: "\"tnum\""
    fontVariation: "\"wdth\" 100"
  script:
    fontFamily: "Courier Prime, Courier New, Courier, monospace"
    fontSize: "12pt"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "14px"
  lg: "32px"
  header: "56px"
  control: "32px"
components:
  button-box:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "32px"
  button-box-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  select-box:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 34px 0 14px"
    height: "32px"
  popover-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "20px"
  suggestion-option-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "6px 12px"
  key-cap:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "2px 6px"
---

# Design System: Storia

## Overview

**Creative North Star: "The Catalogue Sleeve"**

Storia's world is a record sleeve set in white: unprinted paper, black ink, 1px hairline boxes, and labels engraved in wide-tracked capitals. The writing is the artwork and the interface is the catalogue information around it. A single enormous thin numeral names where you are; everything else is small, tracked, square and quiet. Depth, colour and ornament are spent almost nowhere, so the few marks that carry them (the red "you are here", the cast colour code) read instantly.

The density is low and the page is open. Interface chrome sits at the edges in a thin row of caps tokens and two narrow side columns, and the script sits centred on the white with no frame or sheet. Hover answers by inverting a box to solid ink rather than tinting it. Motion is short and functional: colours swap in 120ms, the red marker slides to the current scene, and the scene numeral counts through its values.

This world started on the screenplay editor (`/document/:id`) and is the target system for all of Storia. The home, folder, project, settings and auth screens still use the older purple, Noto Sans and Norican look; that look is legacy drift awaiting migration, not part of this system, and new work must not borrow from it.

**Key Characteristics:**
- Unprinted white (`paper`) and near-black ink, light only (`color-scheme: light`).
- 1px ink hairlines draw every box; corners are square everywhere.
- Archivo on its width axis: expanded and thin for the numeral, expanded and tracked for caps labels.
- Courier Prime is reserved for the script itself.
- Signal red means "you are here" and nothing else.
- A four-colour cast code (grey, blue, yellow, white keyline) identifies characters in pairs, always decoded to a name beside it.

## Colors

A black-and-white world with one reserved red and a small pigment set used only for coding characters.

### Primary
- **Press Ink** (`ink`): all text, hairline borders, icon strokes, the inverted hover fill of boxed controls, the selected autocomplete row, and the scrollbar thumb. `hair` carries the same value and is the token for 1px structural lines (box borders, the header rule, the top rule of a data list, the heading rule).

### Secondary
- **Signal Red** (`signal`, 5.0:1 on white): the current scene's pulse in the script shape, its scene number, the travelling marker beside it, the inset edge bar on a control that is open or on, and the "Not saved" status. Nothing decorative.

### Tertiary
- **Code Grey, Code Blue, Code Yellow** (`code-grey`, `code-blue`, `code-yellow`), plus paper with an ink keyline as the fourth code: each speaking character gets an ordered pair of these as two 18 by 8px blocks. They never appear as text, surfaces or UI states.

### Neutral
- **Unprinted White** (`paper`): the page, every control's resting fill, popovers, and the knock-out fill under each script-shape pulse so later lines occlude earlier ones.
- **Pencil Grey** (`muted`, 6.6:1 on white): secondary text such as breadcrumb ancestors, the time/place line, save status, the active element's margin label and unselected scene numbers.
- **Quiet Rule** (`rule`): dividers between rows of a data list and under the mobile sticky masthead. Never used for text.

### Named Rules
**The You-Are-Here Rule.** Signal red marks only the writer's current position or a failure they must act on. If a red mark does not answer "where am I" or "what broke", it is wrong.

**The Decoded Code Rule.** A cast colour code always sits beside the character's name. Colour alone never identifies anyone.

**The Ink-Tint Rule.** The only tints are ink at low alpha: 14% for text selection, 5% for hovering a scene in the script shape. No other greys or washes are introduced as surfaces.

## Typography

**Display Font:** Archivo (variable, `wdth` 62 to 125), with Noto Sans and Arial as fallbacks
**Body Font:** Archivo
**Label/Mono Font:** Courier Prime, for the screenplay only

**Character:** One grotesque stretched to two extremes: a hairline-thin, extra-wide numeral that acts as the only headline, and small expanded capitals tracked wide enough to read as engraving. Courier Prime keeps the script in the industry's typewriter voice and stays out of the interface.

### Hierarchy
- **Display** (200, `min(10.5vw, 168px)`, line-height 0.82, `wdth` 125, tabular figures): the current scene number, zero-padded to two digits. One per screen. It steps down to 70% for three-digit numbers and to 56px in the compact phone masthead.
- **Title** (500, 13px, tracking 0.24em, `wdth` 112, uppercase): the current scene's location under the numeral.
- **Wordmark** (600, 13px, tracking 0.34em, `wdth` 125, uppercase): STORIA in the header.
- **Label** (500, 11px/16px, tracking 0.26em, `wdth` 112, uppercase): the world's voice for everything else: buttons, the element picker, breadcrumbs, save status, section headings, cast names, data-list keys, the element label in the script margin. Long single values (the draft title in the breadcrumb on phones, the element picker on phones) tighten to 0.12em and 0.04em respectively so they fit.
- **Body** (400, 14px, tabular figures): data-list values, shortcut descriptions. Helper sentences run at 13px/20px in `muted`.
- **Script** (Courier Prime 400, 12pt equivalent, line-height 1.2; scene headings 700): sized in `ch` and `em` so the page scales as one unit, `clamp(9px, …, 16px)` on screen, 13px on phones, exactly 12pt with line-height 1 in print.

### Named Rules
**The One Headline Rule.** The scene numeral is the only large type on a screen. Titles, names and section headings stay in 11 to 13px caps.

**The Courier Fence Rule.** Courier Prime appears only in the script and in key caps that quote what the writer types. Interface text is always Archivo.

## Layout

At 1320px and wider the editor is three columns inside a 1720px max container with 32px side padding and 32px gaps: a 240px scene column on the left (numeral, scene label, cast, data list), the page in the flexible centre, and a 236px script-shape column on the right. Both side columns are sticky and scroll independently. The 1320px breakpoint is chosen so the script text never drops below 14px.

Below 1320px the columns stack: a sticky strip holds the compact numeral beside the scene label and a single continuous pulse spanning the full width, with the cast list below it and the page after. Phone gutters are 16px (24px from 640px).

The header is a 56px row with a 1px ink rule beneath it; controls are 32px tall with 8px gaps on phones and 16px from 640px. The project breadcrumb appears from 768px, the export, print and keys buttons from 768px; below that a single menu box opens a panel holding status, export, print and the shortcut list.

The script page follows standard screenplay metrics in `ch` of Courier: an 85ch page with 15ch left and 10ch right margins, character cues indented 22ch, parentheticals 16ch, dialogue 10ch. On phones indents become proportional so text can stay readable; print and the page count keep exact layout. Print outputs only the script on US Letter with 1in margins and a 1.5in binding margin.

## Elevation & Depth

The world is flat. There are no drop shadows, no layered surfaces and no blur. A popover or autocomplete list is distinguished only by a 1px ink border on white and its stacking order. The one `box-shadow` in the system is not depth: it draws a 5px inset signal-red bar on the right edge of a control that is open or on, and a 1px inset ink keyline around the white cast-code block.

### Named Rules
**The Hairline-Not-Shadow Rule.** Separate things with a 1px line in `hair` or `rule`, never with elevation. If a layer needs to stand out, give it an ink border.

## Shapes

Square everything: 0px radius on boxes, selects, popovers, key caps and even the focus ring. The focus ring is a 1.5px ink outline offset 2px. The recurring geometry is the hairline: box borders, the heading rule (a caps label followed by a 1px line running to the column edge), and the script shape's pulses, drawn with non-scaling 1px strokes (1.8 to 2px for the current scene). Icons are drawn on a 24px grid in a 1.4px ink stroke with square caps so they match the hairlines; the select's chevron is drawn the same way rather than taken from a glyph.

## Components

### Buttons
Boxed and blunt: a 1px ink square that turns solid ink when you point at it.
- **Shape:** square (0px), 32px tall, 14px side padding; icon-only boxes use 8px padding around an 18px stroke icon.
- **Primary (the only kind):** paper fill, ink text and border, label type.
- **Hover / Focus:** fill and text invert to ink on paper over 120ms; focus shows the 1.5px offset ink ring.
- **On / Open:** a 5px signal-red inset bar on the right edge, with right padding grown to 19px so the label does not shift into it.
- **Disabled:** 35% opacity, not-allowed cursor.

### Inputs / Fields
- **Element picker (select):** a boxed control matching the buttons, 32px tall, with a two-triangle ink chevron drawn 17px from the right edge. Label type at 0.18em tracking from 640px; on phones it tightens to `wdth` 100, 0.04em tracking and 10px padding so "Parenthetical" fits.
- **Script lines:** borderless auto-growing fields on the white. The focused line shows an ink caret and its element name in caps in the left margin instead of a focus ring. Placeholders are mid-grey and show only on the active line.

### Navigation
The header is a single row of caps tokens: a back box, the STORIA wordmark, a slash-separated breadcrumb (ancestors in `muted`, the current draft in ink), then status, picker and boxed actions on the right. The script shape is the scene navigator: every scene line is a real button, hover lays a 5% ink wash over the row, and the current scene is red.

### Popover Panel
A white panel with a 1px ink border, 0px radius and no shadow, opening 44px below its trigger. The shortcuts panel uses ruled caps headings and a two-column list of key caps (Courier Prime 12px in a 1px ink box) and 14px descriptions. The autocomplete list is the same material; its active row inverts to ink.

### Scene Masthead (signature)
The current scene catalogued: the giant numeral, which counts to a new value over 320ms with ease-out when you move between scenes (instant under reduced motion), the location in title caps, place and time in muted caps, an "In this scene" ruled heading over cast codes and names, and a data list of page, length in eighths, scenes and cast. The data list is a stack of rows with caps keys on the left and tabular values on the right, a 1px ink rule on top and quiet rules between.

### Script Shape (signature)
The whole script as stacked hairline pulses, one per scene: line length follows the scene's length and bumps follow its dialogue. Each pulse is backed by a paper fill so later lines occlude the ones behind them. Scene numbers sit in an 11px tracked gutter to the left. A 6 by 3px red marker slides to the current scene over 420ms on `cubic-bezier(0.16, 1, 0.3, 1)`. On narrow screens it collapses into one continuous 34px-tall pulse with each scene a proportional stretch, separated by short ink ticks.

### Cast Code
Two 18 by 8px blocks with a 3px gap, coloured from the code set; the white block carries a 1px ink keyline. Always followed by the character name in label caps.

## Do's and Don'ts

### Do:
- **Do** draw every control and panel as a 1px `hair` box on `paper` with 0px corners.
- **Do** answer hover on a boxed control by inverting it to solid ink, over 120ms.
- **Do** set interface labels in Archivo caps at 11px, 500 weight, `wdth` 112 and 0.26em tracking, and tighten tracking only where a single value must fit a phone.
- **Do** keep one numeral headline per screen, in Archivo 200 at `wdth` 125.
- **Do** use a ruled heading (caps label, then a hairline to the edge) to title a group of content.
- **Do** reserve `signal` for the current position or a failure the writer must act on.
- **Do** pair every cast colour code with the character's name.
- **Do** draw icons as 1.4px square-capped ink strokes on a 24px grid, inline as SVG.

### Don't:
- **Don't** use drop shadows, blur or layered tonal surfaces; separate with hairlines.
- **Don't** round corners, including focus rings.
- **Don't** use `signal` red decoratively or as a cast code colour.
- **Don't** use Courier Prime for interface text, or Archivo for the script.
- **Don't** introduce the legacy purple, Noto Sans or Norican look into screens built in this world; it is the system being replaced.
- **Don't** use `rule` grey for text; it fails contrast and exists only for dividers.
- **Don't** add a dark theme by inverting tokens; the world is light-only until a dark variant is designed.
