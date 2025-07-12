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
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* The Logo */}
        <Link href="/" className="logo">
          <div style={{ width: '80px', height: '80px', position: 'relative' }}>
  <Image
    src="/logo.png"
    alt="SkillFroge Logo"
    fill
    priority
    style={{ objectFit: 'contain' }}
  />
</div>
        </Link>
        
        {/* The Main Navigation Links */}
        <ul className="nav-links">
          <li><Link href="/#features" className="btn-text">Why SkillForge?</Link></li>
<li><Link href="/explore" className="btn-text">Explore</Link></li>
{loading ? null : user ? (
  <li className="profile-menu">
    <div onClick={() => setDropdownOpen(!dropdownOpen)} className="profile-icon"><i className="fas fa-user-circle"></i></div>
    {dropdownOpen && (
      <div className="dropdown-menu">
        <div className="dropdown-header">Signed in as<br /><strong>{user.email}</strong></div>
        <Link href="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>My Dashboard</Link>
        {/* ADD A CLASSNAME TO THIS DIV */}
        <div className="dropdown-item logout-btn" onClick={handleLogout}>Logout</div>
      </div>
    )}
  </li>
) : (
  <>
    {/* ADD A CLASSNAME TO THIS LINK */}
    <li><Link href="/login" className="btn-text">Login</Link></li>
    <li><Link href="/signup" className="btn btn-primary">Sign Up</Link></li>
  </>
)}
        </ul>
      </div>
    </nav>
  );
}