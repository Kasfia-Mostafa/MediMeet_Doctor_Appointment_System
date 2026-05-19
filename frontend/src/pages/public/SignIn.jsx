import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import Logo from '../../assets/MediMeet-Logo.png';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.from?.includes('book-appointment')) {
      toast.error('Please sign in to book an appointment', { id: 'auth-redirect' });
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1 style={{ color: 'white', marginBottom: '16px' }}>Welcome to<br /><span style={{ color: 'var(--accent-dim)' }}>MediMeet</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', lineHeight: '1.7' }}>
            Your complete healthcare companion. Access medical records, book appointments, and manage your health journey.
          </p>
          <div className="auth-features">
            <div className="auth-feature">✓ Instant appointment booking</div>
            <div className="auth-feature">✓ Secure medical records</div>
            <div className="auth-feature">✓ Family health management</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <Link to="/" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <img src={Logo} alt="MediMeet" style={{ height: '40px', width: 'auto' }} />
            <span style={{
              fontSize: '28px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px'
            }}>
              MediMeet
            </span>
          </Link>
          <h2>Sign In</h2>
          <p style={{ marginBottom: '32px' }}>Enter your credentials to access your account</p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineMail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
                <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ paddingLeft: '42px' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
                <input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingLeft: '42px' }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
            Don't have an account? <Link to="/signup" state={location.state} style={{ fontWeight: 600 }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
