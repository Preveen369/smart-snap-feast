// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCid55N6fur6rFzzBR2yz7kbOVZ8MI2dpo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smart-snap-feast.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smart-snap-feast",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smart-snap-feast.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1061597517859",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1061597517859:web:9455ea1f1f21d6bf523996",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BV6DP2SQMC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Export firebaseConfig for reference
export { firebaseConfig };
