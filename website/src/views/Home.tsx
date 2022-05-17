import React from 'react';
import styled from 'styled-components';

import projectsView from '../resources/Projects.png';
import cardsView from '../resources/Cards.png';
import storyMapView from '../resources/StoryMap.png';

import '../App.css';
import { Link } from 'react-router-dom';
import { RoundButton, Section } from '../App';

export const Title = styled.h1`
	font-style: normal;
	font-weight: 300;
	font-size: calc(36px + 2vmin);
	margin: 5px 15px;
`;

const Logline = styled.h2`
	margin: 10px;
	font-weight: 300;
	font-size: calc(12px + 1vmin);
`;

const Sketches = styled.div`
	display: flex;
	flex-direction: row;
	overflow-x: scroll;
	overflow-y: hidden;
	margin: 0 auto;
	max-width: 1000px;
`;

const Sketch = styled.img`
	margin: 0px 20px;
	width: 820px;
	z-index: 1;
	border-radius: 5px;
	left: 0;
	right: 0;
	box-shadow: 0px 40px 25px 0px rgba(0, 0, 0, 0.25);
`;

function Home() {
	return (
		<Section>
			<header className="header">
				<div className="content">
					<Title>The only app you need <br/> for all your writing needs.</Title>
					<Logline>Exclusive beta now open</Logline>
					<Link to="/register-interest">
						<RoundButton 
							className="purple white-text hoverable"
						>
							Get invite
						</RoundButton>
					</Link>
				</div>
			</header>
			<Sketches>
				<Sketch src={projectsView} />
				<Sketch src={cardsView} />
				<Sketch src={storyMapView} />
			</Sketches>
		</Section>
	);
}

export default Home;