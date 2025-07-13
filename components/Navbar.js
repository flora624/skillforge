import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; 
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

// The Main Navbar
export default function Navbar() {
  const { isLoggedIn, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navbarHidden, setNavbarHidden] = useState(false);
  const lastScrollY = useRef(0);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

    useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 10;
      setScrolled(isScrolled);
      if (currentScrollY <= 10) {
        setNavbarHidden(false); // Show navbar only at the very top
      } else {
        setNavbarHidden(true); // Hide navbar when not at the top
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <>
      <header className={`navbar${scrolled ? ' scrolled' : ''}${navbarHidden ? ' navbar--hidden' : ''}`}>
        <Link href="/" className="logo">
          <div>
            <Image
              src="/logo.png"
              alt="SkillForge Logo"
              width={80}
              height={80}
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        </Link>
        <nav>
          <ul className="nav__actions">
            <li><Link href="/why">Why SkillForge</Link></li>
            <li><Link href="/projects">Projects</Link></li>
          </ul>
          <ul className="nav__links">
            {isClient && !loading && (
              isLoggedIn ? (
                <>
                  <li>
                    <Link href="/profile" className="profile-icon-link">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="profile-svg-icon"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </li>
                  <li><a onClick={handleLogout} className="cta">Logout</a></li>
                </>
              ) : (
                <>
                  <li><Link href="/login" className="cta">Login</Link></li>
                  <li><Link href="/signup" className="cta">Signup</Link></li>
                </>
              )
            )}
          </ul>
        </nav>
      </header>
    </>
  );
}