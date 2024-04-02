import { collection, getDoc, query, where, getDocs, addDoc, setDoc, doc } from "firebase/firestore";
import { db } from "./main";

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

export {
    addEntry, addUser,
    getDoc, query, where, getDocs
}