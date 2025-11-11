import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";


const firebaseConfig = {
  "projectId": "studio-6425661311-2fde1",
  "appId": "1:871495992328:web:bcf5a1174c908254497dbd",
  "apiKey": "AIzaSyDX7-5iDrxRx3b0xQWY9Fctrq9cf6MRx2w",
  "authDomain": "studio-6425661311-2fde1.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "871495992328"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

if (typeof window !== "undefined") {
    // App Check is not configured for this project.
    // if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY) {
    //     initializeAppCheck(app, {
    //         provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY),
    //         isTokenAutoRefreshEnabled: true
    //     });
    // } else {
    //     console.warn("Firebase App Check is not configured. Set NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY.");
    // }
}


export { app, auth };
