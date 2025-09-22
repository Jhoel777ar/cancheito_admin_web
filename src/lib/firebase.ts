// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCde7G-kTXV1LIwceda-ODi8aYT0qzBpc",
  authDomain: "cancheito-75c44.firebaseapp.com",
  databaseURL: "https://cancheito-75c44-default-rtdb.firebaseio.com",
  projectId: "cancheito-75c44",
  storageBucket: "cancheito-75c44.firebasestorage.app",
  messagingSenderId: "451600479024",
  appId: "1:451600479024:web:1da9cc69c2737eb227cef5",
  measurementId: "G-NXTTES1DRS"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
