import { FormEvent, useState } from "react";

import { auth } from "../firebase/main";
import { sendPasswordResetEmail } from "../firebase/auth";
import { useTitle } from "../misc/title";
import { toMessage } from "@storia/core/misc/errors";
import { FieldError, readForm } from "../misc/forms";
import { AuthCard, Field, FormError, TextLink } from "../components/AuthCard";

const ERROR_ID = "reset-error";

// Forgot your password?: Firebase emails a link to its own page for choosing a
// new one, which then sends the writer back to Log in. It says the same thing
// whether or not the email has an account, so the page can't be used to find out.
const ResetPassword = () => {
  const [error, setError] = useState<{message: string, field?: string}>();
  const [isSubmitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

  useTitle("Reset your password");

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    const email = readForm(event).email.trim();
    try {
      if (email === "") throw new FieldError("email", "Please enter your email");
      setSubmitting(true);
      await sendPasswordResetEmail(auth, email).catch(caught => {
        if ((caught as {code?: string})?.code !== "auth/user-not-found") throw caught;
      });
      setSentTo(email);
    }
    catch (caught) {
      const field = caught instanceof FieldError ? caught.field : undefined;
      setError({message: toMessage(caught), field});
      if (field) document.getElementById(field)?.focus();
    }
    setSubmitting(false);
  };

  return (
    <AuthCard title="Reset your password" footer={<>Remembered it? <TextLink to="/account/login">Log in</TextLink></>}>
      {sentTo ? (
        <div className="flex flex-col gap-4 text-base">
          <p>If there’s an account for <strong className="font-bold break-all">{sentTo}</strong>, an email with a link to choose a new password is on its way.</p>
          <p className="text-[color:var(--muted)]">It can take a minute, and sometimes lands in spam. The link works once, for an hour.</p>
          <button type="button" className="sw-button mt-2 !h-12 w-full justify-center !text-base" onClick={() => setSentTo(undefined)}>
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={send} onInput={() => error && setError(undefined)} noValidate className="flex flex-col gap-4">
          <p className="text-base text-[color:var(--muted)]">Enter the email you log in with, and we’ll send a link to choose a new password.</p>
          <Field id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" autoFocus invalid={error?.field === "email"} errorId={ERROR_ID} />
          <FormError id={ERROR_ID} message={error?.message} />
          <button type="submit" className="sw-button sw-button-soft mt-2 !h-12 w-full justify-center !text-base" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
