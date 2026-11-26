import Constants from "expo-constants";
import { getApp } from "@react-native-firebase/app";
import { initializeAppCheck, ReactNativeFirebaseAppCheckProvider } from "@react-native-firebase/app-check";
import { connectAuthEmulator, getAuth } from "@react-native-firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "@react-native-firebase/database";

// Firebase through its native SDKs (React Native Firebase), configured from
// GoogleService-Info.plist and google-services.json in mobile/ (gitignored;
// download them from the script-writer-studio project's settings). The native
// SDKs keep the session on the device themselves.
const app = getApp();

// App Check proves each request comes from this app on a real device: App
// Attest on iOS, Play Integrity on Android. A development build has no
// attestation, so it uses the debug provider, whose token has to be registered
// under App Check › Apps › Manage debug tokens before it reaches the real
// project; set it as EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN, or copy the one the
// build logs. Set up before any other call, so the first request carries a token
const provider = new ReactNativeFirebaseAppCheckProvider();
// read only in a development build, so a release built with it set never carries it
const debugToken = __DEV__ ? process.env.EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN || undefined : undefined;
provider.configure({
  apple: {provider: __DEV__ ? "debug" : "appAttestWithDeviceCheckFallback", debugToken},
  android: {provider: __DEV__ ? "debug" : "playIntegrity", debugToken},
});
initializeAppCheck(app, {provider, isTokenAutoRefreshEnabled: true});

// A development build talks to web-new's local emulators, so trying the app
// never reads or writes writers' data; EXPO_PUBLIC_FIREBASE=live points one at
// the real project on purpose, and a production build always uses it. The
// emulators are found on the host serving the bundle (this Mac, as the phone
// sees it), so start them with web-new's npm run emulators:lan, which binds
// them to that LAN address. The ports match web-new/firebase.json
export const usesEmulators = __DEV__ && process.env.EXPO_PUBLIC_FIREBASE !== "live";
const emulatorHost = Constants.expoConfig?.hostUri?.split(":")[0] ?? "127.0.0.1";

const auth = getAuth(app);
const rtdb = getDatabase(app);

if (usesEmulators) {
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`);
  connectDatabaseEmulator(rtdb, emulatorHost, 9000);
}

export { app, auth, rtdb };
