import { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SessionProvider, useSession } from "@/firebase/session";

// the splash stays up until Firebase has read the saved session, so a signed-in
// writer never sees the sign-in screen flash past
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <Screens />
    </SessionProvider>
  );
}

function Screens() {
  const user = useSession();
  const known = user !== undefined;
  useEffect(() => { if (known) SplashScreen.hide(); }, [known]);
  if (!known) return null;

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Protected guard={Boolean(user)}>
        <Stack.Screen name="index" />
        <Stack.Screen name="document/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
