import { Dispatch, FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { auth } from "../../firebase/main";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "../../firebase/auth";
import { logError } from "../../misc/monitoring";
import { addUser, isInvited } from "../../firebase/database";
import { NOT_INVITED } from "@storia/core/misc/invites";
import { useTitle } from "../../misc/title";
import { toMessage } from "@storia/core/misc/errors";
import { FieldError, readForm } from "../../misc/forms";
import { AuthCard, Field, FormError, TextLink } from "../../components/AuthCard";

export type Props = {
  errorValue: string,
  setError: Dispatch<string>,
  errorDisplay: boolean,
  setErrorDisplay: Dispatch<boolean>,
}

const ERROR_ID = "create-account-error";

// sign up page, for the emails on the closed beta's invite list: nothing
// links here, so an invitation sends the link. Like Login, it keeps its error to itself
const CreateAccount = () => {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{message: string, field?: string}>();
  const navigate = useNavigate();

  useTitle("Create account");

  if (sessionStorage.getItem("Auth Token")) {
    return (<Navigate to="/home" />)
  }

  const signUp = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const data = readForm(event);

    try {
      if (data.firstName.trim() === '') throw new FieldError("firstName", "Please enter your first name");
      if (data.lastName.trim() === '') throw new FieldError("lastName", "Please enter your last name");
      if (data.email.trim() === '') throw new FieldError("email", "Please enter your email");
      if (data.password === '') throw new FieldError("password", "Please choose a password");
      if (data.password.length < 8) throw new FieldError("password", "Your password needs to be at least 8 characters long");
      if (data.password !== data.passwordConf) throw new FieldError("passwordConf", "The passwords don't match");
      if (!agreed) throw new FieldError("agree", "Please agree to the Terms of Service and Privacy Policy to continue");

      setSubmitting(true);
      const response = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);

      // the closed beta: an email that isn't invited doesn't keep the account
      // it just made, so it can sign up once it is
      const invited = await isInvited(data.email).catch(async (caught) => {
        await response.user.delete().catch(() => signOut(auth));
        throw caught;
      });
      if (!invited) {
        await response.user.delete().catch(() => signOut(auth));
        throw new FieldError("email", NOT_INVITED);
      }

      await addUser(response.user.uid, {
        email: data.email.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        plan: "Personal"
      });

      // the rules let in only a verified email, so prove it before the scripts;
      // if this first link doesn't send, Check your email offers another
      await sendEmailVerification(response.user).catch(caught => logError("send verification", caught));
      navigate("/account/verify");
    }
    catch (caught) {
      const field = caught instanceof FieldError ? caught.field : undefined;
      setError({message: toMessage(caught), field});
      if (field) document.getElementById(field)?.focus();
      setSubmitting(false);
    }
  }

  const clearError = () => { if (error) setError(undefined); };
  const marked = (id: string) => error?.field === id;

  return (
    <AuthCard title="Create your account" footer={<>Have an account? <TextLink to="/account/login">Log in</TextLink></>}>
      <form onSubmit={signUp} onInput={clearError} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field id="firstName" label="First name" autoComplete="given-name" autoFocus invalid={marked("firstName")} errorId={ERROR_ID} />
          <Field id="lastName" label="Last name" autoComplete="family-name" invalid={marked("lastName")} errorId={ERROR_ID} />
        </div>
        <Field id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" invalid={marked("email")} errorId={ERROR_ID} />
        <Field id="password" label="Password" type="password" placeholder="At least 8 characters" autoComplete="new-password" invalid={marked("password")} errorId={ERROR_ID} />
        <Field id="passwordConf" label="Confirm password" type="password" autoComplete="new-password" invalid={marked("passwordConf")} errorId={ERROR_ID} />

        <label className="flex cursor-pointer items-start gap-3 pt-1 text-sm text-[color:var(--muted)]">
          <input
            id="agree"
            type="checkbox"
            checked={agreed}
            onChange={event => setAgreed(event.target.checked)}
            aria-invalid={marked("agree") || undefined}
            aria-describedby={marked("agree") ? ERROR_ID : undefined}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[color:var(--ui)] sw-check"
          />
          <span>I have read and agree to Storia’s <TextLink to="/terms-of-service">Terms of Service</TextLink> and <TextLink to="/privacy-policy">Privacy Policy</TextLink>.</span>
        </label>

        <FormError id={ERROR_ID} message={error?.message} />
        <button type="submit" className="sw-button sw-button-soft mt-2 !h-12 w-full justify-center !text-base" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  )
};

export default CreateAccount;
