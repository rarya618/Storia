# Changelog

Every release of Storia's web app (`web-new/`, published as `storia-web`), newest first. Versions follow [semantic versioning](https://semver.org): while the app is in beta (0.x), a minor bump marks new features and a patch bump marks fixes. Each release is tagged `storia-web@<version>` in git.

## Unreleased

- **Centred breadcrumbs:** with the left rail hidden, the trail back up (Home › folder › project) sits at the centre of the bar on folder, project, board and card pages and in the editor; with the rail open it stays at the left, beside it. It slides between the two as the rail opens and shuts. On the board, Acts, Properties and Groups move into one Set up menu beside New card.

- **The wordmark stays:** with the folder rail or the editor's scene rail hidden, the Storia wordmark now stays in the bar and still leads home. It's a little smaller everywhere, and with the rail hidden the button that brings it back comes first, at the far left.

## 0.5.0 (2026-11-25)

The board grows up: cards become pages, tied to acts, the script and fields of your own.

- **Cards as pages:** a card opens as a page of its own, Notion-style: a large title, its details as rows, and a body you can shape with headings, bullet and numbered lists, checklists, quotes, bold, italic and strike, using Notion's shortcuts (# for a heading, - for a list, [] for a checklist). In the editor, a card opens as a panel over the script, so you keep your place. New card opens the new card's page straight away, with the caret in its title.
- **Cards link to the script:** a card can link to scenes in any of the project's drafts, and to characters from their casts. A scene link opens the editor at that scene, and the editor's scene list marks scenes that have a card and names it.
- **Properties:** a board can have its own fields, such as a select, a multi-select, text, a number, a date or a checkbox, with a ready-made Status (Idea, Outlined, Drafted, Done). Set them on a card's page; cards on the board show their values as tags.

- **Acts on the board:** cards can be tied to acts. The board keeps its own acts, in order (Acts, in the board's bar), and lays itself out act by act, here and in the editor's rail. A card's act is set in its dialog, or by dragging it into another act. The acts can be filled in from a draft's act breaks, but they're the board's own, so the plan stays put when a draft changes.

- **The board among the documents:** a project's board now sits on its shelf beside the drafts, sketching its first cards, instead of behind a Board button. In the editor, the project rail has a Board view beside Documents, where you can read, filter, add and edit cards without leaving the script. It isn't a draft, so it takes no revision colour and doesn't count as one.

## 0.4.0 (2026-11-25)

Story boards, and the last of the old app.

- **Boards:** every project has a board for planning the story on cards before or beside the script. Each card has a title and text, cards sit in story order and can be dragged into place (or moved from the card's dialog), and groups (a subplot, an act, a character) file them and filter the board. Open it from Board on the project page or in the editor's project rail. It replaces the old app's idea cards and story map.
- **Terms and privacy:** the Terms of Service and Privacy Policy that the sign-up page links to now open, instead of a missing page.

## 0.3.0 (2026-11-25)

A new editor underneath the script, and smoother screens around it.

- **A new editor:** the script is now one document (built on ProseMirror) instead of a text box per line. Text selects across lines as in any document, including from the middle of one line to the middle of another; undo covers everything; copying gives other apps Fountain and pastes back into Storia with every element, and plain text from elsewhere comes in as action. Enter, Tab, Backspace, the element shortcuts, character suggestions and the rest work as before.
- **Rails:** the folder rail and the editor's scene and project rails slide open and shut like a drawer, docked or over the page, instead of appearing and disappearing.
- **The page wraps:** a narrower window keeps the script at full size and wraps its lines instead of shrinking the text. The page's side margins give way first, so the line keeps its full width for as long as it can.
- **Status bar:** collapsed, it keeps showing the page you're on ("p. 12 of 48"), and it slides open and shut instead of jumping.
- **Skeleton screens:** a screen that's still loading shows its own shape (the editor's rails and page, a project's shelf, a folder's cards, home) in quiet placeholders, instead of a blank white screen and a spinner. A reload shows the skeleton from its very first frame, before the app has loaded. Opening a document always starts on the editor's skeleton for a moment, then the page settles in.
- **Moving documents:** a document can move to another project, from the Project field in Edit document (in the editor's menu or on its sheet). Its revision colour follows its place among the new project's drafts.
- **Page previews:** the miniature pages on home and the project page set headings, cues and transitions in capitals however they were typed, match the script's dialogue and parenthetical widths, and start at the top whichever element comes first.
- **Dependencies:** Firebase 13, React Router 7 and Vite 8, clearing the security advisories that affect the app or its dev server.

## 0.2.0 (2026-11-25)

New elements, and editing, moving and deleting everything you make.

- **New elements:** Shot (⌘7), Act break (⌘8), Lyrics (⌘9) and Note (⌘0). Each act starts a new printed page. Notes stay on screen only: they don't print and don't count toward pages, running time or words. Final Draft and WriterDuet imports keep their shots, act breaks and lyrics (and WriterDuet's notes) instead of turning them into action, and Fountain export writes each in Fountain's own form.
- **Acts in the scene list:** act breaks appear among the scenes, each with its act's screen time, and clicking one jumps to it.
- **Editing:** folders, projects and documents can be renamed and their descriptions edited. Use Edit on the folder and project pages, the pencil on cards and sheets, or Edit details in the editor's menu.
- **Moving:** a project can move to another folder, or out of folders, from the Folder field in Edit project.
- **Deleting:** folders, projects and documents can be deleted from their Edit dialog, after a confirmation. Deleting a project deletes its documents. Deleting a folder keeps its projects, which move to no folder, unless you tick the box to delete them too.
- **Status bar:** shows the page you're on out of the whole script ("p. 12 of 48") in place of the word count, which moves to its tooltip, and the scene out of the whole ("Scene 4 of 31"). With a mouse, the element menu shows each element's shortcut ("Action ⌘2"). Hiding the status bar is remembered.
- **Draft pill:** says which draft a document is ("2nd draft") instead of its paper colour ("Blue pages"), which now shows on hover. It's hidden when a project has only one document.
- **Title case:** scene, character and act names outside the script read properly. Small words stay lower case ("Back of the Van"), titles like Mr, Dr and St are no longer left in capitals, and names, contractions and ordinals read right (McDonald's, O'Brien, Don't, 5th). The Int/Ext column reads Int/Ext for every form of the prefix.
- **Editor bar:** the top bar no longer has a coloured band or line beneath it.
- **Keyboard reference:** Mac shortcuts read "⌘1", without a plus.
- **Safer with old tabs:** a script element this version doesn't recognise opens as action instead of disappearing.

## 0.1.0 (2026-11-25)

The first numbered release. It covers everything the rewrite does so far.

- **Writing:** a screenplay editor for the six screenplay elements, with Enter, Tab and Backspace moving between them, character name suggestions, page and screen-time estimates, a scene list, a characters view, and autosave.
- **Drafts:** each document in a project wears the industry revision colour for its place in the project (white, blue, pink, yellow…).
- **Organising:** folders and projects, a folder rail shared by home, folder and project pages, and breadcrumbs back up from every page.
- **Import and export:** new documents can start from a Final Draft (.fdx) or WriterDuet (.wdz) file. Scripts export as Fountain and print or save as PDF.
- **Faster typing:** in a long script, each keystroke refits and redraws only the block being typed in; the scene list, word count and print copy update just after.
- **Versions:** the account menu shows the version and build, and an open tab offers to reload when a newer version has been deployed.
