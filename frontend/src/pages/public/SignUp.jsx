import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import Logo from '../../assets/MediMeet-Logo.png';

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'patient', phone: '', specialization: '', qualification: '', consultationFee: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const userData = { ...form, phone: form.phone ? `+880${form.phone}` : '' };
      const user = await register(userData);
      toast.success(`Welcome, ${user.name}!`);
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1 style={{ color: 'white', marginBottom: '16px' }}>Join<br /><span style={{ color: 'var(--accent-dim)' }}>MediMeet</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', lineHeight: '1.7' }}>
            Create your account and start your journey towards better healthcare management.
          </p>
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
          <h2>Create Account</h2>
          <p style={{ marginBottom: '24px' }}>Fill in your details to get started</p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="name" className="input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Phone</label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+880</span>
                  <input type="tel" name="phone" className="input" placeholder="1XXX-XXXXXX" value={form.phone} onChange={handleChange} style={{ border: 'none', borderRadius: 0, flex: 1 }} />
                </div>
              </div>
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" className="input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="grid grid-2">
              <div className="input-group">
                <label>Password</label>
                <input type="password" name="password" className="input" placeholder="••••••••" value={form.password} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" className="input" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
            Already have an account? <Link to="/signin" state={location.state} style={{ fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
