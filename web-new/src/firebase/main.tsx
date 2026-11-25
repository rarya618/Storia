// import SDKs
import {initializeApp} from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { AppCheck, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";


// import keys
import { APISiteKey } from "./keys";
import { firebaseConfig } from "./config";

// A dev build (npm run dev) talks to the local emulators (npm run emulators),
// so development never reads or writes writers' data. npm run dev:live points a
// dev build at the real project on purpose; a production build always does.
// The ports match firebase.json. npm run dev:lan finds them on this machine's
// LAN address instead (vite.config.ts), so a phone on the network reaches them
const usesEmulators = import.meta.env.DEV && import.meta.env.VITE_FIREBASE !== "live";

const app = initializeApp(firebaseConfig); // initialize Firebase

// initialize App Check; the emulators don't check it
let appCheck: AppCheck | undefined;
if (!usesEmulators) {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(APISiteKey),
    isTokenAutoRefreshEnabled: true
  });
}

const auth = getAuth(app); // initialise Authentication
const db = getFirestore(app); // initialize Firestore
const rtdb = getDatabase(app); // initalise Realtime Database

if (usesEmulators) {
  // without the emulator's own banner, which sits over the rail's account row
  connectAuthEmulator(auth, `http://${__EMULATOR_HOST__}:9099`, {disableWarnings: true});
  connectFirestoreEmulator(db, __EMULATOR_HOST__, 8080);
  connectDatabaseEmulator(rtdb, __EMULATOR_HOST__, 9000);
}

// initialize Analytics lazily so a blocked analytics request can't take the app down
if (!usesEmulators) import("firebase/analytics")
  .then(async ({ getAnalytics, isSupported }) => {
    if (await isSupported()) getAnalytics(app);
  })
  .catch(() => console.warn("Analytics unavailable"));

export {
  app, db, rtdb, auth, appCheck, usesEmulators
}