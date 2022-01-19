import Home from './views/Home';
import WriterView from './views/WriterView';

import { HashRouter, Route, Routes, Outlet, Link } from "react-router-dom";
import {useState, useEffect} from 'react';

import './App.css';

// import firebase from 'firebase/compat/app';

// set class code
export function getClassCode(text, _isDarkTheme) {
	if (!_isDarkTheme) {
		switch (text.toLowerCase()) {
			case 'screenplay':
				return "green";
			
			case 'teleplay':
				return "brown";
			
			case 'series':
				return "purple";

			default :
				return "white";
		}
	} else {
		switch (text.toLowerCase()) {
			case 'screenplay':
				return "dark green";
			
			case 'teleplay':
				return "dark brown";
			
			case 'series':
				return "dark purple";
			
			default :
				return "dark white";
		}
	}
}

// set dark theme
export function switchTheme(isDarkTheme) {
	if (isDarkTheme) {
		return " dark";
	}
	else {
		return "";
	}
}

// set page title
export function useTitle(title) {
	useEffect(() => {
		const prevTitle = document.title;

		document.title = title;
		
		return () => {
			document.title = prevTitle
		}
	})
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

function App() {
	const [isDarkTheme, setIsDarkTheme] = useState(false);

	return (
		<HashRouter>
			<div className={"app " + getClassCode("", isDarkTheme)}>
				<Routes>
					<Route exact path="/" element={<Outlet />}>
						<Route index element={<Home isDarkTheme={isDarkTheme} />}/>
						<Route 
							path="document/:documentType/:documentId/:documentName" 
							element={<WriterView isDarkTheme={isDarkTheme} switchTheme={(e) => setIsDarkTheme(!isDarkTheme)} />}
						/>
						<Route path="*" element={<NoMatch />} />
					</Route>
				</Routes>
				<Outlet />
			</div>
		</HashRouter>
	);
}

export default App;