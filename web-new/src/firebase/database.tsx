import { getDoc, where, getDocs, setDoc, doc } from "firebase/firestore";
import { db, rtdb } from "./main";
import { Project } from "../datatypes/Project";
import { User } from "../datatypes/User";
import { equalTo, orderByChild, query, ref, set } from "firebase/database";

// add user
const addUser = async (userId: string, data: {}) => {
  try {
    await setDoc(doc(db, "users", userId), data);
    console.log("User added with ID: ", userId);
  } catch (e) {
    console.error("Error adding user: ", e);
  }
};

// get projects for a specific user
const getProjectsRefForOwner = (userId: string) => {
  try {
    // query to find projects by owner
    const projectsRef = query(ref(rtdb, 'projects'), orderByChild('owner'), equalTo(userId));

    return projectsRef;

  } catch (e) {
    console.error("Error getting projects: ", e);
  }
}

// get project from id
const getProjectRef = (projectId: string) => {
  try {
    // query to find projects by owner
    return ref(rtdb, '/projects/' + projectId);

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
async function writeProjectData(project: Project) {
  await set(ref(rtdb, 'projects/' + project.id), {
    name: project.name,
    description: project.description,
    isPublic : project.isPublic,
    owner: project.owner
  });
}

export {
  addUser, getProjectsRefForOwner, getUser, 
  writeProjectData, getProjectRef,
  getDoc, query, where, getDocs
}