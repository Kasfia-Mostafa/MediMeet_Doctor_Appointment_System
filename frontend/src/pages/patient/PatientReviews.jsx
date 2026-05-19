/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineStar, HiStar, HiOutlineChatAlt2, HiOutlineTrash,
  HiOutlinePencil
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function PatientReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  const fetchReviews = async () => {
    try {
      const { data } = await API.get('/reviews/me');
      setReviews(data);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this clinical feedback?')) return;
    try {
      await API.delete(`/reviews/${id}`);
      toast.success('Review removed');
      setReviews(reviews.filter(r => r._id !== id));
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const handleEditSubmit = async (e) => {
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

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>Clinical Feedback</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Manage the ratings and reviews you've shared with healthcare providers</p>
      </div>

      {reviews.length === 0 ? (
        <div className="card text-center" style={{ padding: '80px 0', border: '2px dashed var(--outline-variant)', borderRadius: '32px' }}>
          <HiOutlineChatAlt2 style={{ fontSize: '64px', color: 'var(--outline-variant)', marginBottom: '24px' }} />
          <h3 style={{ fontSize: '24px', fontWeight: 700 }}>No reviews shared yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '12px auto 32px' }}>
            Your feedback helps other patients find the best care. Rate your doctors after your appointments.
          </p>
          <Link to="/find-doctor" className="btn btn-primary" style={{ borderRadius: '16px' }}>Browse Specialists</Link>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {reviews.map((review) => (
            <div key={review._id} className="card hover-lift" style={{ padding: '32px', borderRadius: '28px', background: 'white' }}>
              <div className="flex items-start justify-between mb-xl">
                <div className="flex items-center gap-md">
                  <div className="avatar" style={{ width: '56px', height: '56px', borderRadius: '16px', border: '3px solid var(--surface-container-low)' }}>
                    {review.doctor?.user?.avatar ? <img src={review.doctor.user.avatar} alt="" /> : review.doctor?.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>Dr. {review.doctor?.user?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{review.doctor?.specialization}</div>
                  </div>
                </div>
                <div className="flex gap-xs" style={{ color: '#F59E0B' }}>
                  {[...Array(5)].map((_, i) => (
                    i < review.rating ? <HiStar key={i} /> : <HiOutlineStar key={i} />
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--surface-container-low)', padding: '20px', borderRadius: '20px', marginBottom: '24px', position: 'relative' }}>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{review.comment}"
                </p>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: 600 }}>
                  Published on {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="flex gap-sm">
                <button
                  onClick={() => { setEditingReview(review); setEditForm({ rating: review.rating, comment: review.comment }); }}
                  className="btn btn-secondary btn-sm flex-1" style={{ borderRadius: '12px', gap: '8px' }}
                >
                  <HiOutlinePencil /> Edit Feedback
                </button>
                <button
                  onClick={() => handleDelete(review._id)}
                  className="btn btn-ghost btn-sm" style={{ color: 'var(--error)', padding: '0 12px' }}
                >
                  <HiOutlineTrash style={{ fontSize: '18px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px', padding: '40px' }}>
            <div className="flex items-center gap-md mb-xl">
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-container)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiOutlineChatAlt2 style={{ fontSize: '24px' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Update Feedback</h2>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', fontSize: '14px' }}>Your Rating</label>
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
                <label style={{ fontWeight: 700, marginBottom: '12px', display: 'block' }}>Share your experience</label>
                <textarea
                  className="input" rows={4} value={editForm.comment}
                  onChange={e => setEditForm({ ...editForm, comment: e.target.value })}
                  required style={{ borderRadius: '16px', padding: '16px' }}
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
    </div>
  );
}
