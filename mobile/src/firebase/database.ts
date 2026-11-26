import { equalTo, orderByChild, query, ref, set, update } from "@react-native-firebase/database";
import { ScriptBlock } from "@storia/core/screenplay/types";
import { rtdb } from "./main";

// The app's reads and writes, in the shapes web's firebase/database.tsx
// uses for the same paths (keep the two in step), and under the same rules
// (web/database.rules.json)

// the writer's projects; each holds summaries ({id, name}) of its documents
export const projectsOf = (uid: string) => query(ref(rtdb, "projects"), orderByChild("owner"), equalTo(uid));

export const documentRef = (id: string) => ref(rtdb, "documents/" + id);

export const projectFolderRef = (projectId: string) => ref(rtdb, "projects/" + projectId + "/folderId");

// save a document's script, as web's saveDocumentContent does
export async function saveDocumentContent(id: string, content: ScriptBlock[]) {
  await update(documentRef(id), {content, lastUpdated: new Date().toString()});
}

// mark the project and folder holding a document as just written in, so they
// sort by writing activity; each is written on its own so one failing can't block the other
export async function touchParents({projectId, folderId}: {projectId?: string, folderId?: string}) {
  const now = new Date().toString();
  await Promise.allSettled([
    projectId && set(ref(rtdb, "projects/" + projectId + "/lastUpdated"), now),
    folderId && set(ref(rtdb, "folders/" + folderId + "/lastUpdated"), now),
  ]);
}

// when a document was made, which sets its revision colour among its project's drafts
export const createdOnRef = (id: string) => ref(rtdb, "documents/" + id + "/createdOn");

// a project's summaries of its documents
export const projectDocumentsRef = (projectId: string) => ref(rtdb, "projects/" + projectId + "/documents");
