import React from 'react';
import styled from 'styled-components';

import '../App.css';

type Props = {
    label: string,
    id: string,
    large?: boolean
};

const color = "97, 102, 179";

export const FormLabel = styled.p`
	font-style: normal;
	font-weight: 300;
	font-size: calc(10px + 0.8vmin);
	margin: 8px 2px;
`;

export const FormText = styled.span`
	font-style: normal;
	font-weight: 300;
	font-size: calc(10px + 0.8vmin);
	margin: 8px 2px;
`;

const Input = styled.input`
    background: rgba(${color}, 0.1);
    padding: 10px;
    border: none;
    border-radius: 5px;
    width: calc(100% - 20px);
`;

const InputContainer = styled.div`
    padding: 5px 10px;
`;

const LargeInput = styled.textarea`
    background: rgba(${color}, 0.1);
    padding: 10px;
    border: none;
    border-radius: 5px;
    width: calc(100% - 20px);
    height: 120px;
    resize: none;
`;


const FormInput = (props: Props) => {
    if (props.large) {
        return (
            <InputContainer>
                <FormLabel>{props.label}</FormLabel>
                <LargeInput id={props.id} />
            </InputContainer>
        );
    }
	return (
        <InputContainer>
            <FormLabel>{props.label}</FormLabel>
            <Input id={props.id} type="text" />
        </InputContainer>
	);
}

export default FormInput;