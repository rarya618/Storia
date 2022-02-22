import React from 'react';
import styled from 'styled-components';

import '../App.css';
import FormInput from './FormInput';

const RoundButton = styled.button`
	border-radius: 30px;
	padding: 10px 20px;
	margin: 10px;
	border: none;
	font-size: calc(10px + 0.8vmin);
	font-family: 'Noto Sans';
`;

const Form = styled.form`
    border-radius: 15px;
    padding: 20px 10px;
    position: absolute;
    left: 0;
	right: 0;
    z-index: 1;
    margin: 0 auto;
	box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.25);
    width: calc(100% - 20px);
    max-width: 450px;
`;

function InterestForm() {
	return (
        <Form className="white green-text left-align">
            <FormInput label="First Name" id="fname" />
            <FormInput label="Last Name" id="lname" />
            <FormInput label="Email" id="email" />
            <FormInput label="How did you find us?" id="source" />
            <FormInput label="What are you most excited for?" id="feedback" large={true} />
            <RoundButton className="green white-text">Sign Up for Updates</RoundButton>
        </Form>
	);
}

export default InterestForm;