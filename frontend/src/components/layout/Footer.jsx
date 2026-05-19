/**
 * ============================================================
 * Footer Component — Site-wide Footer
 * ============================================================
 * Renders the footer with four columns:
 *  1. Brand info and tagline
 *  2. Quick Links (Find Doctor, Articles, About, Contact)
 *  3. Patient Links (Account, Appointments, Records, Billing)
 *  4. Support Links (Help, Privacy, Terms, Email)
 * 
 * Also includes a copyright notice and country attribution.
 * ============================================================
 */

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand & Description */}
          <div>
            <Link to="/" className="navbar-brand" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img src="/src/assets/MediMeet-Logo.png" alt="MediMeet Logo" style={{ height: '32px', width: 'auto' }} />
              <span className="brand-text-gradient" style={{ fontSize: '24px' }}>MediMeet</span>
            </Link>
            <p>Modern healthcare management platform. Book appointments, manage records, and connect with top doctors — all in one place.</p>
          </div>

          {/* Column 2: Quick Navigation Links */}
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/find-doctor">Find a Doctor</Link></li>
              <li><Link to="/blog">Medical Articles</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Patient Dashboard Links */}
          <div>
            <h4>For Patients</h4>
            <ul>
              <li><Link to="/signup">Create Account</Link></li>
              <li><Link to="/patient/appointments">My Appointments</Link></li>
              <li><Link to="/patient/records">Medical Records</Link></li>
              <li><Link to="/patient/billing">Billing</Link></li>
            </ul>
          </div>

          {/* Column 4: Support & Legal Links */}
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="mailto:support@medimeet.com">support@medimeet.com</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom — Copyright & Attribution */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MediMeet. All rights reserved.</p>
          <p>Built with care in Bangladesh 🇧🇩</p>
        </div>
      </div>
    </footer>
  );
}
