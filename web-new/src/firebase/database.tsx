import { getDoc, where, getDocs, setDoc, doc } from "firebase/firestore";
import { db, rtdb } from "./main";
import { Folder, Project } from "../datatypes/Block";
import { User } from "../datatypes/User";
import { equalTo, orderByChild, query, ref, set } from "firebase/database";
import Document from "../datatypes/Document";

// add user
const addUser = async (userId: string, data: {}) => {
  try {
    await setDoc(doc(db, "users", userId), data);
    console.log("User added with ID: ", userId);
  } catch (e) {
    console.error("Error adding user: ", e);
  }
};

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
    let tempDoc = await getDoc(doc(db, "users", userId));

    // @ts-ignore
    const user: User = {id: tempDoc.id, ...tempDoc.data()};

    return user;
  } catch (e) {
    console.error("Error getting user: ", e);
  }
}

// create a Project in RTDB
async function writeFolderData(folder: Folder) {
  await set(ref(rtdb, 'folders/' + folder.id), {...folder});
}

// create a Project in RTDB
async function writeProjectData(project: Project) {
  await set(ref(rtdb, 'projects/' + project.id), {...project});

  let folderId = project.folderId;
  if (folderId) {
    await set(ref(rtdb, 'folders/' + folderId + '/projects/' + project.id), {
      id: project.id,
      name: project.name,
      type: project.type
    });
    await set(ref(rtdb, 'folders/' + folderId + '/lastUpdated'), project.createdOn);
  }
}

// create a Document in RTDB
async function writeDocumentData(doc: Document, projectId?: string) {
  await set(ref(rtdb, 'documents/' + doc.id), {...doc});

  if (projectId) {
    await set(ref(rtdb, 'projects/' + projectId + '/documents/' + doc.id), {
      id: doc.id,
      name: doc.name
    });
  }
}

export {
  addUser, getUser, 
  getProjectsQueryForOwner, getFoldersQueryForOwner,
  getProjectsQueryForFolder,
  writeFolderData, getFolderRef,
  writeProjectData, getProjectRef,
  writeDocumentData,
  getDoc, query, where, getDocs
}