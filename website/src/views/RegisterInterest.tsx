import React from 'react';
import styled from 'styled-components';

import '../App.css';
import InterestForm from '../components/InterestForm';
import { Title } from './Home';


function RegisterInterest() {
	return (
		<div>
			<header className="header">
				<div className="content">
					<Title>Apply for an Invite</Title>
				</div>
			</header>
            <InterestForm />
		</div>
	);
}

export default RegisterInterest;