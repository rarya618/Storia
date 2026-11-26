// turn anything thrown (string, Error, Firebase error) into a readable message
export const toMessage = (error: unknown): string => {
  if (typeof error === "string") return error;

  const code = (error as { code?: string })?.code;
  if (code && authErrorMessages[code]) return authErrorMessages[code];

  if (error instanceof Error) return error.message.replace(/^Firebase: /, "");
  return "Something went wrong. Please try again.";
};

const authErrorMessages: Record<string, string> = {
  "auth/invalid-credential": "That email and password don't match. Check them and try again.",
  "auth/wrong-password": "That email and password don't match. Check them and try again.",
  "auth/user-not-found": "There's no account with that email.",
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/email-already-in-use": "An account with that email already exists. Try logging in.",
  "auth/weak-password": "Choose a stronger password of at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a moment, then try again.",
  "auth/network-request-failed": "Couldn't reach the server. Check your connection and try again.",
  "PERMISSION_DENIED": "You don't have access to this.",
  // the same refusal, as the native SDKs (the mobile app) report it
  "database/permission-denied": "You don't have access to this.",
};
