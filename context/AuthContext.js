import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

// 1. Create the context
const AuthContext = createContext();

// 2. Create a custom hook to easily use the context
export function useAuth() {
  return useContext(AuthContext);
}

// 3. Create the Provider component that will wrap our app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // This useEffect hook listens to Firebase for any authentication changes
  useEffect(() => {
    // onAuthStateChanged returns an 'unsubscribe' function.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // When the state changes, we update our user state.
      // This will be the user object if logged in, or null if logged out.
      setUser(currentUser);
    });

    // When the component unmounts, we clean up the listener.
    return () => unsubscribe();
  }, []); // The empty array means this effect runs only once.

  // The value provided to all children components
  const value = {
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}