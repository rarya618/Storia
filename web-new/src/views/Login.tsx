import { FormEvent, useState } from "react";
import { Navigate } from "react-router";

import { auth } from "../firebase/main";
import { signInWithEmailAndPassword, signOut } from "../firebase/auth";
import ErrorDisplay from "../components/ErrorDisplay";
import { PurpleButton, WhiteButton } from "../components/Button";
import { createTextWithLink } from "./CreateAccount";
import { useTitle } from "../misc/title";
import { formContainerStyle, formLogoStyle, formStyle } from "../styles/forms";
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
export const logOut = () => {
  signOut(auth);
  sessionStorage.clear();

  console.log("User logged out...");
  window.location.href = "/";
};

// sign in page
const Login = () => {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);
  
  const title = "Log in to your account";
  useTitle(title);

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
        console.log("Log in successful.");
        sessionStorage.setItem('User ID', response.user.uid);
        sessionStorage.setItem('User Email', data.email);
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
    <div className={formContainerStyle}>
      <form className={formStyle} onSubmit={signIn}>
        <ErrorDisplay error={errorValue} display={errorDisplay} toggleDisplay={setErrorDisplay} />
        <h2 className={formLogoStyle}>Storia</h2>
        {formData.map(formItem => {
          return InputTextBox(formItem)
        })}
        {Spacer()}
        <div className="flex">
          {PurpleButton("Log in")}
          <span className="flex-grow"></span>
          {WhiteButton("Create an account", "/create-account")}
        </div>
      </form>
    </div>
  )
};

export default Login;