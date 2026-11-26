import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { startSession } from "../misc/verified";

import { auth } from "../firebase/main";
import { signInWithEmailAndPassword, signOut } from "../firebase/auth";
import { isInvited } from "../firebase/database";
import { NOT_INVITED } from "@storia/core/misc/invites";
import { useTitle } from "../misc/title";
import { toMessage } from "@storia/core/misc/errors";
import { FieldError, readForm } from "../misc/forms";
import { AuthCard, Field, FormError, TextLink } from "../components/AuthCard";

const ERROR_ID = "login-error";

// sign in page
const Login = () => {
  const [error, setError] = useState<{message: string, field?: string}>();
  const [isSubmitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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

      // an account from before the closed beta, or one taken off the list,
      // would only meet refusals inside, so it stays out here
      const invited = await isInvited(data.email).catch(async (caught) => {
        await signOut(auth);
        throw caught;
      });
      if (!invited) {
        await signOut(auth);
        throw new FieldError("email", NOT_INVITED);
      }

      // the rules let in only a verified email, so one that isn't goes to Check your email
      if (!response.user.emailVerified) {
        navigate("/account/verify");
        return;
      }
      startSession(response.user);
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
    <AuthCard title="Log in" footer="Storia is in a closed beta. Accounts are by invitation.">
      <form onSubmit={signIn} onInput={() => error && setError(undefined)} noValidate className="flex flex-col gap-4">
        <Field id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" autoFocus invalid={error?.field === "email"} errorId={ERROR_ID} />
        <Field id="password" label="Password" type="password" autoComplete="current-password" invalid={error?.field === "password"} errorId={ERROR_ID}
          aside={<TextLink to="/account/reset">Forgot your password?</TextLink>} />
        <FormError id={ERROR_ID} message={error?.message} />
        <button type="submit" className="sw-button sw-button-soft mt-2 !h-12 w-full justify-center !text-base" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthCard>
  )
};

export default Login;
