import { useState, useEffect } from 'react'; // Import useEffect
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

// A new sub-component for the user's menu
const ProfileMenu = () => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (!user) return null; // Should not happen with the new logic, but safe

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

// The main Navbar component
export default function Navbar() {
  const { isLoggedIn, loading } = useAuth(); // Use our NEW isLoggedIn flag and loading state
  const [isClient, setIsClient] = useState(false); // New state to track client-side mount

  // This effect runs ONLY on the client, after the component first renders
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="logo" legacyBehavior>
          <a>
            <Image src="/logo.png" alt="SkillForge Logo" width={160} height={40} />
          </a>
        </Link>
        
        <ul className="nav-links">
          <li><Link href="/#features">Why SkillForge?</Link></li>
          <li><Link href="/#projects">Projects</Link></li>
          
          {/* This is the new, definitive logic */}
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