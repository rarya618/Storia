import { FormEvent, useState } from "react";
import { Navigate } from "react-router";

import { auth } from "../firebase/main";
import { signInWithEmailAndPassword } from "../firebase/auth";
import { useTitle } from "../misc/title";
import { toMessage } from "../misc/errors";
import { FieldError, readForm } from "../misc/forms";
import { AuthCard, Field, FormError, TextLink } from "../components/AuthCard";

const ERROR_ID = "login-error";

// sign in page
const Login = () => {
  const [error, setError] = useState<{message: string, field?: string}>();
  const [isSubmitting, setSubmitting] = useState(false);

  useTitle("Log in");

  if (sessionStorage.getItem('Auth Token')) {
    return (<Navigate to="/home" />)
  }

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const data = readForm(event);

    try {
      if (data.email.trim() === '') throw new FieldError("email", "Please enter your email");
      if (data.password === '') throw new FieldError("password", "Please enter your password");

      setSubmitting(true);
      const response = await signInWithEmailAndPassword(auth, data.email.trim(), data.password);

      sessionStorage.setItem('Auth Token', response.user.refreshToken);
      sessionStorage.setItem('User ID', response.user.uid);
      sessionStorage.setItem('User Email', data.email.trim());
      window.location.href = "/home";
    }
    catch (caught) {
      const field = caught instanceof FieldError ? caught.field : undefined;
      setError({message: toMessage(caught), field});
      if (field) document.getElementById(field)?.focus();
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Log in" footer={<>Don’t have an account? <TextLink to="/account/create">Create one</TextLink></>}>
      <form onSubmit={signIn} onInput={() => error && setError(undefined)} noValidate className="flex flex-col gap-3.5">
        <Field id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" autoFocus invalid={error?.field === "email"} errorId={ERROR_ID} />
        <Field id="password" label="Password" type="password" autoComplete="current-password" invalid={error?.field === "password"} errorId={ERROR_ID} />
        <FormError id={ERROR_ID} message={error?.message} />
        <button type="submit" className="sw-button sw-button-soft mt-1 w-full justify-center" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthCard>
  )
};

export default Login;
