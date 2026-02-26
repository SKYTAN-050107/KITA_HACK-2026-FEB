// src/config/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD5D2SefsObNHApqNvpsBEhCIIJway-2CY",
  authDomain: "kitahack-487005.firebaseapp.com",
  projectId: "kitahack-487005",
  storageBucket: "kitahack-487005.firebasestorage.app",
  messagingSenderId: "348209515944",
  appId: "1:348209515944:web:9a684d6ee500fdfb57e19d",
  measurementId: "G-GLNPKQBQ4E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
