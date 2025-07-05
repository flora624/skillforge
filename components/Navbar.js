import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

// This is a more robust way to handle the dropdown menu
const ProfileMenu = () => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Used to detect clicks outside the dropdown

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // This effect handles closing the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  if (!user) return null;

  return (
    <li className="profile-menu" ref={dropdownRef}>
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
  );
};


// The Main Navbar
export default function Navbar() {
  const { isLoggedIn, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="navbar">
      <div className="container">
        {/* We use a simple Link tag now for the logo */}
        <Link href="/" className="logo">
          <Image src="/logo.png" alt="SkillForge Logo" width={160} height={40} priority />
        </Link>
        
        <ul className="nav-links">
          <li><Link href="/#features">Why SkillForge?</Link></li>
          <li><Link href="/#projects">Projects</Link></li>
          
          {/* We keep the robust client-side rendering logic */}
          {isClient && !loading && (
            isLoggedIn ? <ProfileMenu /> : (
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