import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import SignInWithGoogle from '../components/SignInWithGoogle';
import { auth } from '../firebase/config';
import Navbar from '../components/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) { // <-- THIS IS THE CORRECTED LINE
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-box">
            <h2>Welcome Back!</h2>
            <p>Log in to track your projects and build your portfolio.</p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="btn btn-primary btn-block">Login</button>
            </form>

            <SignInWithGoogle />
            
            <p className="auth-switch">Don't have an account? <Link href="/signup">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}