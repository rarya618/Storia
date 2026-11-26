import { getDoc, where, getDocs, setDoc, doc } from "firebase/firestore";
import { db, rtdb } from "./main";
import { Folder, Project } from "@storia/core/datatypes/Block";
import { User } from "@storia/core/datatypes/User";
import { equalTo, get, orderByChild, query, ref, runTransaction, set, update } from "firebase/database";
import { inviteKey } from "@storia/core/misc/invites";
import { Board, readBoard } from "@storia/core/board/board";
import { ScriptBlock } from "@storia/core/screenplay/types";
import Document from "@storia/core/datatypes/Document";
import { logError } from "../misc/monitoring";

// add user
const addUser = async (userId: string, data: Omit<User, "id">) => {
  try {
    await setDoc(doc(db, "users", userId), data);
    console.log("User added with ID: ", userId);
  } catch (e) {
    logError("add user", e);
  }
};

// whether this email is on the closed beta's invite list; the database rules
// refuse everything else to an email that isn't. Only the signed-in user's own
// entry can be read, so call it after signing in.
const isInvited = async (email: string) =>
  (await get(ref(rtdb, `invites/${inviteKey(email)}`))).val() === true;

// get ref for a specific property
const getQueryForSpecificProperty = (collectionName: string, propertyName: string, propertyValue: string) => {
  return query(ref(rtdb, collectionName), orderByChild(propertyName), equalTo(propertyValue));
}

// get folders for a specific user
const getFoldersQueryForOwner = (userId: string) => {
  try {
    // query to find folders by owner
    return getQueryForSpecificProperty('folders', 'owner', userId);

  } catch (e) {
    console.error("Error getting folders: ", e);
  }
}

// get projects for a specific user
const getProjectsQueryForOwner = (userId: string) => {
  try {
    // query to find projects by owner
    return getQueryForSpecificProperty('projects', 'owner', userId);

  } catch (e) {
    console.error("Error getting projects: ", e);
  }
}

// get projects for a specific user
const getProjectsQueryForFolder = (folderId: string) => {
  try {
    // query to find projects by owner
    return getQueryForSpecificProperty('projects', 'folderId', folderId);

  } catch (e) {
    console.error("Error getting projects: ", e);
  }
}

// get Folder from id
const getFolderRef = (id: string) => {
  try {
    // query to find projects by owner
    return ref(rtdb, '/folders/' + id);

  } catch (e) {
    console.error("Error getting Folder ref: ", e);
  }
}

// get Project from id
const getProjectRef = (id: string) => {
  try {
    // query to find projects by owner
    return ref(rtdb, '/projects/' + id);

  } catch (e) {
    console.error("Error getting Project ref: ", e);
  }
}

// get user data
const getUser = async (userId: string) => {
  try {
    const tempDoc = await getDoc(doc(db, "users", userId));
    if (!tempDoc.exists()) return undefined;

    return {id: tempDoc.id, ...tempDoc.data()} as User;
  } catch (e) {
    logError("get user", e);
  }
}

// create a Project in RTDB
async function writeFolderData(folder: Folder) {
  await set(ref(rtdb, 'folders/' + folder.id), {...folder});
}

// create a Project in RTDB
async function writeProjectData(project: Project) {
  await set(ref(rtdb, 'projects/' + project.id), {...project});

  const folderId = project.folderId;
  if (folderId) {
    await set(ref(rtdb, 'folders/' + folderId + '/projects/' + project.id), {
      id: project.id,
      name: project.name,
      type: project.type
    });
    await set(ref(rtdb, 'folders/' + folderId + '/lastUpdated'), project.createdOn);
  }
}

// create a Document in RTDB, and list it in its project
async function writeDocumentData(doc: Document, projectId?: string) {
  await set(ref(rtdb, 'documents/' + doc.id), {...doc});

  if (projectId) {
    await set(ref(rtdb, 'projects/' + projectId + '/documents/' + doc.id), {
      id: doc.id,
      name: doc.name
    });
    if (doc.createdOn)
      await set(ref(rtdb, 'projects/' + projectId + '/lastUpdated'), doc.createdOn);
  }
}

// get Document from id
const getDocumentRef = (id: string) => ref(rtdb, 'documents/' + id);

// save a Document's script
// a failed save is reported as well as thrown, since the writer's words are what's at stake
async function saveDocumentContent(id: string, content: ScriptBlock[]) {
  try {
    await update(ref(rtdb, 'documents/' + id), {
      content,
      lastUpdated: new Date().toString()
    });
  } catch (error) {
    logError("save script", error);
    throw error;
  }
}

// mark the project and folder holding a document as just updated, so home and the folder
// page sort by writing activity; each is written on its own so one failing can't block the other
async function touchParents({projectId, folderId}: {projectId?: string, folderId?: string}) {
  const now = new Date().toString();
  await Promise.allSettled([
    projectId && set(ref(rtdb, 'projects/' + projectId + '/lastUpdated'), now),
    folderId && set(ref(rtdb, 'folders/' + folderId + '/lastUpdated'), now),
  ]);
}

export type Details = { name: string, description: string };

// rename or redescribe a folder. Projects store only its id, so the name lives
// in one place
async function updateFolderDetails(folderId: string, details: Details) {
  await update(ref(rtdb, 'folders/' + folderId), {name: details.name, description: details.description});
}

