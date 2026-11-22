---
version: 1
slug: "src-views-documentview-tsx"
primary_target: "src/views/DocumentView.tsx"
related_targets: ["src/components/screenplay"]
---

# Screenplay editor (document/:id)

Scope: the screenplay editor route, which leads Storia's new visual world (the rest of the app adopts it later). Mode: Operate.

Audience and job: aspiring screenwriters drafting in short laptop sessions, sometimes on phones. Their job is to write correctly formatted scenes without fighting the format, while keeping the script's shape in view.

Constraints: the editor is entirely white (the user's pinned steer: "entirely a white screen, powerful yet minimalistic"). It keeps the existing editor behaviour: element flow, shortcuts, autocomplete, autosave, Fountain export, print/PDF. Standard screenplay page metrics are fixed.

Unresolved: whether the rest of the app follows this world, and whether dark mode exists for the editor (the white steer currently overrides it).

## Direction contract

THESIS: The script as a catalogue entry. The current scene number is the only headline, and the whole script's shape is one stacked hairline plot that you navigate by. It refuses the grey canvas with a toolbar and a scene list.

OWN-WORLD: Unprinted white, black ink, 1px black hairline boxes, and no shadows, radii or fills. Archivo is used expanded for the huge thin scene numerals and for wide-tracked engraved caps; Courier Prime is used only for the script. A five-block colour code (grey, blue, yellow, red, white keyline) gives each character a colour, decoded to names beside it. Signal red is reserved for "you are here".

STORY: The writer opens a draft and sees where they are (scene 02, ALLEY BEHIND THE CLUB, NIGHT), who is in it, and the shape of the whole script. They write, and the plot redraws as scenes take shape.

FIRST VIEWPORT: A thin top row of tracked caps tokens (STORIA · project / draft · saved · element · export · print · keys). On the left are the scene number at about 180px thin, the scene label in tracked caps, the cast colour code with names, and a hairline-ruled data list (page, length, scenes). On the right is the stacked plot, one line per scene, with the current scene in red. The page sits centred on the white, with no frame.

FORM: The Factory sleeve translated to white (competitive challenger brand-identity-canon-saville-catalog-sleeve, chosen in a bolder re-roll). seed:adbf78bb49de636b. Signature move: each scene is drawn as a hairline pulse whose bumps are its dialogue, stacked with occlusion. Clicking a line jumps to its scene, and moving between scenes slides the red line and counts the numeral.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
