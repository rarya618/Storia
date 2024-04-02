import { FormEvent, useState } from "react";
import { Navigate } from "react-router";

import { auth } from "../firebase/main";
import { signInWithEmailAndPassword, signOut } from "../firebase/auth";
import ErrorDisplay from "../components/ErrorDisplay";
import Button from "../components/Button";
import { createTextWithLink } from "./SignUp";
import { useTitle, setTitleForBrowser } from "../misc/title";
import { formStyle } from "../styles/forms";
import FormItem from "../datatypes/FormItem";
import InputTextBox from "../components/TextBox";
import Spacer from "../components/Spacer";

// basic form template
const formData: FormItem[] = [
    {
        id: "email", 
        label: "Email", 
        placeholder: "john.doe@example.com"
    },
    {
        id: "password", 
        label: "Password", 
        placeholder: "At least 8 characters",
        subtext: createTextWithLink("Forgot your password?", {href:"/forgot-password", text: "Reset it now"}, "text-sm", "pl-4 pt-1")
    }
];

// logs the user out of current session
export const logout = () => {
    signOut(auth);
    sessionStorage.clear();

    console.log("User signed out...");
    window.location.href = "/";
};

// sign in page
const SignIn = () => {
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
                sessionStorage.setItem('userCode', response.user.uid);
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
        <div className="mx-auto my-20 inline-block">
            <form className={formStyle} onSubmit={signIn}>
                <ErrorDisplay error={errorValue} display={errorDisplay} toggleDisplay={setErrorDisplay} />
                {formData.map(formItem => {
                    return InputTextBox(formItem)
                })}
                {Spacer()}
                {Button(title)}
            </form>
            {createTextWithLink("Don't have an account?", {href:"/sign-up", text: "Sign up"}, "text-lg", "pl-9 py-5")}
        </div>
    )
};

export default SignIn;