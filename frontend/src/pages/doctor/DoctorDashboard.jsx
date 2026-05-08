import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import {
  HiOutlineUserGroup, HiOutlineCalendar, HiOutlineClipboardList,
  HiOutlineArrowRight, HiOutlineClock, HiOutlineShieldCheck,
  HiOutlineTrendingUp, HiOutlineBell, HiOutlineUserCircle,
  HiOutlineChatAlt2, HiOutlineCurrencyBangladeshi, HiOutlinePaperClip, HiOutlineStar
} from 'react-icons/hi';

export default function DoctorDashboard() {
  const { user, doctorProfile } = useAuth();
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, upcoming: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [apptRes, patientsRes, reviewsRes] = await Promise.all([
          API.get('/appointments', { params: { limit: 10 } }),
          API.get('/doctors/patients'),
          doctorProfile?._id ? API.get(`/reviews/doctor/${doctorProfile._id}`) : Promise.resolve({ data: [] })
        ]);

        const appointments = apptRes.data.appointments || [];
        const todayAppointments = appointments.filter(a => {
          const aDate = new Date(a.date);
          aDate.setHours(0,0,0,0);
          return aDate.getTime() === today.getTime() && ['pending', 'confirmed'].includes(a.status);
        }).length;

        const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).slice(0, 5);

        setStats({ totalPatients: patientsRes.data.length || 0, todayAppointments, upcoming });
        setReviews(reviewsRes.data.slice(0, 2) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [doctorProfile?._id]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      setStats(prev => ({
        ...prev,
        upcoming: prev.upcoming.map(a => a._id === id ? { ...a, status } : a)
      }));
      toast.success('Status updated');
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const metricCards = [
    { label: "Today's Schedule", value: stats.todayAppointments, icon: <HiOutlineClock />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    { label: "Total Patients", value: stats.totalPatients, icon: <HiOutlineUserGroup />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { label: "Patient Rating", value: doctorProfile?.rating?.toFixed(1) || '4.8', icon: <HiOutlineShieldCheck />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      <div className="flex items-center justify-between mb-xl">
        <div className="flex items-center gap-md">
          <div className="avatar avatar-lg" style={{ border: '3px solid white', boxShadow: 'var(--shadow)' }}>
            {user?.avatar ? <img src={user.avatar} alt="" /> : user?.name?.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 800 }}>Welcome,{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{doctorProfile?.specialization || 'Medical Specialist'} • {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>

      </div>

      <div className="grid grid-3 mb-xl">
        {metricCards.map((card, idx) => (
          <div key={idx} className="card" style={{ padding: '24px', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-md">
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                backgroundColor: card.bg, color: card.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>{card.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div className="flex items-center justify-between mb-xl">
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Upcoming Patient Queue</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Patients confirmed for your next sessions</p>
            </div>
            <Link to="/doctor/schedule" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', fontWeight: 700 }}>View Full Schedule</Link>
          </div>

          <div className="flex flex-col gap-sm">
            {stats.upcoming.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <HiOutlineCalendar style={{ fontSize: '48px', opacity: 0.2, marginBottom: '12px' }} />
                <p>No patients in the queue for now.</p>
              </div>
            ) : (
              stats.upcoming.map((appt) => (
                <div key={appt._id} className="flex items-center justify-between hover-row" style={{ padding: '16px', borderRadius: '12px', background: 'var(--surface-container-low)' }}>
                  <div className="flex items-center gap-md">
                    <div className="avatar">
                      {appt.patient?.avatar ? <img src={appt.patient.avatar} alt="" /> : appt.patient?.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{appt.patient?.name}</div>
                      <div className="flex items-center gap-xs" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        <HiOutlineClock /> {appt.timeSlot} • {new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      {appt.medicalFiles?.length > 0 && (
                        <div className="flex items-center gap-xs mt-xs" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>
                          <HiOutlinePaperClip /> {appt.medicalFiles.length} File(s)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-md">
                    <select
                      className={`chip chip-${appt.status}`}
                      style={{ border: 'none', cursor: 'pointer', outline: 'none', appearance: 'none', textAlign: 'center', fontSize: '11px' }}
                      value={appt.status}
                      onChange={(e) => handleUpdateStatus(appt._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Link to={`/doctor/patients/${appt.patient?._id}`} className="btn btn-ghost btn-sm" style={{ width: '32px', height: '32px', padding: 0 }}>
                      <HiOutlineArrowRight />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Clinical Actions</h3>
            <div className="flex flex-col gap-sm">
              <Link to="/doctor/patients" className="btn btn-primary" style={{ justifyContent: 'flex-start', borderRadius: '12px', height: '52px' }}>
                <HiOutlineUserGroup /> Patient Directory
              </Link>
              <Link to="/doctor/reviews" className="btn btn-secondary" style={{ justifyContent: 'flex-start', borderRadius: '12px', height: '52px' }}>
                <HiOutlineChatAlt2 /> View Reviews
              </Link>
              <Link to="/doctor/earnings" className="btn btn-secondary" style={{ justifyContent: 'flex-start', borderRadius: '12px', height: '52px' }}>
                <HiOutlineCurrencyBangladeshi /> My Earnings
              </Link>
              <Link to="/doctor/doctorprofile" className="btn btn-secondary" style={{ justifyContent: 'flex-start', borderRadius: '12px', height: '52px' }}>
                <HiOutlineUserCircle /> Edit Profile
              </Link>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between mb-lg">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Patient Feedback</h3>
              <Link to="/doctor/reviews" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>See All</Link>
            </div>
            <div className="flex flex-col gap-md">
              {reviews.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No feedback received yet.</p>
              ) : (
                reviews.map(review => (
                  <div key={review._id} style={{ paddingBottom: '16px', borderBottom: '1px solid var(--outline-variant)' }}>
                    <div className="flex items-center justify-between mb-xs">
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>{review.user?.name}</span>
                      <div className="flex items-center gap-xs" style={{ color: '#f59e0b', fontSize: '12px' }}>
                        <HiOutlineStar /> <span>{review.rating}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{review.comment.substring(0, 60)}{review.comment.length > 60 ? '...' : ''}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
