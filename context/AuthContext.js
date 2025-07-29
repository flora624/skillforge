// file: context/AuthContext.js

import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // When Firebase's auth state changes, this function runs.
      // It's the single source of truth for the user's status.
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  // --- NEW: Authentication functions are now part of the context ---
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  const logout = async () => {
    // We don't need to manually set user to null.
    // The onAuthStateChanged listener will do it for us when signOut is successful.
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    isLoggedIn: !!user, // This is a derived state, always in sync with 'user'
    signup, // <-- Expose the function
    login,  // <-- Expose the function
    logout, // <-- Expose the function
    loginWithGoogle // <-- Good to centralize this too
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Always render children - let individual pages handle auth requirements */}
      {children}
    </AuthContext.Provider>
  );
}