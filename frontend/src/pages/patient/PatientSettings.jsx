import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUserCircle, HiOutlineLockClosed, HiOutlineShieldCheck,
  HiOutlineMap, HiOutlinePhone, HiOutlineCamera, HiOutlineIdentification,
  HiOutlineHeart, HiOutlineMail, HiOutlineSave, HiOutlineChatAlt2,
  HiStar, HiOutlineStar, HiOutlinePencil, HiOutlineTrash,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function PatientSettings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('profile');

  // Profile Form State
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone?.startsWith('+880') ? user.phone.slice(4) : (user?.phone || ''),
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      zipCode: user?.address?.zipCode || ''
    },
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      phone: user?.emergencyContact?.phone || '',
      relationship: user?.emergencyContact?.relationship || ''
    }
  });

  // Security Form State
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Delete Modal State
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (tab === 'reviews') {
      fetchReviews();
    }
  }, [tab]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/reviews/me');
      setReviews(data);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = { ...form, phone: form.phone ? `+880${form.phone}` : '' };
      const { data } = await API.put('/users/profile', updateData);
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await API.put('/users/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Change failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const { data } = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(data);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteReview = async () => {
    setLoading(true);
    try {
      await API.delete(`/reviews/${deletingReviewId}`);
      toast.success('Review removed');
      setReviews(reviews.filter(r => r._id !== deletingReviewId));
      setDeletingReviewId(null);
    } catch (err) {
      toast.error('Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/reviews/${editingReview._id}`, editForm);
      toast.success('Feedback updated');
      setEditingReview(null);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to update review');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Manage your personal information, security and clinical feedback</p>
      </div>

      <div className="flex flex-col gap-lg">
        {/* Horizontal Tab Navigation */}
        <div className="card" style={{
          padding: '8px', borderRadius: '24px', border: '1px solid var(--outline-variant)',
          display: 'flex', gap: '8px', background: 'var(--surface-container-low)',
          width: 'fit-content', marginBottom: '8px'
        }}>
          <button
            onClick={() => setTab('profile')}
            style={{
              padding: '12px 24px', borderRadius: '18px', border: 'none',
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              background: tab === 'profile' ? 'var(--primary)' : 'transparent',
              color: tab === 'profile' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '14px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: tab === 'profile' ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' : 'none'
            }}
          >
            <HiOutlineUserCircle style={{ fontSize: '20px' }} />
            Personal Profile
          </button>
          <button
            onClick={() => setTab('reviews')}
            style={{
              padding: '12px 24px', borderRadius: '18px', border: 'none',
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              background: tab === 'reviews' ? 'var(--primary)' : 'transparent',
              color: tab === 'reviews' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '14px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: tab === 'reviews' ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' : 'none'
            }}
          >
            <HiOutlineChatAlt2 style={{ fontSize: '20px' }} />
            My Reviews
          </button>
          <button
            onClick={() => setTab('security')}
            style={{
              padding: '12px 24px', borderRadius: '18px', border: 'none',
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              background: tab === 'security' ? 'var(--primary)' : 'transparent',
              color: tab === 'security' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '14px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: tab === 'security' ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' : 'none'
            }}
          >
            <HiOutlineLockClosed style={{ fontSize: '20px' }} />
            Security & Password
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex flex-col gap-xl">
          {tab === 'profile' && (
            <div className="flex flex-col gap-xxl">
              {/* Header Info & Account Status */}
              <div className="card" style={{
                padding: '32px', borderRadius: '32px',
                background: 'linear-gradient(135deg, var(--primary-container) 0%, #fff 40%)',
                border: '1px solid var(--outline-variant)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div className="flex items-center justify-between ">
                  <div className="flex items-center gap-xl">
                    <div style={{ position: 'relative' }}>
                      <div className="avatar" style={{
                        width: '120px', height: '120px', fontSize: '40px',
                        borderRadius: '40px', border: '5px solid white',
                        boxShadow: 'var(--shadow-lg)',
                        background: 'var(--surface-container-high)'
                      }}>
                        {user?.avatar ? <img src={user.avatar} alt="" /> : user?.name?.charAt(0)}
                      </div>
                      <label style={{
                        position: 'absolute', bottom: '0', right: '0',
                        background: 'var(--primary)', color: 'white', width: '40px', height: '40px',
                        borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', border: '4px solid white', boxShadow: 'var(--shadow-md)',
                        transition: 'transform 0.2s'
                      }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <HiOutlineCamera style={{ fontSize: '20px' }} />
                        <input type="file" hidden onChange={handleAvatarChange} accept="image/*" />
                      </label>
                    </div>
                    <div>
                      <div className="flex items-center gap-sm mb-xs">
                        <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>{user?.name}</h2>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive Profile Form */}
              <div className="card" style={{ padding: '40px', borderRadius: '32px', boxShadow: 'var(--shadow-sm)' , marginTop: '24px'}}>
                <form onSubmit={handleProfileUpdate}>

                  {/* Section 1: Identity */}
                  <div style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--primary-container)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiOutlineIdentification style={{ fontSize: '24px' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Medical Identity</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Your basic information for clinical identification</p>
                      </div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '32px' }}>
                      <div className="input-group">
                        <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>Full Legal Name</label>
                        <input
                          className="input" value={form.name}
                          onChange={e => setForm({...form, name: e.target.value})}
                          required style={{
                            borderRadius: '16px', height: '54px', border: '1.5px solid var(--outline-variant)',
                            padding: '0 20px', fontSize: '15px', fontWeight: 500, background: 'var(--surface-container-lowest)'
                          }}
                        />
                      </div>
                      <div className="input-group">
                        <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>Account Email</label>
                        <div style={{ position: 'relative' }}>
                          <HiOutlineMail style={{ position: 'absolute', left: '18px', top: '18px', color: 'var(--text-muted)' }} />
                          <input 
                            className="input" value={form.email} 
                            onChange={e => setForm({...form, email: e.target.value})}
                            required
                            style={{ 
                              paddingLeft: '48px', height: '54px', borderRadius: '16px', border: '1.5px solid var(--outline-variant)',
                              background: 'var(--surface-container-lowest)', color: 'var(--text-primary)'
                            }} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-3" style={{ gap: '24px', marginTop: '32px' }}>
                      <div className="input-group">
                        <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>Phone Number</label>
                        <div className="phone-input-wrapper" style={{ height: '54px' }}>
                          <span className="phone-prefix">+880</span>
                          <input
                            className="input" 
                            style={{ border: 'none', borderRadius: 0, flex: 1, paddingLeft: '12px' }}
                            value={form.phone} 
                            onChange={e => setForm({...form, phone: e.target.value})}
                            placeholder="1XXX-XXXXXX"
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>Date of Birth</label>
                        <input
                          type="date" className="input" value={form.dateOfBirth}
                          onChange={e => setForm({...form, dateOfBirth: e.target.value})}
                          style={{ height: '54px', borderRadius: '16px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface-container-lowest)' }}
                        />
                      </div>
                      <div className="input-group">
                        <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>Gender Identity</label>
                        <select
                          className="input" value={form.gender}
                          onChange={e => setForm({...form, gender: e.target.value})}
                          style={{ height: '54px', borderRadius: '16px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface-container-lowest)' }}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <hr style={{ margin: '48px 0', border: 'none', borderTop: '1px solid var(--outline-variant)' }} />

                  {/* Section 2: Residential & Vitals */}
                  <div style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--success-container)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiOutlineHeart style={{ fontSize: '24px' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Residential & Vitals</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Important health metrics and contact location</p>
                      </div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '32px' }}>
                      <div className="input-group">
                        <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>Street Address</label>
                        <div style={{ position: 'relative' }}>
                          <HiOutlineMap style={{ position: 'absolute', left: '18px', top: '18px', color: 'var(--text-muted)' }} />
                          <input
                            className="input" placeholder="Apt, Building, Street name"
                            value={form.address.street}
                            onChange={e => setForm({...form, address: {...form.address, street: e.target.value}})}
                            style={{ paddingLeft: '48px', height: '54px', borderRadius: '16px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface-container-lowest)' }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-2" style={{ gap: '20px' }}>
                        <div className="input-group">
                          <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>City / State</label>
                          <input
                            className="input" value={form.address.city}
                            onChange={e => setForm({...form, address: {...form.address, city: e.target.value}})}
                            style={{ height: '54px', borderRadius: '16px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface-container-lowest)' }}
                          />
                        </div>
                        <div className="input-group">
                          <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>Blood Group</label>
                          <input
                            className="input" value={form.bloodGroup}
                            onChange={e => setForm({...form, bloodGroup: e.target.value})}
                            placeholder="e.g. B+"
                            style={{ height: '54px', borderRadius: '16px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', textAlign: 'center', fontWeight: 800, color: 'var(--error)' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '64px', display: 'flex', justifyContent: 'flex-end',
                    paddingTop: '32px', borderTop: '1px solid var(--outline-variant)'
                  }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        borderRadius: '16px', height: '52px', padding: '0 32px',
                        fontSize: '14px', fontWeight: 800, letterSpacing: '0.5px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.2)',
                        border: 'none', display: 'flex', alignItems: 'center', gap: '10px'
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : <><HiOutlineSave style={{ fontSize: '18px' }} /> Update Profile Info</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="flex flex-col gap-lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingLeft: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-container)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiOutlineChatAlt2 style={{ fontSize: '22px' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Clinical Feedback History</h3>
              </div>

              {reviews.length === 0 ? (
                <div className="card text-center" style={{ padding: '60px 0', border: '2px dashed var(--outline-variant)' }}>
                  <HiOutlineChatAlt2 style={{ fontSize: '48px', color: 'var(--outline-variant)', marginBottom: '16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>You haven't shared any reviews yet.</p>
                </div>
              ) : (
                <div className="grid grid-2" style={{ gap: '20px' }}>
                  {reviews.map((review) => (
                    <div key={review._id} className="card" style={{ padding: '24px', borderRadius: '24px' }}>
                      <div className="flex items-start justify-between mb-lg">
                        <div className="flex items-center gap-md">
                          <div className="avatar" style={{ width: '44px', height: '44px', borderRadius: '12px' }}>
                            {review.doctor?.user?.avatar ? <img src={review.doctor.user.avatar} alt="" /> : review.doctor?.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '14px' }}>Dr. {review.doctor?.user?.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>{review.doctor?.specialization}</div>
                          </div>
                        </div>
                        <div className="flex gap-xs" style={{ color: '#F59E0B', fontSize: '12px' }}>
                          {[...Array(5)].map((_, i) => (
                            i < review.rating ? <HiStar key={i} /> : <HiOutlineStar key={i} />
                          ))}
                        </div>
                      </div>
                      <div style={{ background: 'var(--surface-container-low)', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>"{review.comment}"</p>
                      </div>
                      <div className="flex gap-sm">
                        <button
                          onClick={() => { setEditingReview(review); setEditForm({ rating: review.rating, comment: review.comment }); }}
                          className="btn btn-ghost btn-sm flex-1" style={{ fontSize: '12px', background: 'var(--surface-container-low)' }}
                        >
                          <HiOutlinePencil /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingReviewId(review._id)}
                          className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'security' && (
            <div className="flex justify-center" style={{ width: '100%' }}>
              <div className="card" style={{ padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '600px', boxShadow: 'var(--shadow-md)' }}>
                <form onSubmit={handlePasswordChange}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', justifyContent: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-container)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HiOutlineLockClosed style={{ fontSize: '22px' }} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Update Password</h3>
                  </div>

                  <div className="input-group">
                    <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>Current Password</label>
                    <input
                      type="password" className="input"
                      value={pwForm.currentPassword}
                      onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})}
                      required style={{ borderRadius: '16px', height: '54px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface-container-lowest)' }}
                    />
                  </div>

                  <div className="grid grid-2" style={{ gap: '24px', marginTop: '24px' }}>
                    <div className="input-group">
                      <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>New Password</label>
                      <input
                        type="password" className="input"
                        value={pwForm.newPassword}
                        onChange={e => setPwForm({...pwForm, newPassword: e.target.value})}
                        required style={{ borderRadius: '16px', height: '54px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface-container-lowest)' }}
                      />
                    </div>
                    <div className="input-group">
                      <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'block', color: 'var(--text-secondary)' }}>Confirm New Password</label>
                      <input
                        type="password" className="input"
                        value={pwForm.confirmPassword}
                        onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})}
                        required style={{ borderRadius: '16px', height: '54px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface-container-lowest)' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        borderRadius: '16px', height: '52px', padding: '0 40px', width: '100%',
                        fontSize: '14px', fontWeight: 800, letterSpacing: '0.5px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.2)',
                        border: 'none'
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Changing...' : 'Update Password Securely'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px', padding: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Update Feedback</h2>
            <form onSubmit={handleEditReviewSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: 700, marginBottom: '12px', display: 'block' }}>Your Rating</label>
                <div className="flex gap-sm">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star} type="button"
                      onClick={() => setEditForm({ ...editForm, rating: star })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '32px', color: star <= editForm.rating ? '#F59E0B' : 'var(--outline-variant)' }}
                    >
                      {star <= editForm.rating ? <HiStar /> : <HiOutlineStar />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label style={{ fontWeight: 700, marginBottom: '12px', display: 'block' }}>Comment</label>
                <textarea
                  className="input" rows={4} value={editForm.comment}
                  onChange={e => setEditForm({ ...editForm, comment: e.target.value })}
                  required style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="flex gap-md mt-xl">
                <button type="button" className="btn btn-ghost flex-1" onClick={() => setEditingReview(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" style={{ borderRadius: '14px' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReviewId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: 'rgba(186, 26, 26, 0.1)', color: 'var(--error)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: '32px'
            }}>
              <HiOutlineExclamationCircle />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>Remove Feedback?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
              Are you sure you want to delete this clinical review? This action cannot be undone and will affect the doctor's average rating.
            </p>
            <div className="flex flex-col gap-sm">
              <button
                onClick={confirmDeleteReview}
                className="btn btn-primary"
                style={{ background: 'var(--error)', border: 'none', borderRadius: '14px', width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Removing...' : 'Yes, Delete Review'}
              </button>
              <button
                onClick={() => setDeletingReviewId(null)}
                className="btn btn-ghost"
                style={{ width: '100%' }}
                disabled={loading}
              >
                Keep Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
