import React, { createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "career-roadmap-66ef0.firebaseapp.com",
  projectId: "career-roadmap-66ef0",
  storageBucket: "career-roadmap-66ef0.appspot.com",
  messagingSenderId: "560136936983",
  appId: "1:560136936983:web:10825db0b4b423b7634652",
  measurementId: "G-FD7DGQ3KCG",
  databaseURL: "https://career-roadmap-66ef0-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const FirebaseContext = createContext();

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  const signUpWithEmail = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const signInWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  return (
    <FirebaseContext.Provider
      value={{ auth, signUpWithEmail, signInWithEmail, signInWithGoogle }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
