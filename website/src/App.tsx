import React from 'react';
import styled from 'styled-components';
import {Routes, Route, Link} from 'react-router-dom';
import Home from './views/Home';
import RegisterInterest from './views/RegisterInterest';

const Logo = styled.h2`
	font-family: Norican !important;	
	font-weight: 300;
	font-size: calc(24px + 1vmin);
	z-index: 10;
	top: 0;
	color: #fff;
	text-decoration: none !important;
`;

const Menu = styled.nav`
	display: flex;
	justify-content: space-between;
`;

export const RoundButton = styled.button`
	border-radius: 5px;
	padding: 9px 15px;
	margin: 10px;
	border: none;
	font-size: 14px;
	font-family: 'Noto Sans';
`;

export const Section = styled.section`
	height: 100vh;
	overflow: hidden;
`;

function App() {
	return (
		<div className="App">
			<Menu className="absolute standard-margin">
				<div className="middle left">
					<Link className="no-underline" to="/">
						<Logo>Storia</Logo>
					</Link>
				</div>
				<div className="middle right no-mobile">
					<Link to="/register-interest">
						<RoundButton className="right white purple-text hoverable">Get invite</RoundButton>
					</Link>
				</div>
			</Menu>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/register-interest" element={<RegisterInterest />} />
			</Routes>
		</div>
	);
}

export default App;