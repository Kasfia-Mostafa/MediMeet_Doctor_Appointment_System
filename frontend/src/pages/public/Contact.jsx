import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/contact', form);
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page fade-in">
      <div className="page-header" style={{ background: 'var(--surface-container-low)', padding: '64px 0', marginBottom: '48px' }}>
        <div className="container">
          <span className="label">Contact Us</span>
          <h1>Get in <span style={{ color: 'var(--primary)' }}>Touch</span></h1>
          <p>Have questions? We're here to help you with your healthcare journey.</p>
        </div>
      </div>

      <div className="container">
        <div className="grid grid-2" style={{ gap: '64px', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '24px' }}>How can we help?</h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '40px' }}>
              Whether you're a patient looking for care, a doctor interested in joining our platform, or just have a general inquiry, our team is ready to assist you.
            </p>

            <div className="flex flex-col gap-lg">
              <div className="card flex items-center gap-md">
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-container)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  <HiOutlineMail />
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Email us at</div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>support@medimeet.com</div>
                </div>
              </div>

              <div className="card flex items-center gap-md">
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--secondary-container)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  <HiOutlinePhone />
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Call us at</div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>+880 1700-000000</div>
                </div>
              </div>

              <div className="card flex items-center gap-md">
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  <HiOutlineLocationMarker />
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Visit our office</div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>Banani, Dhaka, Bangladesh</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '40px' , marginBottom:"60px"}}>
            <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>Send us a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Your Name</label>
                <input
                  type="text" className="input" placeholder="Full Name"
                  value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required
                />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email" className="input" placeholder="email@example.com"
                  value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required
                />
              </div>
              <div className="input-group">
                <label>Subject</label>
                <input
                  type="text" className="input" placeholder="What is this regarding?"
                  value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} required
                />
              </div>
              <div className="input-group">
                <label>Message</label>
                <textarea
                  className="input" placeholder="Write your message here..."
                  value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
