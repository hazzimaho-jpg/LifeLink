// ============================================================
// Firebase project configuration
// Get these values from: Firebase Console → Project Settings →
// "Your apps" → Web app → SDK setup and configuration
// ============================================================
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Region your Cloud Functions are deployed to (must match functions/index.js)
export const FUNCTIONS_REGION = "us-central1";
