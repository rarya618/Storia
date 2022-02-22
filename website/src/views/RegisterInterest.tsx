import React from 'react';
import styled from 'styled-components';

import '../App.css';
import InterestForm from '../components/InterestForm';

const Title = styled.h1`
	font-style: normal;
	font-weight: 300;
	font-size: calc(42px + 1.6vmin);
	margin: 10px;
`;

function RegisterInterest() {
	return (
		<div>
			<header className="header">
				<div className="content">
					<Title>Expression of Interest</Title>
				</div>
			</header>
            <InterestForm />
		</div>
	);
}

export default RegisterInterest;