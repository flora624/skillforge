import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // NEW boolean flag
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoggedIn(!!user); // If user exists, this becomes true. If null, becomes false.
      setLoading(false);
      console.log("Auth State Changed. User Logged In:", !!user); // Debugging line
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  const value = {
    user,
    isLoggedIn, // Pass the new flag
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}