import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="logo">SkillForge</Link>
        <ul className="nav-links">
          <li><Link href="/#features">Why SkillForge?</Link></li>
          <li><Link href="/#projects">Projects</Link></li>
          {user ? (
            <>
              <li><a onClick={handleLogout}>Logout</a></li>
            </>
          ) : (
            <>
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/signup" className="btn btn-primary">Sign Up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}