// delete a folder in one atomic update. Its projects are kept, each moving out
// to no folder, unless withProjects, when they go too, with every document
// listed in them. projects are the ones that name the folder (the folder
// page's query, or home's projects in it), not its summaries: a summary can
// outlive its project, and the rules refuse a write to a project that isn't
// there, which would fail it all. There is no undo
async function deleteFolder(
  folderId: string,
  projects: {id: string, documents?: Record<string, unknown>}[],
  withProjects = false,
) {
  const changes: Record<string, null> = {['folders/' + folderId]: null};
  for (const project of projects) {
    if (!withProjects) {
      changes['projects/' + project.id + '/folderId'] = null;
      continue;
    }
    changes['projects/' + project.id] = null;
    changes['boards/' + project.id] = null;
    for (const docId of Object.keys(project.documents ?? {})) changes['documents/' + docId] = null;
  }
  await update(ref(rtdb), changes);
}

// rename, redescribe or move a project. Its name is also copied into its
// folder's summary, so everything is written in one atomic update: either it
// all changes or none of it does. A move takes the summary out of the old folder
// and puts it in the new one; folderId undefined means in no folder. Editing
// details isn't writing, so lastUpdated stays as it was
async function updateProjectDetails(
  project: {id: string, type: string, folderId?: string},
  details: Details & {folderId?: string},
) {
  const to = details.folderId;
  const changes: Record<string, unknown> = {
    ['projects/' + project.id + '/name']: details.name,
    ['projects/' + project.id + '/description']: details.description,
  };
  if (to === project.folderId) {
    if (to) changes['folders/' + to + '/projects/' + project.id + '/name'] = details.name;
  } else {
    changes['projects/' + project.id + '/folderId'] = to ?? null;
    if (project.folderId) changes['folders/' + project.folderId + '/projects/' + project.id] = null;
    if (to) changes['folders/' + to + '/projects/' + project.id] = {id: project.id, name: details.name, type: project.type};
  }
  await update(ref(rtdb), changes);
}

// delete a project with every document listed in it, its board, and its
// folder's summary of it, in one atomic update. There is no undo
async function deleteProject(project: {id: string, folderId?: string, documents?: Record<string, unknown>}) {
  await update(ref(rtdb), {
    ['projects/' + project.id]: null,
    ['boards/' + project.id]: null,
    ...(project.folderId ? {['folders/' + project.folderId + '/projects/' + project.id]: null} : {}),
    ...Object.fromEntries(Object.keys(project.documents ?? {}).map(docId => ['documents/' + docId, null])),
  });
}

// delete a document and its project's summary of it, together. There is no undo
async function deleteDocument(doc: {id: string, projectId?: string}) {
  await update(ref(rtdb), {
    ['documents/' + doc.id]: null,
    ...(doc.projectId ? {['projects/' + doc.projectId + '/documents/' + doc.id]: null} : {}),
  });
}

// rename, redescribe or move a document. Its name is also copied into its
// project's summary, so it all goes in one atomic update. A move takes the
// summary out of the old project and puts it in the new one; the document's
// revision colour then follows its place among that project's drafts
async function updateDocumentDetails(
  doc: {id: string, projectId?: string},
  details: Details & {projectId?: string},
) {
  const to = details.projectId ?? doc.projectId;
  const changes: Record<string, unknown> = {
    ['documents/' + doc.id + '/name']: details.name,
    ['documents/' + doc.id + '/description']: details.description,
  };
  if (to === doc.projectId) {
    if (to) changes['projects/' + to + '/documents/' + doc.id + '/name'] = details.name;
  } else if (to) {
    changes['documents/' + doc.id + '/projectId'] = to;
    if (doc.projectId) changes['projects/' + doc.projectId + '/documents/' + doc.id] = null;
    changes['projects/' + to + '/documents/' + doc.id] = {id: doc.id, name: details.name};
  }
  await update(ref(rtdb), changes);
}

// a project's board, which lives beside the project rather than in it, so the
// project page's subscription doesn't carry every card
const getBoardRef = (projectId: string) => ref(rtdb, 'boards/' + projectId);

// apply a change to the board as the database holds it when the write lands,
// so two tabs changing different cards don't undo each other
async function changeBoard(projectId: string, change: (board: Board) => Board) {
  const owner = sessionStorage.getItem("User ID") ?? "";
  try {
    await runTransaction(getBoardRef(projectId), (current) => {
      const next = change(readBoard(current));
      // every part of the board is written, so a part left out here would be wiped
      return {owner, cards: next.cards, groups: next.groups, acts: next.acts, properties: next.properties, lastUpdated: new Date().toString()};
    });
  } catch (error) {
    // many of the board's callers carry on quietly, so this is where a failed write is heard
    logError("change board", error);
    throw error;
  }
}

export {
  addUser, getUser, isInvited, touchParents,
  updateFolderDetails, deleteFolder,
  updateProjectDetails, updateDocumentDetails, deleteProject, deleteDocument,
  getProjectsQueryForOwner, getFoldersQueryForOwner,
  getProjectsQueryForFolder,
  writeFolderData, getFolderRef,
  writeProjectData, getProjectRef,
  writeDocumentData, getDocumentRef, saveDocumentContent,
  getBoardRef, changeBoard,
  getDoc, query, where, getDocs
}