import React from 'react';
import styled from 'styled-components';
import './App.css';

const Logo = styled.h4`
	font-style: normal;
	font-weight: 300;
`;

const Title = styled.h1`
	font-style: normal;
	font-weight: 300;
	margin: 0;
`;

const Logline = styled.h5`
	font-style: bold;
	margin: 0;
`;

function App() {
	return (
		<div className="App">
			<section className="header">
				<div className="content">
					<Logo>WriterStudio</Logo>
					<Title>The only app you need for all your writing needs.</Title>
					<Logline>Screenwriting now in development</Logline>
				</div>
			</section>
		</div>
	);
}

export default App;