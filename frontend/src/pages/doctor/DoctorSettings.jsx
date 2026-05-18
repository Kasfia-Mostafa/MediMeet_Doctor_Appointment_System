import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUser, HiOutlineMail, HiOutlinePhone,
  HiOutlineCamera, HiOutlineLockClosed, HiOutlineShieldCheck,
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineCurrencyBangladeshi,
  HiOutlineEye, HiOutlineEyeOff
} from 'react-icons/hi';

export default function DoctorSettings() {
  const { user, doctorProfile, updateUser, fetchUser } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [docForm, setDocForm] = useState({
    specialization: doctorProfile?.specialization || '',
    qualification: doctorProfile?.qualification || '',
    consultationFee: doctorProfile?.consultationFee || 500,
    bio: doctorProfile?.bio || '',
    hospital: doctorProfile?.hospital || ''
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(user?.avatar || null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      setPreview(user.avatar);
    }
  }, [user?.avatar]);

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      toast.loading('Uploading avatar...', { id: 'upload' });
      const { data } = await API.put('/users/profile', formData);
      updateUser(data);
      setPreview(data.avatar);
      toast.success('Avatar updated!', { id: 'upload' });
    } catch (err) {
      toast.error('Upload failed', { id: 'upload' });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: updatedUser } = await API.put('/users/profile', form);
      await API.put('/doctors/schedule', docForm);
      updateUser(updatedUser);
      await fetchUser();
      toast.success('Profile information updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await API.put('/users/profile', {
        currentPassword: pwForm.currentPassword,
        password: pwForm.newPassword
      });
      toast.success('Password updated successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Doctor Profile</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal details and clinical information</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
        {/* Left Column: Avatar & Summary */}
        <div className="flex flex-col gap-lg">
          <div className="card text-center" style={{ padding: '32px 24px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
              <div
                className="avatar"
                style={{ width: '100%', height: '100%', fontSize: '40px', border: '4px solid var(--surface-container-high)', cursor: 'pointer' }}
                onClick={handleAvatarClick}
              >
                {preview ? <img src={preview} alt="" /> : user?.name?.charAt(0)}
              </div>
              <button
                onClick={handleAvatarClick}
                style={{
                  position: 'absolute', bottom: '0', right: '0',
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--primary)', color: 'white', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <HiOutlineCamera />
              </button>
              <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '20px', marginBottom: '4px' }}>Dr. {user?.name}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>{doctorProfile?.specialization || 'Medical Specialist'}</p>

            <div className="flex flex-col gap-sm" style={{ textAlign: 'left', background: 'var(--surface-container-low)', padding: '16px', borderRadius: '12px' }}>
              <div className="flex items-center gap-sm" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <HiOutlineMail /> {user?.email}
              </div>
              <div className="flex items-center gap-sm" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <HiOutlinePhone /> {user?.phone || 'No phone added'}
              </div>
              <div className="flex items-center gap-sm" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <HiOutlineShieldCheck /> Verified Practitioner
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div className="flex items-center gap-md mb-md">
              <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--primary-container)', color: 'var(--primary)' }}>
                <HiOutlineLockClosed />
              </div>
              <h4 style={{ fontWeight: 700 }}>Security</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Keep your account secure by using a strong password.</p>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-md">
              <div className="input-group">
                <label>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrent ? "text" : "password"} className="input"
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showCurrent ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? "text" : "password"} className="input"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showNew ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? "text" : "password"} className="input"
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showConfirm ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-secondary btn-block" disabled={loading}>
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Profile & Professional Forms */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleUpdateProfile}>
            <div className="flex items-center gap-md mb-xl">
              <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--primary-container)', color: 'var(--primary)', fontSize: '20px' }}>
                <HiOutlineUser />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Profile Information</h3>
            </div>

            <div className="grid grid-2 mb-lg">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  className="input" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input
                  className="input" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ margin: '40px 0 32px', borderTop: '1px solid var(--outline-variant)', paddingTop: '40px' }}>
              <div className="flex items-center gap-md mb-xl">
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', fontSize: '20px' }}>
                  <HiOutlineBriefcase />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Professional Credentials</h3>
              </div>

              <div className="grid grid-2 mb-lg">
                <div className="input-group">
                  <label><HiOutlineBriefcase style={{ fontSize: '14px', marginRight: '4px' }} /> Specialization</label>
                  <input
                    className="input" value={docForm.specialization}
                    onChange={e => setDocForm({ ...docForm, specialization: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label><HiOutlineAcademicCap style={{ fontSize: '14px', marginRight: '4px' }} /> Qualifications</label>
                  <input
                    className="input" value={docForm.qualification}
                    onChange={e => setDocForm({ ...docForm, qualification: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-2 mb-lg">
                <div className="input-group">
                  <label><HiOutlineCurrencyBangladeshi style={{ fontSize: '14px', marginRight: '4px' }} /> Consultation Fee (৳)</label>
                  <input
                    type="number" className="input"
                    value={docForm.consultationFee}
                    onChange={e => setDocForm({ ...docForm, consultationFee: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Primary Hospital/Clinic</label>
                  <input
                    className="input" value={docForm.hospital}
                    onChange={e => setDocForm({ ...docForm, hospital: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Professional Bio</label>
                <textarea
                  className="input" rows={5}
                  value={docForm.bio}
                  onChange={e => setDocForm({ ...docForm, bio: e.target.value })}
                  placeholder="Tell patients about your clinical experience and approach..."
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '32px', textAlign: 'right' }}>
              <button type="submit" className="btn btn-primary" style={{ minWidth: '160px', height: '48px' }} disabled={loading}>
                {loading ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
