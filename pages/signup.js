import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import SignInWithGoogle from '../components/SignInWithGoogle';
import Navbar from '../components/Navbar';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const { signup, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }
    try {
      await signup(email, password);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };
  
  // --- Re-using the same style objects for consistency ---
  const styles = {
    pageWrapper: { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
    authContainer: { background: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '450px', border: '1px solid #e5e7eb' },
    header: { textAlign: 'center' },
    h2: { fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', margin: 0 },
    p: { color: '#6b7280', marginBottom: '3px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formGroup: { textAlign: 'left' },
    label: { display: 'block', fontWeight: '950', color: '#374151', marginBottom: '6px', fontSize: '0.875rem' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', transition: 'border-color 0.2s, box-shadow 0.2s' },
    button: { background: '#3b82f6', color: 'white', fontWeight: '600', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s' },
    errorMessage: { color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' },
    separator: { display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', margin: '1px' },
    separatorLine: { flex: 1, height: '1px', background: '#e5e7eb' },
    authSwitch: { marginTop: '24px', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' },
    authLink: { color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }
  };

  return (
    <>
      <Navbar />
      <div style={styles.pageWrapper}>
        <div style={styles.authContainer}>
          <div style={styles.header}>
            <h2 style={styles.h2}>Join SkillForge</h2>
            <p style={styles.p}>Start building your professional portfolio today.</p>
          </div>
          
          <form onSubmit={handleSignUp} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="At least 6 characters" style={styles.input} />
            </div>
            {error && <p style={styles.errorMessage}>{error}</p>}
            <button type="submit" style={styles.button}>Create Account</button>
          </form>

          <div style={styles.separator}>
            <div style={styles.separatorLine}></div>
            <span>OR</span>
            <div style={styles.separatorLine}></div>
          </div>
          
          <SignInWithGoogle />
          
          <p style={styles.authSwitch}>
            Already have an account? <Link href="/login"><a style={styles.authLink}>Log In</a></Link>
          </p>
        </div>
      </div>
    </>
  );
}