import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineCalendar, HiOutlineDocumentText, HiOutlineHeart, HiOutlineArrowRight } from 'react-icons/hi';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ appointments: 0, records: 0, wellnessScore: 0, upcoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [apptRes, recRes, wellnessRes] = await Promise.all([
          API.get('/appointments', { params: { limit: 5 } }),
          API.get('/records'),
          API.get('/wellness/today').catch(() => ({ data: null }))
        ]);

        const upcoming = (apptRes.data.appointments || []).filter(a => ['pending', 'confirmed'].includes(a.status)).slice(0, 3);

        let score = 0;
        if (wellnessRes?.data?.goals) {
          const { steps, water, sleep } = wellnessRes.data.goals;
          const s = Math.min(steps / 10000, 1) * 100;
          const w = Math.min(water / 8, 1) * 100;
          const sl = Math.min(sleep / 8, 1) * 100;
          score = Math.round((s + w + sl) / 3);
        }

        setStats({
          appointments: apptRes.data.total || 0,
          records: (recRes.data || []).length,
          wellnessScore: score,
          upcoming,
          vitals: wellnessRes?.data?.metrics || {}
        });
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p style={{ fontSize: '15px', opacity: 0.7 }}>Your health overview and clinical appointments</p>
      </div>

      <div className="grid grid-3 mb-xl">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><HiOutlineCalendar /></div>
          <div>
            <div className="stat-value">{stats.appointments}</div>
            <div className="stat-label">Total Visits</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary"><HiOutlineDocumentText /></div>
          <div>
            <div className="stat-value">{stats.records}</div>
            <div className="stat-label">Lab Reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success"><HiOutlineHeart /></div>
          <div>
            <div className="stat-value">{stats.wellnessScore}%</div>
            <div className="stat-label">Today's Wellness Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card" style={{ borderRadius: '20px' }}>
          <div className="card-header flex items-center justify-between" style={{ paddingBottom: '20px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: 700 }}>Upcoming Clinical Visits</h4>
            <Link to="/patient/appointments" className="btn btn-ghost btn-sm">
              View History <HiOutlineArrowRight />
            </Link>
          </div>
          <div className="flex flex-col">
            {stats.upcoming.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', opacity: 0.2, marginBottom: '16px' }}>🗓️</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No upcoming appointments scheduled</p>
                <Link to="/find-doctor" className="btn btn-primary btn-sm">Find a Specialist</Link>
              </div>
            ) : (
              stats.upcoming.map((appt) => (
                <div key={appt._id} className="flex items-center justify-between" style={{ padding: '16px 0', borderBottom: '1px solid var(--surface-container-high)' }}>
                  <div className="flex items-center gap-md">
                    <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '12px' }}>
                      {appt.doctor?.user?.avatar ? <img src={appt.doctor.user.avatar} alt="" /> : appt.doctor?.user?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>Dr. {appt.doctor?.user?.name || 'Medical Expert'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {appt.timeSlot}
                      </div>
                    </div>
                  </div>
                  <span className={`chip chip-${appt.status}`} style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 800 }}>
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card" style={{ borderRadius: '20px' }}>
          <div className="card-header" style={{ paddingBottom: '20px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: 700 }}>Health Operations</h4>
          </div>
          <div className="flex flex-col gap-md">
            <Link to="/find-doctor" className="btn btn-primary btn-block" style={{ justifyContent: 'flex-start', padding: '16px' }}>
              <HiOutlineCalendar style={{ fontSize: '20px' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>Book New Appointment</div>
                <div style={{ fontSize: '11px', opacity: 0.7, fontWeight: 400 }}>Schedule a visit with a top specialist</div>
              </div>
            </Link>
            <Link to="/patient/records" className="btn btn-secondary btn-block" style={{ justifyContent: 'flex-start', padding: '16px' }}>
              <HiOutlineDocumentText style={{ fontSize: '20px' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>Medical Records</div>
                <div style={{ fontSize: '11px', opacity: 0.7, fontWeight: 400 }}>Access your prescriptions and lab reports</div>
              </div>
            </Link>
            <Link to="/patient/wellness" className="btn btn-secondary btn-block" style={{ justifyContent: 'flex-start', padding: '16px' }}>
              <HiOutlineHeart style={{ fontSize: '20px' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>Health Insight</div>
                <div style={{ fontSize: '11px', opacity: 0.7, fontWeight: 400 }}>Monitor your vital signs and health goals</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
