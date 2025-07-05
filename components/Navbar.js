import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

// The Main Navbar
export default function Navbar() {
  const { isLoggedIn, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // After logout, you might want to redirect the user to the homepage
      // This requires the useRouter hook, but for now, it just logs out.
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* The Logo */}
        <Link href="/" className="logo">
          <Image src="/logo.png" alt="SkillForge Logo" width={160} height={40} priority />
        </Link>
        
        {/* The Main Navigation Links */}
        <ul className="nav-links">
          <li><Link href="/#features">Why SkillForge?</Link></li>
          <li><Link href="/#projects">Projects</Link></li>
          
          {/* This logic now shows a direct link to the profile page */}
          {isClient && !loading && (
            isLoggedIn ? (
              <>
                <li><Link href="/profile" className="profile-icon-link"><i className="fas fa-user-circle"></i></Link></li>
                <li><a onClick={handleLogout} className="logout-button">Logout</a></li>
              </>
            ) : (
              <>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/signup" className="btn btn-primary">Sign Up</Link></li>
              </>
            )
          )}
        </ul>
      </div>
    </nav>
  );
}