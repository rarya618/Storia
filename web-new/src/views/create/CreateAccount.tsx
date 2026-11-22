import { Dispatch, FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { auth } from "../../firebase/main";
import { createUserWithEmailAndPassword } from "../../firebase/auth";
import ErrorDisplay from "../../components/ErrorDisplay";
import { addUser } from "../../firebase/database";
import { useTitle } from "../../misc/title";
import FormItem from "../../datatypes/FormItem";
import TextBox from "../../components/TextBox";
import { formContainerStyle, formLogoStyle, formStyle } from "../../styles/forms";
import { PurpleButton } from "../../components/Button";
import Spacer from "../../components/Spacer";
import { CheckBox } from "../../components/CheckBox";
import { readForm } from "../../components/CreatePage";
import { toMessage } from "../../misc/errors";

export const createTextWithLink = (text: string, link: {href: string, text: string}, innerClass?: string, outerClass?: string) => {
  return (
    <div className={outerClass}>
      <p className={"text-neutral-600 dark:text-neutral-400 select-none " + innerClass}>{text} {createLink(link, innerClass)}</p>
    </div>
  )
}

export const createLink = (link: {text: string, href: string}, className?: string) => {
  return (
    <Link className={"text-purple font-semibold hover:underline underline-offset-2 " + (className ?? "")} to={link.href}>{link.text}</Link>
  )
}

const formData: FormItem[] = [
  {id: "firstName", label: "First name", placeholder: "John", autoComplete: "given-name"},
  {id: "lastName", label: "Last name", placeholder: "Doe", autoComplete: "family-name"},
  {id: "email", label: "Email", placeholder: "john.doe@example.com", autoComplete: "email"},
  {id: "password", label: "Password", placeholder: "At least 8 characters", autoComplete: "new-password"},
  {id: "passwordConf", label: "Confirm password", placeholder: "Re-enter password", autoComplete: "new-password"}
];

export type Props = {
  errorValue: string,
  setError: Dispatch<string>,
  errorDisplay: boolean,
  setErrorDisplay: Dispatch<boolean>,
}

const CreateAccount = (props: Props) => {
  const [checked, toggleChecked] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const termsOfService = {href: "/terms-of-service", text: "Terms of Service"};
  const privacyPolicy = {href: "/privacy-policy", text: "Privacy Policy"};

  useTitle("Create account");

  if (sessionStorage.getItem("Auth Token")) {
    return (<Navigate to="/home" />)
  }

  const signUp = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const data = readForm(event);

    try {
      if (data.firstName.trim() === '') throw("Please enter your first name")
      if (data.lastName.trim() === '') throw("Please enter your last name")
      if (data.email.trim() === '') throw("Please enter your email")
      if (data.password === '') throw("Please choose a password")
      if (data.password.length < 8) throw("Your password needs to be at least 8 characters long")
      if (data.password !== data.passwordConf) throw("The passwords don't match")
      if (!checked) throw("Please agree to the Terms of Service and Privacy Policy to continue")

      setSubmitting(true);
      const response = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);

      await addUser(response.user.uid, {
        email: data.email.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        plan: "Personal"
      });

      sessionStorage.setItem('Auth Token', response.user.refreshToken);
      sessionStorage.setItem('User ID', response.user.uid);
      sessionStorage.setItem('User Email', data.email.trim());
      window.location.href = "/home";
    }
    catch (error) {
      props.setError(toMessage(error));
      props.setErrorDisplay(true);
      setSubmitting(false);
    }
  }

  return (
    <main className={formContainerStyle + " bg-purple-tint dark:bg-neutral-800"}>
      <form className={formStyle + " shadow"} onSubmit={signUp} noValidate>
        <ErrorDisplay error={props.errorValue} display={props.errorDisplay} toggleDisplay={props.setErrorDisplay} />
        <h1 className={formLogoStyle}>Storia</h1>
        {formData.map(formItem => {
          return <TextBox key={formItem.id} data={formItem} />
        })}
        <CheckBox id="agree" checked={checked} toggleChecked={toggleChecked} labelClassName="text-neutral-600 dark:text-neutral-400 text-sm">
          I have read and agree to Storia's {createLink(termsOfService, "text-sm")} and {createLink(privacyPolicy, "text-sm")}.
        </CheckBox>
        <Spacer />
        <div className="flex flex-col gap-4">
          <div><PurpleButton text={isSubmitting ? "Creating account…" : "Create account"} disabled={isSubmitting} /></div>
          {createTextWithLink("Have an account?", {
            href: "/account/login",
            text: "Log in"
          }, "text-sm")}
        </div>
      </form>
    </main>
  )
};

export default CreateAccount;
