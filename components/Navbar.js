import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, loading } = useAuth();

  // THE ULTIMATE TEST: This hook ONLY runs when the 'user' object itself changes.
  useEffect(() => {
    console.log("!!! NAVBAR useEffect has DETECTED a CHANGE in the user object !!!");
    console.log("!!! The new user is:", user);
  }, [user]); // The [user] part is the key. It makes this a "listener".

  // While the auth state is loading, we render nothing to avoid conflicts.
  if (loading) {
    return (
      <nav className="navbar">
        <div className="container">
          <p>Loading User...</p>
        </div>
      </nav>
    );
  }

  // This is the "Bare Metal" render. No complex components.
  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eee', padding: '1rem' }}>
        <div className="logo-area">
          <Link href="/">SkillForge Logo Area</Link>
        </div>

        <div className="auth-status-area" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          {user ? (
            <div style={{ color: 'green' }}>
              LOGGED IN as: {user.email}
            </div>
          ) : (
            <div style={{ color: 'red' }}>
              NOT LOGGED IN
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}