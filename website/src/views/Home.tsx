import React from 'react';
import styled from 'styled-components';

import sketchSource from '../resources/UI.png';

import '../App.css';
import { Link } from 'react-router-dom';
import { RoundButton, Section } from '../App';

const Title = styled.h1`
	font-style: normal;
	font-weight: 300;
	font-size: calc(42px + 1.6vmin);
	margin: 10px;
`;

const Logline = styled.h5`
	font-style: bold;
	margin: 10px;
`;

const Sketch = styled.img`
	width: 90%;
	max-width: 900px;
	z-index: 1;
	left: 0;
	right: 0;
	margin: 0 auto;
	box-shadow: 0px 40px 40px 10px rgba(0, 0, 0, 0.25);
`;

function Home() {
	return (
		<Section>
			<header className="header">
				<div className="content">
					<Title>The only app you need <br/> for all your writing needs.</Title>
					<Logline>Screenwriting now in development</Logline>
					<Link to="/register-interest">
						<RoundButton 
							className="green white-text hoverable"
						>
							Sign up for updates
						</RoundButton>
					</Link>
				</div>
			</header>
			<Sketch src={sketchSource} className="absolute" />
		</Section>
	);
}

export default Home;