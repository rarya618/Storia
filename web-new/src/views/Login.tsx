import { FormEvent, useState } from "react";
import { Navigate } from "react-router";

import { auth } from "../firebase/main";
import { signInWithEmailAndPassword, signOut } from "../firebase/auth";
import ErrorDisplay from "../components/ErrorDisplay";
import { PurpleButton } from "../components/Button";
import { useTitle } from "../misc/title";
import { formContainerStyle, formLogoStyle, formStyle } from "../styles/forms";
import FormItem from "../datatypes/FormItem";
import TextBox from "../components/TextBox";
import Spacer from "../components/Spacer";
import { createTextWithLink } from "./create/CreateAccount";
import { readForm } from "../components/CreatePage";
import { toMessage } from "../misc/errors";

// basic form template
const formData: FormItem[] = [
  {
    id: "email",
    label: "Email",
    placeholder: "john.doe@example.com",
    autoComplete: "email"
  },
  {
    id: "password",
    label: "Password",
    placeholder: "At least 8 characters",
    autoComplete: "current-password"
  }
];

// logs the user out of current session
export const logOut = () => {
  signOut(auth);
  sessionStorage.clear();

  window.location.href = "/";
};

// sign in page
const Login = () => {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  useTitle("Log in");

  if (sessionStorage.getItem('Auth Token')) {
    return (<Navigate to="/home" />)
  }

  const showError = (error: unknown) => {
    setError(toMessage(error));
    setErrorDisplay(true);
  }

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const data = readForm(event);

    try {
      if (data.email.trim() === '') throw("Please enter your email")
      if (data.password === '') throw("Please enter your password")

      setSubmitting(true);
      const response = await signInWithEmailAndPassword(auth, data.email.trim(), data.password);

      sessionStorage.setItem('Auth Token', response.user.refreshToken);
      sessionStorage.setItem('User ID', response.user.uid);
      sessionStorage.setItem('User Email', data.email.trim());
      window.location.href = "/home";
    }
    catch (error) {
      showError(error);
      setSubmitting(false);
    }
  }

  return (
    <main className={formContainerStyle + " bg-purple-tint dark:bg-neutral-800"}>
      <form className={formStyle + " shadow"} onSubmit={signIn} noValidate>
        <h1 className={formLogoStyle}>Storia</h1>
        <ErrorDisplay error={errorValue} display={errorDisplay} toggleDisplay={setErrorDisplay} />
        {formData.map(formItem => {
          return <TextBox key={formItem.id} data={formItem} />
        })}
        <Spacer />
        <div className="flex flex-col gap-4">
          <div><PurpleButton text={isSubmitting ? "Logging in…" : "Log in"} disabled={isSubmitting} /></div>
          {createTextWithLink("Don’t have an account?", {
            href: "/account/create",
            text: "Create one"
          }, "text-sm")}
        </div>
      </form>
    </main>
  )
};

export default Login;
