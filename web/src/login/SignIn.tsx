import React, { FormEvent, useState } from "react";
import { Navigate } from "react-router";

import { useTitle } from "../App";
import { auth, signInWithEmailAndPassword, signOut } from "../firebase/config";
import ErrorDisplay from "../objects/ErrorDisplay";
import { setTitleForBrowser } from "../resources/title";
import { Overlay, FormItem, InputGen, Container, StatementGen, CallToAction } from "./SignUp";

const formData: FormItem[] = [
    {id: "email", label: "Email", placeholder: "john.doe@example.com"},
    {id: "password", label: "Password", placeholder: "At least 8 characters"}
];

type Props = {isDarkTheme: boolean};

export const logout = () => {
    signOut(auth);
    sessionStorage.clear();
    console.log("User signed out...");
    window.location.href = "/";
};

const SignIn = ({isDarkTheme} : Props) => {
    const [errorValue, setError] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);
    
    const title = "Sign in";
    useTitle(setTitleForBrowser(title));

    let authToken = sessionStorage.getItem('Auth Token');

    if (authToken) {
        return (<Navigate to="/dashboard" />)
    }

    const signIn = (event: FormEvent) => {
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
            if (data.password === '') throw("Please enter a password")
            if (data.password.length < 8) throw("Your password should be at least 8 characters long")
            
            signInWithEmailAndPassword(auth, data.email, data.password)
            .then((response) => {                
                // @ts-ignore
                sessionStorage.setItem('Auth Token', response._tokenResponse.refreshToken);
                console.log("Sign in successful.");
                sessionStorage.setItem('userId', data.email);
                window.location.href = "/dashboard";
            })
            .catch((error) => {
                if (error.message === "Firebase: Error (auth/wrong-password).") {
                    setError("Incorrect password");
                } else if (error.message === "Firebase: Error (auth/user-not-found).") {
                    setError("User not found");
                } else {
                    setError(error.message);
                }
                setErrorDisplay(true);

            })
        }
        catch (error) {
            // @ts-ignore
            setError(error);
            setErrorDisplay(true);
        }

    }

    return (
        <Overlay className="row">
            <Container onSubmit={signIn}>
                <ErrorDisplay error={errorValue} isDarkTheme={isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
                {formData.map(formItem => {
                    return InputGen(formItem)
                })}
                {CallToAction(title)}
                {StatementGen("Don't have an account? ", {href:"/sign-up", text: "Sign up"})}
            </Container>
        </Overlay>
    )
};

export default SignIn;