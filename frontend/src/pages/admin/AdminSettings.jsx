import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUser, HiOutlineMail, HiOutlinePhone,
  HiOutlineCamera, HiOutlineLockClosed, HiOutlineShieldCheck
} from 'react-icons/hi';

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preview, setPreview] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      setPreview(user.avatar);
    }
  }, [user?.avatar]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await API.put('/users/profile', form);
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await API.put('/users/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      toast.loading('Uploading photo...', { id: 'avatar-upload' });
      const { data } = await API.put('/users/profile', formData);
      updateUser(data);
      setPreview(data.avatar);
      toast.success('Profile photo updated', { id: 'avatar-upload' });
    } catch (err) {
      toast.error('Failed to upload photo', { id: 'avatar-upload' });
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Admin Profile</h2>
        <p>Manage your Profile Settings and security</p>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start', gap: '32px' }}>
        {/* Profile Details */}
        <div className="card" style={{ padding: '32px' }}>
          <div className="flex items-center gap-sm mb-xl" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px' }}>
            <HiOutlineUser style={{ fontSize: '24px', color: 'var(--primary)' }} />
            <h3 style={{ margin: 0 }}>Account Information</h3>
          </div>

          <div className="flex flex-col items-center mb-xl">
            <div
              style={{
                width: '120px', height: '120px', borderRadius: '50%',
                backgroundColor: 'var(--surface-container-highest)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative', border: '4px solid var(--surface-container-highest)',
                marginBottom: '16px'
              }}
            >
              {preview ? (
                <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <HiOutlineUser style={{ fontSize: '48px', color: 'var(--text-muted)' }} />
              )}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current.click()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <HiOutlineCamera /> Change Photo
            </button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className="input-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineUser style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineMail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <HiOutlinePhone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={updating}>
              {updating ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Security / Password */}
        <div className="card" style={{ padding: '32px' }}>
          <div className="flex items-center gap-sm mb-xl" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px' }}>
            <HiOutlineShieldCheck style={{ fontSize: '24px', color: 'var(--primary)' }} />
            <h3 style={{ margin: 0 }}>Security Settings</h3>
          </div>

          <form onSubmit={handlePassword}>
            <div className="input-group">
              <label>Current Password</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="input"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="input"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({...pwForm, newPassword: e.target.value})}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="input"
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Processing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
