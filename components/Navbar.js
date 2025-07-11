import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user } = useAuth(); // We only need the user object.
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // This useEffect ensures the component only renders on the client
  // after the initial server render, preventing hydration mismatch.
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

  // This function contains the buttons to avoid rendering issues
  const renderAuthControls = () => {
    if (!isClient) {
      // On the server and during initial render, show a placeholder
      return <div className="nav-placeholder"></div>;
    }

    if (user) {
      // If user exists, show profile
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
      // If no user, show login buttons
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
          {renderAuthControls()}
        </ul>
      </div>
    </nav>
  );
}