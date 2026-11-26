import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { auth } from "../firebase/main";
import { sendEmailVerification } from "../firebase/auth";
import { useTitle } from "../misc/title";
import { checkVerified, startSession } from "../misc/verified";
import { toMessage } from "@storia/core/misc/errors";
import { AuthCard, FormError, TextLink } from "../components/AuthCard";

const ERROR_ID = "verify-error";

// Check your email: between signing in and the scripts for an email that
// hasn't been verified, since the database rules refuse it until then.
// Create account sends the first link; this page sends more, and checks again
// whenever the writer comes back to the tab after opening one.
const VerifyEmail = () => {
  const user = auth.currentUser;
  const [error, setError] = useState<string>();
  const [checking, setChecking] = useState(false);
  const [sent, setSent] = useState(false);

  useTitle("Check your email");

  const finish = useCallback(async (quietly: boolean) => {
    if (!user) return;
    setChecking(true);
    try {
      if (await checkVerified(user)) {
        startSession(user);
        window.location.href = "/home";
        return;
      }
      if (!quietly) setError("That email isn’t verified yet. Open the link in it, or send a new one.");
    } catch (caught) {
      if (!quietly) setError(toMessage(caught));
    }
    setChecking(false);
  }, [user]);

  // opening the link happens in another tab, so look again on coming back
  useEffect(() => {
    const onReturn = () => { if (document.visibilityState === "visible") finish(true); };
    document.addEventListener("visibilitychange", onReturn);
    return () => document.removeEventListener("visibilitychange", onReturn);
  }, [finish]);

  if (!user) return <Navigate to="/account/login" replace />;

  const resend = async () => {
    setError(undefined);
    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch (caught) {
      setError(toMessage(caught));
    }
  };

  return (
    <AuthCard title="Check your email" footer={<>Not you? <TextLink to="/account/logout">Log out</TextLink></>}>
      <div className="flex flex-col gap-4 text-base">
        <p>To finish, open the link we sent to <strong className="font-bold break-all">{user.email}</strong>. It proves the email is yours.</p>
        <p className="text-[color:var(--muted)]">
          {sent ? "A new link is on its way. Only the newest one works." : "It can take a minute, and sometimes lands in spam."}
        </p>
        <FormError id={ERROR_ID} message={error} />
        <button type="button" className="sw-button sw-button-soft mt-2 !h-12 w-full justify-center !text-base" disabled={checking} onClick={() => finish(false)}>
          {checking ? "Checking…" : "I’ve opened the link"}
        </button>
        <button type="button" className="sw-button !h-12 w-full justify-center !text-base" onClick={resend}>
          Send a new link
        </button>
      </div>
    </AuthCard>
  );
};

export default VerifyEmail;
