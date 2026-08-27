// ============================================================
// Firebase project configuration
// Get these values from: Firebase Console → Project Settings →
// "Your apps" → Web app → SDK setup and configuration
// ============================================================
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_lzf6oR3Jcovw8tkneT3gcO5sHSjazF8",
  authDomain: "lifelink-912df.firebaseapp.com",
  projectId: "lifelink-912df",
  storageBucket: "lifelink-912df.firebasestorage.app",
  messagingSenderId: "486589816922",
  appId: "1:486589816922:web:d9dccb30e621ad5a313863"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Region your Cloud Functions are deployed to (must match functions/index.js)
export const FUNCTIONS_REGION = "us-central1";
