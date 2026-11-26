// Storia is in a closed beta: only emails on the invite list, at
// invites/{key} in the Realtime Database, can read or write anything (see
// web/database.rules.json). A key can't hold ".", so an email's dots become
// commas; the rules make the same key from the signed-in email, so keep the
// two in step.
export const inviteKey = (email: string) => email.trim().toLowerCase().replaceAll(".", ",");

// the refusal both apps show when an email isn't on the list
export const NOT_INVITED = "Storia is in a closed beta, and this email isn’t on the invite list yet.";
