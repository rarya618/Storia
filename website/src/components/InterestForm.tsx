import React, { FormEvent } from 'react';
import styled from 'styled-components';
import { RoundButton } from '../App';

import '../App.css';
import FormInput from './FormInput';

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
    const saveAnswer = (event: FormEvent) => {
        event.preventDefault();

        // @ts-ignore
        const elementsArray = [...event.target.elements];

        const formData = elementsArray.reduce((acc, element) => {
            if (element.id) {
                acc[element.id] = element.value;
            }

            return acc;
        }, {});

        console.log(formData);
    }

	return (
        <Form className="white green-text left-align" onSubmit={saveAnswer}>
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