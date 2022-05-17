import React, { FormEvent, useState } from 'react';
import styled from 'styled-components';
import { RoundButton } from '../App';

import '../App.css';
import { db } from '../firebase/config';
import FormInput, { FormLabel, FormText } from './FormInput';

const Box = styled.div`
    border-radius: 5px;
    padding: 12px 2px;
    position: absolute;
    left: 0;
	right: 0;
    z-index: 1;
    margin: 0 auto;
	box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.25);
    width: calc(100% - 30px);
    max-width: 400px;
`;

function InterestForm() {
    const [submitted, setSubmitted] = useState<{fname: string, email: string} | undefined>();
    
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

        if (formData.email !== '') {
            if (formData.message !== '') {
                db.collection("InterestForm").add(formData);
                setSubmitted({fname: formData.fname, email: formData.email});
            }
            else {
                alert("Please answer the question.")
            }
        }

        else {
            alert("Please enter an email.")
        }
    }

    if (!submitted)
        return (
            <Box className="white purple-text left-align">
                <form onSubmit={saveAnswer}>
                    <FormInput label="First Name" id="fname" />
                    <FormInput label="Last Name" id="lname" />
                    <FormInput label="Email*" id="email" />
                    <FormInput label="How did you find us?" id="source" />
                    <FormInput label="Which feature excites you the most?*" id="message" large={true} />
                    <RoundButton className="purple white-text">Apply</RoundButton>
                    <FormText>*Required</FormText>
                </form>
            </Box>
        );
    
    else
        return (
            <Box className="white green-text left-align">
                <FormLabel>{"Thank you for your interest. You will receive your invite on " + submitted.email + " in a few days."}</FormLabel>
            </Box>
        )
}

export default InterestForm;