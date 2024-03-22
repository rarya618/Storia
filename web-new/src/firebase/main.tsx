// import SDKs
import {initializeApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAnalytics } from "firebase/analytics";

// import keys
import { APISiteKey } from "./keys";
import { electronTestConfig, webDevelopmentConfig, webProductionConfig } from "./config";

const isTesting = true; // set testing environment status

const isElectronApp = false; // set Electron app status

// configure app
const devConfig = isElectronApp ? electronTestConfig : webDevelopmentConfig;
const prodConfig = isElectronApp ? electronTestConfig : webProductionConfig;

const firebaseConfig = isTesting ? devConfig : prodConfig;

const app = initializeApp(firebaseConfig); // initialize Firebase

// initialize App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(APISiteKey),
  isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app); // initialise Authentication
const db = getFirestore(app); // initialize Database
const analytics = getAnalytics(app); // initialize Analytics

export {
  app, analytics, db, auth, appCheck
}