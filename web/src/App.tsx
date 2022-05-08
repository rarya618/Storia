import { Route, Routes, Outlet, Link } from "react-router-dom";
import React, {useState, useEffect} from 'react';

import './App.css';

import Menu from './objects/Menu';
import ButtonObject from './objects/ButtonObject';

import Home from './Recents/Home';
import WriterView from './WriterView/Page';
import Cards from './Ideate/Cards/Page';
import StoryMap from './Ideate/StoryMap/Page';
import SignUp from './login/SignUp';
import SignIn from './login/SignIn';
import TermsOfService from './additional/TermsOfService';
import PrivacyPolicy from './additional/PrivacyPolicy';
import ProjectView from './projectView/Home';

export const CreateBottomBar = (isDarkTheme: boolean, border: boolean, color: string, leftMenu: ButtonObject[], rightMenu: ButtonObject[]) => {
    return (
        <div className={"bottom-bar row no-select drag " + color + "-color " + getClassCode("", isDarkTheme)}>
            <Menu 
                className="top-layer"
                isDarkTheme={isDarkTheme} 
                color={color} 
                border={border}
                data={leftMenu}
            />
            
            <Menu 
                className="absolute push-right top-layer"
                isDarkTheme={isDarkTheme} 
                color={color} 
                border={border}
                data={rightMenu}
            />
        </div>  
    )
};

// capitalise first letter of a string
export function capitalize(string: string): string {
	const capFirstLetter = (string: string) => {
		return string.charAt(0).toUpperCase() + string.slice(1)
	}

	if (string.includes('-')) {
		const substr = string.split('-');
		const newStr: string[] = []
		substr.forEach(element => {
			newStr.push(capFirstLetter(element));
		});

		return newStr.join(' ');
	}
	return capFirstLetter(string);
}

// returns mode of app using the file format
export function getTypeFromFormat(format: string): string {
	switch (format.toLowerCase()) {			
		case 'screenplay':
			return "write";

		case 'teleplay':
			return "write";
		
		case 'cards':
			return "ideate";

		case 'threads':
			return "ideate";

		case 'story-map':
			return "ideate";	
		
		case 'character-map':
			return "ideate";

		default :
			return "write";
	}
}

// returns a list of formats with the current mode given
export function getFormatsFromType(type: string): string[] {
	switch (type.toLowerCase()) {			
		case 'write':
			return ["screenplay", "teleplay"];

		case 'ideate':
			return [
				"cards", 
				// "threads",
				"story-map", 
				// "character-map"
			];

		default :
			return [];
	}
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
		// if (display) {
		// 	return "mac-overlay";
		// }

		return "mac-overlay hide";
	}
	return <div className={macOverlay()}></div>
}

function NoMatch() {
  return (
    <div>
      <h2>Error 404: Page not found!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

const App = () => {
	const [isDarkTheme, setIsDarkTheme] = useState(false);
	const [mode, setMode] = useState("ideate");

	// global app styles
    const [showMenu, toggleMenu] = useState(false);
    const [hideSidebar, setHideSidebar] = useState(false);


	return (
		<div className={"app " + getClassCode("", isDarkTheme)}>
			<Routes>
				<Route path="/" element={<Outlet />}>
					<Route 
						index 
						element={<SignIn isDarkTheme={isDarkTheme} />}
					/>
					<Route 
						path="dashboard" 
						element={<Home 
							mode={mode} 
							setMode={(e: string) => setMode(e)} 
							isDarkTheme={isDarkTheme} 
							switchTheme={(e: boolean) => setIsDarkTheme(!isDarkTheme)} 
							showMenu={showMenu}
							toggleMenu={toggleMenu}
							hideSidebar={hideSidebar}
							setHideSidebar={setHideSidebar}
						/>}
					/>
					<Route 
						path="sign-in" 
						element={<SignIn isDarkTheme={isDarkTheme} />}
					/>
					<Route 
						path="sign-up" 
						element={<SignUp isDarkTheme={isDarkTheme} />}
					/>
					<Route 
						path="terms-of-service" 
						element={<TermsOfService />}
					/>
					<Route 
						path="privacy-policy" 
						element={<PrivacyPolicy />}
					/>
					<Route 
						path="project/:projectId" 
						element={<ProjectView 
							mode={mode} 
							setMode={(e: string) => setMode(e)} 
							isDarkTheme={isDarkTheme} 
							switchTheme={(e: boolean) => setIsDarkTheme(!isDarkTheme)} 
							showMenu={showMenu}
							toggleMenu={toggleMenu}
							hideSidebar={hideSidebar}
							setHideSidebar={setHideSidebar}
						/>}
					/>
					<Route
						path="screenplay/:documentId" 
						element={<WriterView isDarkTheme={isDarkTheme} switchTheme={(e: boolean) => setIsDarkTheme(!isDarkTheme)} />}
					/>
					<Route 
						path="cards/:documentId" 
						element={<Cards isDarkTheme={isDarkTheme} switchTheme={(e: boolean) => setIsDarkTheme(!isDarkTheme)} />}
					/>
					<Route 
						path="story-map/:documentId" 
						element={<StoryMap isDarkTheme={isDarkTheme} switchTheme={(e: boolean) => setIsDarkTheme(!isDarkTheme)} />}
					/>
					<Route path="*" element={<NoMatch />} />
				</Route>
			</Routes>
			<Outlet />
		</div>
	);
}

export default App;