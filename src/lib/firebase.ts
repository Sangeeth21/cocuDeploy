
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "shopsphere-bsdmb",
  "appId": "1:938269739088:web:7ca2c111c75896e8246955",
  "storageBucket": "shopsphere-bsdmb.firebasestorage.app",
  "apiKey": "AIzaSyBknQPeIJCiMW-6pLGpWi8S7R4qKJ_P87c",
  "authDomain": "shopsphere-bsdmb.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "938269739088"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics if it is supported
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, analytics };
