import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

// Enhanced Navbar with EduPlatform styling
export default function EnhancedNavbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const { user, isLoggedIn, loading } = useAuth();

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [user, isLoggedIn, loading]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false); // Close dropdown on logout
      closeMobileMenu(); // Close mobile menu if open
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close dropdown if clicked outside
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <Link href="/">
            <a className="navbar-logo">
              <div className="logo-content">
                <div className="logo-icon">
                  <i className=""></i>
                </div>
                <Image src="/logo.png" alt="logo icon" width={60} height={60}  />
              </div>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="navbar-nav desktop-nav">
            <ul className="nav-links">
              <li>
                <Link href="/explore">
                  <a className={`nav-link ${router.pathname === '/projects' ? 'active' : ''}`}>
                    <i className="fas fa-project-diagram"></i>
                    Projects
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/community">
                  <a className={`nav-link ${router.pathname === '/community' ? 'active' : ''}`}>
                    <i className="fas fa-handshake"></i>
                    Community
                  </a>
                </Link>
              </li>
               <li>
                <Link href="/blog">
                  <a className={`nav-link ${router.pathname === '/blog' ? 'active' : ''}`}>
                    <i className="fas fa-blog"></i>
                    Blog
                  </a>
                </Link>
              </li>
            </ul>

            <div className="nav-actions">
              {!loading && (isLoggedIn ? (
                <div className="profile-dropdown" ref={dropdownRef}>
                  <Link href="/profile" passHref>
                    <a className="profile-icon-btn" style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}>
                      {user?.photoURL ? (
                        <Image src={user.photoURL} alt="Profile" width={40} height={40} className="rounded-full" style={{ borderRadius: '50%' }} />
                      ) : (
                        <i className="fas fa-user-circle fa-2x"></i>
                      )}
                    </a>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <a className="btn btn-outline btn-small">
                      Login
                    </a>
                  </Link>
                  <Link href="/signup">
                    <a className="btn btn-primary btn-small">
                      <i className="fas fa-rocket"></i>
                      Start Building
                    </a>
                  </Link>
                </>
              ))}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="mobile-nav-links">
            {/* FIX: onClick is moved to the <a> tag */}
            <li>
              <Link href="/projects">
                <a className="mobile-nav-link" onClick={closeMobileMenu}>
                  <i className="fas fa-project-diagram"></i>
                  Projects
                </a>
              </Link>
            </li>
            <li>
              <Link href="/blog">
                <a className="mobile-nav-link" onClick={closeMobileMenu}>
                  <i className="fas fa-blog"></i>
                  Blog
                </a>
              </Link>
            </li>
            <li className="mobile-nav-divider"></li>
            {!loading && (isLoggedIn ? (
              // In mobile, just show links directly or a simplified menu
              <>
                <li>
                  <Link href="/profile">
                    <a className="mobile-nav-link" onClick={closeMobileMenu}>
                      <i className="fas fa-user"></i> Profile
                    </a>
                  </Link>
                </li>
                <li>
                  {/* FIX: Logout is a button that handles its own click */}
                  <button onClick={handleLogout} className="mobile-nav-link logout-button">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login">
                    <a className="mobile-nav-link" onClick={closeMobileMenu}>
                      <i className="fas fa-sign-in-alt"></i> Login
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/signup">
                    <a className="mobile-nav-link primary" onClick={closeMobileMenu}>
                      <i className="fas fa-rocket"></i> Start Building
                    </a>
                  </Link>
                </li>
              </>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
        )}
      </header>
    </>
  );
}