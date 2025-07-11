import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user, loading } = useAuth(); // We get the user and the loading state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" passHref>
          <div className="logo" style={{cursor: 'pointer'}}>
            <Image src="/logo.png" alt="SkillForge Logo" width={160} height={40} priority />
          </div>
        </Link>
        
        <ul className="nav-links">
          <li><Link href="/#features">Why SkillForge?</Link></li>
          <li><Link href="/#projects">Projects</Link></li>
          
          {/* 
            This is the key logic. We wait for the loading to finish.
            Once loading is false, we check if a user object exists.
          */}
          {!loading && ( // Render content only when the auth check is complete
            user ? (
              // If user exists, show profile icon and menu
              <li className="profile-menu">
                <div onClick={() => setDropdownOpen(!dropdownOpen)} className="profile-icon">
                  <i className="fas fa-user-circle"></i>
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      Signed in as<br />
                      <strong>{user.email}</strong>
                    </div>
                    <Link href="/profile" passHref><div className="dropdown-item" onClick={() => setDropdownOpen(false)}>My Dashboard</div></Link>
                    <div className="dropdown-item" onClick={handleLogout}>Logout</div>
                  </div>
                )}
              </li>
            ) : (
              // If no user exists, show login/signup buttons
              <>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/signup" passHref><div className="btn btn-primary">Sign Up</div></Link></li>
              </>
            )
          )}
        </ul>
      </div>
    </nav>
  );
}