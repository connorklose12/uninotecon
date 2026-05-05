// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAe57gUnijkwiznHmbHcQcGn7DMiShssdQ",
  authDomain: "uninoteswap.firebaseapp.com",
  projectId: "uninoteswap",
  storageBucket: "uninoteswap.firebasestorage.app",
  messagingSenderId: "689680315806",
  appId: "1:689680315806:web:c4c3cf8a9d44be8233d28f",
  measurementId: "G-62T3PEEDKH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

if (typeof window !== 'undefined') {
getAnalytics(app);
}