import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlinePlus, HiOutlinePaperClip, HiOutlineClock } from 'react-icons/hi';

const formatTime12h = (time24) => {
  if (!time24 || typeof time24 !== 'string') return '';
  const [hourStr, minute] = time24.split(':');
  if (!hourStr || !minute) return time24;
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', timeSlot: '', doctorId: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        let statusParam = filter;
        if (filter === 'expired') statusParam = 'no-show';
        const params = statusParam !== 'all' ? { status: statusParam } : {};
        const { data } = await API.get('/appointments', { params });
        setAppointments(data.appointments || []);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [filter]);

  useEffect(() => {
    if (showRescheduleModal && rescheduleData.date && rescheduleData.doctorProfileId) {
      setLoadingSlots(true);
      API.get(`/doctors/${rescheduleData.doctorProfileId}/slots`, { params: { date: rescheduleData.date } })
        .then(({ data }) => {
          setAvailableSlots(data.slots || []);
          setBookedSlots(data.bookedSlots || []);
        })
        .catch(() => {
          setAvailableSlots([]);
          setBookedSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [showRescheduleModal, rescheduleData.date, rescheduleData.doctorProfileId]);

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

  const handleRescheduleClick = (appt) => {
    setRescheduleData({ 
      date: new Date(appt.date).toISOString().split('T')[0], 
      timeSlot: appt.timeSlot,
      doctorProfileId: appt.doctorProfile?._id || appt.doctorProfile
    });
    setSelectedApptId(appt._id);
    setShowRescheduleModal(true);
  };

  const confirmReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.timeSlot) return toast.error('Select date and time');
    try {
      const { data } = await API.put(`/appointments/${selectedApptId}/reschedule`, {
        date: rescheduleData.date,
        timeSlot: rescheduleData.timeSlot
      });
      setAppointments(prev => prev.map(a => a._id === selectedApptId ? { ...a, date: data.date, timeSlot: data.timeSlot, status: 'pending' } : a));
      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule');
    }
  };

  const tabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'expired'];

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
            <thead><tr><th>Doctor</th><th>Specialization</th><th>Date & Time</th><th>Type & Files</th><th>Status</th><th>Actions</th></tr></thead>
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
                  <td>{new Date(a.date).toLocaleDateString()} at {formatTime12h(a.timeSlot)}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {a.type}
                    {a.medicalFiles?.length > 0 && (
                      <div className="flex gap-xs mt-xs flex-wrap">
                        {a.medicalFiles.map((file, idx) => (
                          <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="chip" style={{ fontSize: '10px', background: 'var(--surface-container-high)', color: 'var(--primary)', textDecoration: 'none', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <HiOutlinePaperClip /> File {idx+1}
                          </a>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`chip chip-${a.status === 'no-show' ? 'expired' : a.status}`}>
                      {a.status === 'no-show' ? 'Expired' : a.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-sm">
                      {['pending', 'confirmed', 'no-show'].includes(a.status) && (
                        <>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', fontSize: '13px' }} onClick={() => handleRescheduleClick(a)}>Reschedule</button>
                          {a.status !== 'no-show' && (
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)', fontSize: '13px' }} onClick={() => handleCancelClick(a._id)}>Cancel</button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 className="mb-md flex items-center gap-sm"><HiOutlineClock className="text-primary" /> Reschedule Appointment</h3>
            <div className="flex flex-col gap-lg">
              <div className="input-group">
                <label>New Date</label>
                <input 
                  type="date" 
                  className="input" 
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleData.date} 
                  onChange={e => setRescheduleData({...rescheduleData, date: e.target.value, timeSlot: ''})} 
                />
              </div>

              <div className="input-group">
                <label>Available Slots</label>
                {loadingSlots ? <div className="spinner-sm"></div> : availableSlots.length > 0 ? (
                  <div className="grid grid-3 gap-sm mt-sm">
                    {availableSlots.map(slot => {
                      const isBooked = bookedSlots.includes(slot);
                      return (
                        <button 
                          key={slot} 
                          disabled={isBooked}
                          className={`btn btn-sm ${rescheduleData.timeSlot === slot ? 'btn-primary' : 'btn-outline'} ${isBooked ? 'opacity-50' : ''}`}
                          onClick={() => !isBooked && setRescheduleData({...rescheduleData, timeSlot: slot})}
                          title={isBooked ? 'Already booked' : ''}
                        >
                          {formatTime12h(slot)} {isBooked && '(Booked)'}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No slots available for this date.</p>
                )}
              </div>
            </div>

            <div className="flex gap-md justify-end mt-xl">
              <button className="btn btn-ghost" onClick={() => setShowRescheduleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmReschedule}>Confirm New Time</button>
            </div>
          </div>
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
