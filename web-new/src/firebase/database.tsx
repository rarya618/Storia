import { collection, getDoc, query, where, getDocs, addDoc, setDoc, doc } from "firebase/firestore";
import { db } from "./main";
import { Project } from "../datatypes/Project";
import { User } from "../datatypes/User";

const addEntry = async (data: {}) => {
  try {
    const docRef = await addDoc(collection(db, "data"), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const addUser = async (userId: string, data: {}) => {
  try {
    await setDoc(doc(db, "users", userId), data);
    console.log("User added with ID: ", userId);
  } catch (e) {
    console.error("Error adding user: ", e);
  }
};

// get projects for a specific user
const getProjectsForUser = async (userId: string) => {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where("users", "array-contains", userId));

    return await getDocs(q).then((querySnapshot) => {
      let projects = querySnapshot.docs.map((doc) => {
        // @ts-ignore
        const project: Project = {id: doc.id, ...doc.data()};				
        return project;
      })
			
      return projects;
    })
  } catch (e) {
    console.error("Error getting projects: ", e);
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

export {
  addEntry, addUser, getProjectsForUser, getUser,
  getDoc, query, where, getDocs
}