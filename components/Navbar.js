import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user } = useAuth(); // This hook gets the user state
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
        <Link href="/" className="logo">
          <Image src="/logo.png" alt="SkillForge Logo" width={160} height={40} />
        </Link>
        
        <ul className="nav-links">
          <li><Link href="/#features">Why SkillForge?</Link></li>
          <li><Link href="/explore">Explore</Link></li> {/* Changed from #projects to the explore page */}
          
          {/* This is the logic that decides what to show */}
          {user ? (
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
                  <Link href="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    My Dashboard
                  </Link>
                  <div className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </li>
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