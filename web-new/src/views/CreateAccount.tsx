import { Dispatch, FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { auth } from "../firebase/main";
import { createUserWithEmailAndPassword } from "../firebase/auth";
import ErrorDisplay from "../components/ErrorDisplay";
import { addUser } from "../firebase/database";
import { useTitle } from "../misc/title";
import FormItem from "../datatypes/FormItem";
import InputTextBox from "../components/TextBox";
import { formContainerStyle, formLogoStyle, formStyle } from "../styles/forms";
import { PurpleButton, WhiteButton } from "../components/Button";
import Spacer from "../components/Spacer";
import { CheckBox } from "../components/CheckBox";

export const createTextWithLink = (text: string, link: {href: string, text: string}, innerClass?: string, outerClass?: string) => {
  return (
    <div className={outerClass}>
      <p className={"text-neutral-600 dark:text-neutral-400 select-none " + innerClass}>{text + " "} {createLink(link, innerClass)}</p>
    </div>
  )
}

const createLink = (link: {text: string, href: string}, className?: string) => {
  return (
    <Link className={"text-purple underline " + className} to={link.href}>{link.text}</Link>
  )
}

const formData: FormItem[] = [
  {id: "firstName", label: "First Name", placeholder: "John"},
  {id: "lastName", label: "Last Name", placeholder: "Doe"},
  {id: "email", label: "Email", placeholder: "john.doe@example.com"},
  {id: "password", label: "Password", placeholder: "At least 8 characters"},
  {id: "passwordConf", label: "Confirm Password", placeholder: "Re-enter password"}
];

export type CreateProps = {
  errorValue: string,
  setError: Dispatch<string>,
  errorDisplay: boolean,
  setErrorDisplay: Dispatch<boolean>,
}

const CreateAccount = (props: CreateProps) => {
  const [checked, toggleChecked] = useState(false);

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
        
        await addUser(response.user.uid, docData);
        
        // @ts-ignore
        sessionStorage.setItem('Auth Token', response._tokenResponse.refreshToken);
        sessionStorage.setItem('userCode', response.user.uid);
        console.log("Sign up successful.");
        sessionStorage.setItem('userId', data.email);
        window.location.href = '/dashboard';
      })
      .catch((error) => {
        if (error.message === "Firebase: Error (auth/email-already-in-use).") {
          props.setError("Email already exists. Try signing in.");
        } else {
          props.setError(error.message);
        }
        props.setErrorDisplay(true);
      })
    }
    catch (error) {
      // @ts-ignore
      props.setError(error);
      props.setErrorDisplay(true);
    }

  }

  const title = "Create Account";
  useTitle(title);

  if (userId) {
    return (<Navigate to="/dashboard" />)
  }
    
  return (
    <div className={formContainerStyle}>
      <form className={formStyle} onSubmit={signUp}>
        <ErrorDisplay error={props.errorValue} display={props.errorDisplay} toggleDisplay={props.setErrorDisplay} />
        <h2 className={formLogoStyle}>Storia</h2>
        {formData.map(formItem => {
          return InputTextBox(formItem)
        })}
        <div className="flex">
          <CheckBox checked={checked} toggleChecked={toggleChecked} /><p className="text-neutral-600 dark:text-neutral-400 text-sm select-none">I have read and agree to Storia's {createLink(termsOfService, "text-sm")} and {createLink(privacyPolicy, "text-sm")}.</p>
        </div>
        <Spacer />
        <div className="flex">
          <PurpleButton text="Create" isSmall={true} />
          <span className="flex-grow"></span>
          <WhiteButton text="Log in" link="/account/login" isSmall={true} />
        </div>
      </form>
    </div>
  )
};

export default CreateAccount;