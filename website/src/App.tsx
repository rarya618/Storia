import React from 'react';
import styled from 'styled-components';
import {Routes, Route, Link} from 'react-router-dom';
import Home from './views/Home';
import RegisterInterest from './views/RegisterInterest';

const Logo = styled.h2`
	font-style: normal;
	font-weight: 300;
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
	border-radius: 30px;
	padding: 10px 20px;
	margin: 10px;
	border: none;
	font-size: calc(10px + 0.8vmin);
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
						<Logo>WriterStudio</Logo>
					</Link>
				</div>
				<div className="middle right no-mobile">
					<Link to="/register-interest">
						<RoundButton className="right white green-text hoverable">Sign up for updates</RoundButton>
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