import React from 'react';

import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";


// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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
const analytics = getAnalytics(app);

// Use these for db & auth
const db = app.firestore();
const auth = firebase.auth();

// const electron = window.require('electron');
// const remote = electron.remote;
// const {BrowserWindow, dialog, Menu} = remote;

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
