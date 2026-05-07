import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineMenu, HiX, HiOutlineLogout } from 'react-icons/hi';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/src/assets/MediMeet-Logo.png" alt="MediMeet Logo" style={{ height: '32px', width: 'auto' }} />
          <span className="brand-text-gradient" style={{ fontSize: '24px' }}>MediMeet</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/find-doctor">Doctors</NavLink>
          <NavLink to="/blog">Medical Articles</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user-section">
              <Link to={getDashboardPath()} className="nav-profile-badge">
                <div className="nav-profile-avatar">
                  {user.avatar ? <img src={user.avatar} alt="" /> : user.name.charAt(0)}
                </div>
                <div className="nav-profile-info">
                  <span className="nav-profile-name">{user.name}</span>
                  <span className="nav-profile-role">{user.role}</span>
                </div>
              </Link>
              <button onClick={handleLogout} className="nav-logout-btn" title="Logout">
                <HiOutlineLogout />
              </button>
            </div>
          ) : (
            <>
              <Link to="/signin" className="btn btn-sm btn-secondary">Sign In</Link>
              <Link to="/signup" className="btn btn-sm btn-primary">Sign Up</Link>
            </>
          )}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <HiX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
