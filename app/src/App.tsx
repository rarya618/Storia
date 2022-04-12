// @ts-ignore
import Home from './Recents/Home';
import WriterView from './WriterView/Page';

import { Route, Routes, Outlet, Link } from "react-router-dom";
import React, {useState, useEffect} from 'react';

import './App.css';

// import firebase from 'firebase/compat/app';

// capitalise first letter of a string
export function capitalize(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// set class code
export function getClassCode(text: string, _isDarkTheme: boolean) {
	if (!_isDarkTheme) {
		switch (text.toLowerCase()) {			
			case 'write':
				return "green";

			case 'ideate':
				return "purple";
			
			case 'text':
				return "black";

			default :
				return "white";
		}
	} else {
		switch (text.toLowerCase()) {
			case 'write':
				return "dark green";

			case 'ideate':
				return "dark purple";
			
			case 'text':
				return "dark black";
		
			default :
				return "dark white";
		}
	}
}

// set dark theme
export function switchTheme(isDarkTheme: boolean) {
	if (isDarkTheme) {
		return " dark";
	}
	else {
		return "";
	}
}

// set page title
export function useTitle(title: string) {
	useEffect(() => {
		const prevTitle = document.title;

		document.title = title;
		
		return () => {
			document.title = prevTitle
		}
	})
}

export const MacTitlebarSpacing = (display: boolean) => {
	const macOverlay = () => {
		if (display) {
			return "mac-overlay";
		} else {
			return "mac-overlay hide";
		}
	}
	return <div className={macOverlay()}></div>
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

const App = () => {
	const [isDarkTheme, setIsDarkTheme] = useState(false);
	const [mode, setMode] = useState("write");

	return (
		<div className={"app " + getClassCode("", isDarkTheme)}>
			<Routes>
				<Route path="/" element={<Outlet />}>
					<Route 
						index 
						// element={mode === 'write' ? <Home mode={mode} setMode={(e: string) => setMode(e)} isDarkTheme={isDarkTheme} switchTheme={(e: boolean) => setIsDarkTheme(!isDarkTheme)} /> : null}
						element={<Home mode={mode} setMode={(e: string) => setMode(e)} isDarkTheme={isDarkTheme} switchTheme={(e: boolean) => setIsDarkTheme(!isDarkTheme)} />}
					/>
					<Route 
						path="write/:documentId/:documentName" 
						element={<WriterView isDarkTheme={isDarkTheme} switchTheme={(e: boolean) => setIsDarkTheme(!isDarkTheme)} />}
					/>
					<Route path="*" element={<NoMatch />} />
				</Route>
			</Routes>
			<Outlet />
		</div>
	);
}

export default App;