// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import { getDoc, query, where, getDocs } from "firebase/firestore";
import 'firebase/compat/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut 
} from 'firebase/auth';

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBN9KJNzTYhGa49v8PLjL8ZD9o0WKITBK8",
  authDomain: "script-writer-studio.firebaseapp.com",
  projectId: "script-writer-studio",
  storageBucket: "script-writer-studio.appspot.com",
  messagingSenderId: "512779335299",
  appId: "1:512779335299:web:5332ee74f7b76278970db6",
  measurementId: "G-Y5Q2W1TV0P"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialise Authentication
const auth = getAuth(app);

// Initialize db
const db = app.firestore();

// Initialize Analytics
const analytics = getAnalytics(app);

export {
  app, analytics, db, auth,
  getDoc, query, where, getDocs, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, signOut
}