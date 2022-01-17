import {  HashRouter, Route } from "react-router-dom";

import './App.css';
import Home from './routes/Home';

const electron = require("electron");
const remote = electron.remote;

const {BrowserWindow, dialog, Menu} = remote;

function App() {
  return (
    <div className="app">
      {/* <HashRouter>
        <div>
          <Route path="/" exact> */}
            <Home />
          {/* </Route> */}
          {/* <Route path="/firstPage"  component={ FirstPage } />
          <Route path="/secondPage" component={ SecondPage } /> */}
        {/* </div>
      </HashRouter> */}
    </div>
  );
}

export default App;
