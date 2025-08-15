
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For more information on how to get this object, see the link below:
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  "projectId": "shopsphere-bsdmb",
  "appId": "1:938269739088:web:7ca2c111c75896e8246955",
  "storageBucket": "shopsphere-bsdmb.appspot.com",
  "apiKey": "AIzaSyBknQPeIJCiMW-6pLGpWi8S7R4qKJ_P87c",
  "authDomain": "shopsphere-bsdmb.firebaseapp.com",
  "messagingSenderId": "938269739088",
  "measurementId": "G-5B9T3F5C0G"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics if it is supported
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
