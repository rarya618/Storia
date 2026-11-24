// import SDKs
import {initializeApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getDatabase } from "firebase/database";


// import keys
import { APISiteKey } from "./keys";
import { webDevelopmentConfig, webProductionConfig } from "./config";

const isTesting = true; // set testing environment status

// configure app
const firebaseConfig = isTesting ? webDevelopmentConfig : webProductionConfig;

const app = initializeApp(firebaseConfig); // initialize Firebase

// initialize App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(APISiteKey),
  isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app); // initialise Authentication
const db = getFirestore(app); // initialize Firestore
const rtdb = getDatabase(app); // initalise Realtime Database
// initialize Analytics lazily so a blocked analytics request can't take the app down
import("firebase/analytics")
  .then(async ({ getAnalytics, isSupported }) => {
    if (await isSupported()) getAnalytics(app);
  })
  .catch(() => console.warn("Analytics unavailable"));

export {
  app, db, rtdb, auth, appCheck
}