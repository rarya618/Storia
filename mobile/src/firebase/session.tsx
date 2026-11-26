import { createContext, ReactNode, use, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./main";

// the signed-in writer: undefined until Firebase has read the saved session,
// then the user, or null when signed out
const Session = createContext<User | null | undefined>(undefined);

export function SessionProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return <Session value={user}>{children}</Session>;
}

export const useSession = () => use(Session);

// the signed-in writer, on a screen only reachable signed in
export const useUser = () => {
  const user = use(Session);
  if (!user) throw new Error("useUser outside a signed-in screen");
  return user;
};
