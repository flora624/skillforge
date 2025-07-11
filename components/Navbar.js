import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user } = useAuth(); // Get the user from our simplified context
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // THIS IS THE KEY: A state to track if we are on the client-side
  const [isClient, setIsClient] = useState(false);

  // This effect runs ONLY on the client, after the initial server render
  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const renderAuthControls = () => {
    // If we are on the server or during the initial hydration, render nothing.
    // This prevents the "flash" and the mismatch error.
    if (!isClient) {
      return <div className="nav-placeholder"></div>;
    }

    // Once we are on the client, we can safely check the user state.
    if (user) {
      // User is logged in, show the profile icon
      return (
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
      );
    } else {
      // User is not logged in, show the buttons
      return (
        <>
          <li><Link href="/login">Login</Link></li>
          <li><Link href="/signup" passHref><div className="btn btn-primary">Sign Up</div></Link></li>
        </>
      );
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
          {/* We call our safe render function here */}
          {renderAuthControls()}
        </ul>
      </div>
    </nav>
  );
}