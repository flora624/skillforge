import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import SignInWithGoogle from '../components/SignInWithGoogle';
import { auth } from '../firebase/config';
import Navbar from '../components/Navbar'; // <-- IMPORT NAVBAR

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    if(password.length < 6) {
        setError("Password should be at least 6 characters long.");
        return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <> {/* Use a fragment to wrap multiple elements */}
      <Navbar /> {/* <-- ADD THE NAVBAR */}
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-box">
            <h2>Join SkillForge</h2>
            <p>Start building your professional portfolio today.</p>
            <form onSubmit={handleSignUp}>
              {/* ... form content ... */}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="At least 6 characters" />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="btn btn-primary btn-block">Create Account</button>
            </form>

            <SignInWithGoogle />
            
            <p className="auth-switch">Already have an account? <Link href="/login">Log In</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}