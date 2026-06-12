/**
 * ============================================================
 * Navbar Component — Top Navigation Bar
 * ============================================================
 * Renders the top navigation bar with:
 *  - Brand logo and name (links to home)
 *  - Navigation links (Home, Doctors, Articles, About, Contact)
 *  - User profile badge with avatar (when authenticated)
 *  - Create Account button (when not authenticated)
 *  - Mobile hamburger menu toggle
 *  - Scroll-based styling (adds 'navbar--scrolled' class)
 * ============================================================
 */

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineMenu, HiX, HiOutlineLogout } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import Logo from '../../assets/MediMeet-Logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);    // Mobile menu toggle state
  const [scrolled, setScrolled] = useState(false);        // Scroll detection for styling

  // Add scroll listener to apply visual changes when scrolled past 20px
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /** Handles logout and redirects to the home page */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  /** Returns the dashboard path based on the user's role */
  const getDashboardPath = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={Logo} alt="MediMeet Logo" style={{ height: '32px', width: 'auto' }} />
          <span className="brand-text-gradient" style={{ fontSize: '24px' }}>MediMeet</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/find-doctor">Doctors</NavLink>
          <NavLink to="/blog">Medical Articles</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>

        {/* Action Buttons (Login/Profile + Mobile Menu) */}
        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user-section">
              {/* Profile badge linking to user's dashboard */}
              <Link to={getDashboardPath()} className="nav-profile-badge">
                <div className="nav-profile-avatar">
                  {user.avatar ? <img src={user.avatar} alt="" /> : user.name.charAt(0)}
                </div>
                <div className="nav-profile-info">
                  <span className="nav-profile-name">{user.name}</span>
                  <span className="nav-profile-role">{user.role}</span>
                </div>
              </Link>
              {/* Logout button */}
              <button onClick={handleLogout} className="nav-logout-btn" title="Logout">
                <HiOutlineLogout />
              </button>
            </div>
          ) : (
            <>
              <Link to="/signup" className="btn btn-sm btn-primary">Create Account</Link>
            </>
          )}
          {/* Mobile hamburger menu toggle */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <HiX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
