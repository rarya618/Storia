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

// set if in testing environment
const isTesting = true;

// set if Electron app
const isElectronApp = false;

// Electron test config
const electronTestConfig = {
  apiKey: "AIzaSyBN9KJNzTYhGa49v8PLjL8ZD9o0WKITBK8",
  authDomain: "script-writer-studio.firebaseapp.com",
  projectId: "script-writer-studio",
  storageBucket: "script-writer-studio.appspot.com",
  messagingSenderId: "512779335299",
  appId: "1:512779335299:web:5332ee74f7b76278970db6",
  measurementId: "G-Y5Q2W1TV0P"
};

// Web test config
const webTestConfig = {
  apiKey: "AIzaSyBN9KJNzTYhGa49v8PLjL8ZD9o0WKITBK8",
  authDomain: "script-writer-studio.firebaseapp.com",
  databaseURL: "https://script-writer-studio-default-rtdb.firebaseio.com",
  projectId: "script-writer-studio",
  storageBucket: "script-writer-studio.appspot.com",
  messagingSenderId: "512779335299",
  appId: "1:512779335299:web:70cb0c20b92991c5970db6",
  measurementId: "G-7KPBCT2J67"
};

// Web production config
const webProdConfig = {
  apiKey: "AIzaSyB_YIlxG4WOu0-wqlgPLRi4BBXJPWi_0og",
  authDomain: "aria-storia.firebaseapp.com",
  projectId: "aria-storia",
  storageBucket: "aria-storia.appspot.com",
  messagingSenderId: "95766656985",
  appId: "1:95766656985:web:f83a9d9a0ce5ba11c4cbc8",
  measurementId: "G-8V8FKVZY1S"
};

const testConfig = isElectronApp ? electronTestConfig : webTestConfig;
const prodConfig = isElectronApp ? electronTestConfig : webProdConfig;

const firebaseConfig = isTesting ? testConfig : prodConfig;

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