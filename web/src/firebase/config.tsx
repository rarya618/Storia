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

// toggle according to deployment
const isElectronApp = true;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configurations
const electronAppConfig = {
  apiKey: "AIzaSyBN9KJNzTYhGa49v8PLjL8ZD9o0WKITBK8",
  authDomain: "script-writer-studio.firebaseapp.com",
  projectId: "script-writer-studio",
  storageBucket: "script-writer-studio.appspot.com",
  messagingSenderId: "512779335299",
  appId: "1:512779335299:web:5332ee74f7b76278970db6",
  measurementId: "G-Y5Q2W1TV0P"
};

const webAppConfig = {
  apiKey: "AIzaSyBN9KJNzTYhGa49v8PLjL8ZD9o0WKITBK8",
  authDomain: "script-writer-studio.firebaseapp.com",
  databaseURL: "https://script-writer-studio-default-rtdb.firebaseio.com",
  projectId: "script-writer-studio",
  storageBucket: "script-writer-studio.appspot.com",
  messagingSenderId: "512779335299",
  appId: "1:512779335299:web:70cb0c20b92991c5970db6",
  measurementId: "G-7KPBCT2J67"
};

const firebaseConfig = isElectronApp ? electronAppConfig : webAppConfig;

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