import React from 'react';

import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// @ts-ignore
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";

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
