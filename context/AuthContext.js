import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config'; // Make sure this path is correct

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function listens for any changes in Firebase's login state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If a user is returned, we set them in our state.
      // If not, we set the state to null.
      setUser(user);
      setLoading(false);
    });

    // This cleans up the listener when the component unmounts
    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
  };

  // We wait until the loading is false before showing the app
  // This prevents the "Login" button from flashing briefly on page load
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}