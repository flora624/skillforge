import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start in a loading state

  useEffect(() => {
    // This function will be called by Firebase when the auth state is determined
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // If there's a user, set the user object
      } else {
        setUser(null); // If not, explicitly set it to null
      }
      setLoading(false); // Authentication check is complete, no longer loading
    });

    // Cleanup subscription on unmount to prevent memory leaks
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading, // We will use this in other components
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}