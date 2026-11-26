import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, connectAuthEmulator, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";

// gitignored, like web-new's: copy web-new/src/firebase/config.tsx and keys.tsx here as .ts
import { firebaseConfig } from "./config";

// A development build talks to web-new's local emulators, so trying the app
// never reads or writes writers' data; EXPO_PUBLIC_FIREBASE=live points one at
// the real project on purpose, and a production build always uses it. The
// emulators are found on the host serving the bundle (this Mac, as the phone
// sees it), so start them with web-new's npm run emulators:lan, which binds
// them to that LAN address. The ports match web-new/firebase.json
export const usesEmulators = __DEV__ && process.env.EXPO_PUBLIC_FIREBASE !== "live";
const emulatorHost = Constants.expoConfig?.hostUri?.split(":")[0] ?? "127.0.0.1";

// a Fast Refresh re-runs this module; the app and auth are made only once
const first = getApps().length === 0;
const app = first ? initializeApp(firebaseConfig) : getApp();

// the session is kept on the device, so the writer stays signed in between launches
let auth: Auth;
if (first) {
  auth = initializeAuth(app, {persistence: getReactNativePersistence(AsyncStorage)});
} else {
  auth = getAuth(app);
}
const rtdb = getDatabase(app);

if (first && usesEmulators) {
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, {disableWarnings: true});
  connectDatabaseEmulator(rtdb, emulatorHost, 9000);
}

export { app, auth, rtdb };
