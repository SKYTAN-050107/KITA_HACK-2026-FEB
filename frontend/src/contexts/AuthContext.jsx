// src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import API_URL from '../config/api';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Try to exchange token with backend (best-effort — app works without backend)
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch(`${API_URL}/api/v1/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.jwt) {
              localStorage.setItem('jwt', data.jwt);
            }
          }
        } catch {
          // Backend JWT exchange is optional — app still works via Firebase Auth
        }
      } else {
        setUser(null);
        localStorage.removeItem('jwt');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  const clearError = () => setError(null);

  // ── Email/Password Login ──
  const loginWithEmail = async (email, password) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (e) {
      setError(mapFirebaseError(e));
      throw e;
    }
  };

  // ── Email/Password Signup ──
  const signupWithEmail = async (email, password, displayName) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name on Firebase auth profile
      await updateProfile(result.user, { displayName });

      // Create Firestore user document
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName,
        avatarUrl: null,
        totalScans: 0,
        impactKg: 0,
        co2Saved: 0,
        points: 0,
        streak: 0,
        lastCheckIn: null,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      });

      return result.user;
    } catch (e) {
      setError(mapFirebaseError(e));
      throw e;
    }
  };

  // ── Google OAuth Popup ──
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Upsert Firestore user document (may already exist from previous login)
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName || 'User',
          avatarUrl: result.user.photoURL || null,
          totalScans: 0,
          impactKg: 0,
          co2Saved: 0,
          points: 0,
          streak: 0,
          lastCheckIn: null,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        });
      }
      return result.user;
    } catch (e) {
      setError(mapFirebaseError(e));
      throw e;
    }
  };

  // ── Forgot Password ──
  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      setError(mapFirebaseError(e));
      throw e;
    }
  };

  // ── Logout ──
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      localStorage.removeItem('jwt');
    } catch (e) {
      setError(mapFirebaseError(e));
      throw e;
    }
  };

  const value = {
    user,
    loading,
    error,
    clearError,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Map Firebase error codes to user-friendly messages
function mapFirebaseError(error) {
  const code = error?.code || '';
  const map = {
    'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };
  return map[code] || error?.message || 'An unexpected error occurred.';
}

export default AuthContext;
