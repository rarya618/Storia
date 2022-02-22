import React from 'react';
import styled from 'styled-components';

import '../App.css';

type Props = {
    label: string,
    id: string,
    large?: boolean
};

export const FormLabel = styled.p`
	font-style: normal;
	font-weight: 300;
	font-size: calc(12px + 0.8vmin);
	margin: 8px 2px;
`;

const Input = styled.input`
    background: rgba(150, 199, 193, 0.25);
    padding: 10px;
    border: none;
    border-radius: 5px;
    width: calc(100% - 20px);
`;

const InputContainer = styled.div`
    padding: 5px 10px;
`;

const LargeInput = styled.textarea`
    background: rgba(150, 199, 193, 0.25);
    padding: 10px;
    border: none;
    border-radius: 5px;
    width: calc(100% - 20px);
    height: 100px;
    resize: none;
`;


const FormInput = (props: Props) => {
    if (props.large) {
        return (
            <InputContainer>
                <FormLabel>{props.label}</FormLabel>
                <LargeInput name={props.id} />
            </InputContainer>
        );
    }
	return (
        <InputContainer>
            <FormLabel>{props.label}</FormLabel>
            <Input name={props.id} type="text" />
        </InputContainer>
	);
}

export default FormInput;