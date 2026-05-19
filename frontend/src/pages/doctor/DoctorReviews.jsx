import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineStar, HiOutlineChatAlt2 } from 'react-icons/hi';

export default function DoctorReviews() {
  const { doctorProfile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorProfile?._id) {
      API.get(`/reviews/doctor/${doctorProfile._id}`)
        .then(({ data }) => setReviews(data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [doctorProfile?._id]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Patient Feedback</h2>
        <p>What patients are saying about your clinical services</p>
      </div>

      <div className="grid grid-3 mb-xl">
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning"><HiOutlineStar /></div>
          <div>
            <div className="stat-value">{doctorProfile?.rating?.toFixed(1) || '0.0'}</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><HiOutlineChatAlt2 /></div>
          <div>
            <div className="stat-value">{reviews.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><HiOutlineChatAlt2 /></div>
          <h3>No reviews yet</h3>
          <p>Feedback will appear here after patients complete their sessions.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {reviews.map((r) => (
            <div key={r._id} className="card">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-md">
                  <div className="avatar avatar-sm">
                    {r.user?.avatar ? <img src={r.user.avatar} alt="" /> : r.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.user?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-xs" style={{ color: '#f59e0b' }}>
                  <HiOutlineStar /> <span style={{ fontWeight: 700 }}>{r.rating}</span>
                </div>
              </div>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
