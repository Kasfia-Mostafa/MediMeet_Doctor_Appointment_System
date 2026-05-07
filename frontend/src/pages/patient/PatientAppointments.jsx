import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlinePlus } from 'react-icons/hi';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = filter !== 'all' ? { status: filter } : {};
        const { data } = await API.get('/appointments', { params });
        setAppointments(data.appointments || []);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [filter]);

  const handleCancelClick = (id) => {
    setSelectedApptId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      await API.delete(`/appointments/${selectedApptId}`, { data: { reason: 'Cancelled by patient' } });
      setAppointments(prev => prev.map(a => a._id === selectedApptId ? { ...a, status: 'cancelled' } : a));
      toast.success('Appointment cancelled');
    } catch (err) { 
      toast.error('Failed to cancel'); 
    } finally {
      setShowCancelModal(false);
      setSelectedApptId(null);
    }
  };

  const tabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-xl">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>My Appointments</h2>
          <p>Manage and track all your appointments</p>
        </div>
        <Link to="/book-appointment" className="btn btn-primary"><HiOutlinePlus /> Book New</Link>
      </div>

      <div className="tabs">
        {tabs.map(t => <button key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>{t === 'all' ? 'All' : t}</button>)}
      </div>

      {loading ? <div className="loader"><div className="spinner"></div></div> : appointments.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"><HiOutlineCalendar /></div><h3>No appointments found</h3><p>Book your first appointment today</p><Link to="/book-appointment" className="btn btn-primary mt-md">Book Now</Link></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Doctor</th><th>Specialization</th><th>Date & Time</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id}>
                  <td>
                    <div className="flex items-center gap-sm">
                      {a.doctor?.avatar ? (
                        <img src={a.doctor.avatar} alt="" className="avatar avatar-sm" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="avatar avatar-sm">{a.doctor?.name?.charAt(0)}</div>
                      )}
                      {a.doctor?.name}
                    </div>
                  </td>
                  <td>{a.doctorProfile?.specialization || '—'}</td>
                  <td>{new Date(a.date).toLocaleDateString()} at {a.timeSlot}</td>
                  <td style={{ textTransform: 'capitalize' }}>{a.type}</td>
                  <td><span className={`chip chip-${a.status}`}>{a.status}</span></td>
                  <td>
                    {['pending', 'confirmed'].includes(a.status) && (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)', fontSize: '13px' }} onClick={() => handleCancelClick(a._id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Appointment?</h3>
            <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>No, Keep it</button>
              <button className="btn" style={{ background: 'var(--error)', color: 'white' }} onClick={confirmCancel}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
