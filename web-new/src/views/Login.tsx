import { FormEvent, useState } from "react";
import { Navigate } from "react-router";

import { auth } from "../firebase/main";
import { signInWithEmailAndPassword, signOut } from "../firebase/auth";
import ErrorDisplay from "../components/ErrorDisplay";
import { PurpleButton } from "../components/Button";
// import { createTextWithLink } from "./create/CreateAccount";
import { useTitle } from "../misc/title";
import { formContainerStyle, formLogoStyle, formStyle } from "../styles/forms";
import FormItem from "../datatypes/FormItem";
import TextBox from "../components/TextBox";
import Spacer from "../components/Spacer";
import { createTextWithLink } from "./create/CreateAccount";

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
    // subtext: createTextWithLink("Forgot your password?", {href:"/forgot-password", text: "Reset it now"}, "text-sm", "pl-4 pt-1")
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
  
  const title = "Log in";
  useTitle(title);

  let authToken = sessionStorage.getItem('Auth Token');

  if (authToken) {
    return (<Navigate to="/home" />)
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
        window.location.href = "/home";
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
    <div className={formContainerStyle + " bg-purple-tint dark:bg-neutral-800"}>
      <form className={formStyle + " shadow"} onSubmit={signIn}>
        <h2 className={formLogoStyle + " mx-auto"}>Storia</h2>
        <ErrorDisplay error={errorValue} display={errorDisplay} toggleDisplay={setErrorDisplay} />
        {formData.map(formItem => {
          return <TextBox data={formItem} />
        })}
        <Spacer />
        <div className="flex flex-col">
          <div><PurpleButton text="Log in" /></div>
          <span className="h-3.5"></span>
          {createTextWithLink("Don’t have an account? ", {
            href: "/account/create",
            text: "Create one"
          }, "text-sm")}
        </div>
      </form>
    </div>
  )
};

export default Login;