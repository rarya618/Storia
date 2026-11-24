# Changelog

Every release of Storia's web app (`web-new/`, published as `storia-web`), newest first. Versions follow [semantic versioning](https://semver.org): while the app is in beta (0.x), a minor bump marks new features and a patch bump marks fixes. Each release is tagged `storia-web@<version>` in git.

## Unreleased

- The editor's top bar no longer has a coloured band or line beneath it.
- The revision pill says which draft a document is ("2nd draft") instead of its paper colour ("Blue pages"), which now shows on hover. It's hidden when a project has only one document.
- The editor's status bar shows the page you're on out of the whole script ("p. 12 of 48") in place of the word count, which moves to its tooltip, and the scene out of the whole ("Scene 4 of 31").
- With a mouse, the element menu shows each element's shortcut ("Action ⌘2").
- Hiding the status bar is remembered.
- The keyboard reference writes Mac shortcuts as "⌘1", without a plus.
- Four new elements: Shot (⌘7), Act break (⌘8), Lyrics (⌘9) and Note (⌘0). Each act starts a new printed page, and notes stay on screen only: they don't print and don't count toward pages, running time or words. Final Draft and WriterDuet imports keep their shots, act breaks and lyrics (and WriterDuet's notes) instead of turning them into action, and Fountain export writes each in Fountain's own form.
- A script element this version doesn't recognise opens as action instead of disappearing.
- Projects and documents can be renamed and their descriptions edited: Edit on the project page, and Edit details in the editor's menu.
- Projects can move between folders, from the Folder field in Edit project.
- Documents can be edited from the project page too, with a pencil on each sheet.
- Projects and documents can be deleted from their Edit dialog, after a confirmation. Deleting a project deletes its documents.
- Folders can be renamed, redescribed and deleted from Edit on the folder page. Deleting a folder keeps its projects, which move to no folder.
- Projects can be edited, moved or deleted from their cards on the folder page.
- Act breaks appear in the scene list, each with its act's screen time, and clicking one jumps to it.
- Scene, character and act names outside the script are title-cased properly: small words stay lower case ("Back of the Van"), titles like Mr, Dr and St are no longer left in capitals, and names, contractions and ordinals read right (McDonald's, O'Brien, Don't, 5th). The Int/Ext column reads Int/Ext for every form of the prefix.

## 0.1.0 (2026-11-25)

The first numbered release. It covers everything the rewrite does so far.

- **Writing:** a screenplay editor for the six screenplay elements, with Enter, Tab and Backspace moving between them, character name suggestions, page and screen-time estimates, a scene list, a characters view, and autosave.
- **Drafts:** each document in a project wears the industry revision colour for its place in the project (white, blue, pink, yellow…).
- **Organising:** folders and projects, a folder rail shared by home, folder and project pages, and breadcrumbs back up from every page.
- **Import and export:** new documents can start from a Final Draft (.fdx) or WriterDuet (.wdz) file. Scripts export as Fountain and print or save as PDF.
- **Faster typing:** in a long script, each keystroke refits and redraws only the block being typed in; the scene list, word count and print copy update just after.
- **Versions:** the account menu shows the version and build, and an open tab offers to reload when a newer version has been deployed.
