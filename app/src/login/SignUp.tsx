import React, { Dispatch, FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons';

import { useTitle } from "../App";
import { setTitleForBrowser } from "../resources/title";
import { auth, createUserWithEmailAndPassword, db } from "../firebase/config";
import ErrorDisplay from "../objects/ErrorDisplay";

export const Overlay = styled.div`
    width: 100%;
    height: 100vh;
    overflow: scroll;
    margin: 0;
    padding: 0;
    background: linear-gradient(90deg, rgba(97, 102, 179, 0.2) 0%, rgba(137, 181, 175, 0.3) 100%), #FFFFFF;
`;

export const Container = styled.form`
    width: 500px;
    margin: auto;
    padding: 5px;
`;

const FormItemContainer = styled.div`
    margin: 15px 5px;
    color: #6166B3;
`;

const Label = styled.p`
    margin: 5px 0;
    color: #6166B3;
    text-align: left;
    -webkit-user-select: none;
    user-select: none;
`;

const Input = styled.input`
    width: calc(100% - 20px);
    color: #6166B3;
    font-size: 20px;
    margin: 0;
    border: none;
    background: linear-gradient(0deg, rgba(97, 102, 179, 0.1), rgba(97, 102, 179, 0.1)), #FFFFFF;
    padding: 12px 10px;
    border-radius: 5px;
`;

// Check box handler
const CheckBoxContainer = styled.div`
    display: flex;
    margin: 15px 5px;
`;

// const CheckBox = styled.input`
//     margin: 10px 8px 10px 0;
//     color: #6166B3;
// `;

const CheckBoxView = styled.div`
    width: 24px;
    height: 20px;
    padding: 0;
    margin: 6px 8px 6px 0;
    border-radius: 2px;
    background: linear-gradient(0deg, rgba(97, 102, 179, 0.1), rgba(97, 102, 179, 0.1)), #FFFFFF;
    cursor: pointer;
`;

const CheckedBox = styled.div`
    width: 20px;
    height: 20px;
    padding: 0;
    margin: 0;
    border-radius: 2px;
    background: #6166B3;
    color: #fff;
`;

type CheckBoxProps = {
    checked: boolean,
    toggleChecked: Dispatch<boolean>
}

const CheckBox = (props: CheckBoxProps) => {
    return (
        <CheckBoxView onClick={() => props.toggleChecked(!props.checked)}>
            {props.checked ? <CheckedBox><FontAwesomeIcon icon={faCheck} /></CheckedBox> : null}
        </CheckBoxView>
    )
};

export const StatementGen = (text: string, link: {href: string, text: string}) => {
    return (
        <FormItemContainer>
            <Label>{text} {LinkGen(link)}</Label>
        </FormItemContainer>
    )
}

const LinkGen = (link: {text: string, href: string}) => {
    return (
        <Link className="purple-color underline" to={link.href}>{link.text}</Link>
    )
}

export type FormItem = {
    id: string,
    label: string,
    placeholder: string
};

const formData: FormItem[] = [
    {id: "firstName", label: "First Name", placeholder: "John"},
    {id: "lastName", label: "Last Name", placeholder: "Doe"},
    {id: "email", label: "Email", placeholder: "john.doe@example.com"},
    {id: "password", label: "Password", placeholder: "At least 8 characters"},
    {id: "passwordConf", label: "Confirm Password", placeholder: "Re-enter password"}
];

export const InputGen = (formItem: FormItem) => {
    return (
        <FormItemContainer>
            <Label>{formItem.label}</Label>
            {
                formItem.id.match("password") ?
                <Input id={formItem.id} type="password" placeholder={formItem.placeholder} /> : (
                    formItem.id === 'email' ? 
                    <Input id={formItem.id} type="email" placeholder={formItem.placeholder} /> : 
                    <Input id={formItem.id} placeholder={formItem.placeholder} />
                )
            }
        </FormItemContainer>
    )
}

export const CallToAction = (text: string) => {
    return (
        <Label>
            <button className="button purple small-spaced-none white-color standard round-5px">
                {text}
            </button>
        </Label>
    )
}

type Props = {isDarkTheme: boolean};

const SignUp = ({isDarkTheme} : Props) => {
    const [checked, toggleChecked] = useState(false);
    const [errorValue, setError] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);

    const termsOfService = {href: "/terms-of-service", text: "Terms of Service"};
    const privacyPolicy = {href: "/privacy-policy", text: "Privacy Policy"};

    const userId = sessionStorage.getItem("userId");

    const signUp = (event: FormEvent) => {
        event.preventDefault();

        // @ts-ignore
        const elementsArray = [...event.target.elements];

        const data = elementsArray.reduce((acc, element) => {
            if (element.id) {
                acc[element.id] = element.value;
            }

            return acc;
        }, {});

        try {
            if (data.email === '') throw("Please enter an email")
            if (data.firstName === '') throw("Please enter a first name")
            if (data.lastName === '') throw("Please enter a last name")
            if (data.password === '') throw("Please enter a password")
            if (data.passwordConf === '') throw("Please confirm your password")
            if (data.password.length < 8) throw("Your password should be at least 8 characters long")
            if (data.password !== data.passwordConf) throw("Passwords do not match")
            if (!checked) throw("You'll need to read and agree to our Privacy Policy and Terms of Service to continue signing up.")
            
            createUserWithEmailAndPassword(auth, data.email, data.password)
            .then(async (response) => {
                const docData = {email: data.email, firstName: data.firstName, lastName: data.lastName, plan: "Personal"};
                
                await db.collection("users").doc(response.user.uid).set(docData);
                
                // @ts-ignore
                sessionStorage.setItem('Auth Token', response._tokenResponse.refreshToken);
                console.log("Sign up successful.");
                sessionStorage.setItem('userId', data.email);
                window.location.href = '/dashboard';
            })
            .catch((error) => {
                setError(error.message);
                setErrorDisplay(true);
            })
        }
        catch (error) {
            // @ts-ignore
            setError(error);
            setErrorDisplay(true);
        }

    }

    const title = "Sign up";
    useTitle(setTitleForBrowser(title));

    if (userId) {
        return (<Navigate to="/dashboard" />)
    }
    
    return (
        <Overlay className="row">
            <Container onSubmit={signUp}>
                <ErrorDisplay error={errorValue} isDarkTheme={isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
                {formData.map(formItem => {
                    return InputGen(formItem)
                })}
                <CheckBoxContainer>
                    <CheckBox checked={checked} toggleChecked={toggleChecked} /><Label>I have read and agree to WriterStudio’s {LinkGen(termsOfService)} and {LinkGen(privacyPolicy)}.</Label>
                </CheckBoxContainer>
                {CallToAction(title)}
                {StatementGen("Already have an account? ", {href:"/sign-in", text: "Sign in"})}
            </Container>
        </Overlay>
    )
};

export default SignUp;