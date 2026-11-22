import { useEffect, useState } from "react";

export function useAuth() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    setAuthToken(sessionStorage.getItem("Auth Token"));
    let uid = sessionStorage.getItem("User ID");
    setUserId(uid ? uid : "");
  }, []);

  return { authToken, userId };
}