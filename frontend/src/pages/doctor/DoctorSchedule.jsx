/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TIME_OPTIONS = (() => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    const hh = String(hour).padStart(2, '0');
    options.push(`${hh}:00`);
    options.push(`${hh}:30`);
  }
  return options;
})();

export default function DoctorSchedule() {
  const { doctorProfile, fetchUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('appointments');

  // Schedule settings state
  const [availableDays, setAvailableDays] = useState(doctorProfile?.availableDays || []);
  const [timeSlots, setTimeSlots] = useState(doctorProfile?.timeSlots || []);
  const [newSlot, setNewSlot] = useState({ day: doctorProfile?.availableDays?.[0] || 'monday', startTime: '09:00', endTime: '17:00' });

  // Sync local state when doctorProfile updates
  useEffect(() => {
    if (doctorProfile) {
      setAvailableDays(doctorProfile.availableDays || []);
      setTimeSlots(doctorProfile.timeSlots || []);
      setNewSlot(prev => ({ ...prev, day: doctorProfile.availableDays?.[0] || prev.day }));
    }
  }, [doctorProfile]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/appointments'),
      API.get('/auth/me')
    ])
      .then(([{ data: apptData }, { data: meData }]) => {
        setAppointments(apptData.appointments || []);
        if (meData?.doctorProfile) {
          setAvailableDays(meData.doctorProfile.availableDays || []);
          setTimeSlots(meData.doctorProfile.timeSlots || []);
          setNewSlot(prev => ({
            ...prev,
            day: meData.doctorProfile.availableDays?.[0] || prev.day
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch schedule/appointments on mount:', err);
        toast.error('Failed to fetch schedule or appointments');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  const handleSaveSchedule = async () => {
    try {
      await API.put('/doctors/schedule', { availableDays, timeSlots });
      toast.success('Schedule saved');
      fetchUser();
    } catch { toast.error('Failed to save'); }
  };

  const addSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) return toast.error('Enter start and end times');
    if (availableDays.length === 0) return toast.error('Select at least one available day first');
    setTimeSlots([...timeSlots, { ...newSlot }]);
    setNewSlot({ ...newSlot, startTime: '09:00', endTime: '17:00' });
  };

  const removeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      const updatedDays = availableDays.filter(d => d !== day);
      setAvailableDays(updatedDays);
      setTimeSlots(prev => prev.filter(slot => slot.day !== day));
      if (newSlot.day === day) {
        setNewSlot(prev => ({ ...prev, day: updatedDays[0] || '' }));
      }
    } else {
      const updatedDays = [...availableDays, day];
      setAvailableDays(updatedDays);
      if (updatedDays.length === 1) {
        setNewSlot(prev => ({ ...prev, day }));
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Schedule & Appointments</h2>
        <p>Manage your availability and view upcoming consultations</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}>Appointments</button>
        <button className={`tab ${tab === 'availability' ? 'active' : ''}`} onClick={() => setTab('availability')}>Availability Settings</button>
      </div>

      {tab === 'appointments' && (
        loading ? <div className="loader"><div className="spinner"></div></div> : appointments.length === 0 ? (
          <div className="empty-state"><div className="empty-icon"><HiOutlineCalendar /></div><h3>No appointments</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Patient</th><th>Date & Time</th><th>Type</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td><div className="flex items-center gap-sm"><div className="avatar avatar-sm">{a.patient?.name?.charAt(0)}</div>{a.patient?.name}</div></td>
                    <td>{new Date(a.date).toLocaleDateString()} <br /><small style={{ color: 'var(--text-muted)' }}>{a.timeSlot}</small></td>
                    <td style={{ textTransform: 'capitalize' }}>{a.type}</td>
                    <td>{a.reason}</td>
                    <td><span className={`chip chip-${a.status}`}>{a.status}</span></td>
                    <td>
                      {a.status === 'pending' && (
                        <div className="flex gap-sm">
                          <button className="btn btn-sm" style={{ background: 'var(--success-light)', color: 'var(--success)' }} onClick={() => handleUpdateStatus(a._id, 'confirmed')}>Accept</button>
                          <button className="btn btn-sm" style={{ background: 'var(--error-container)', color: 'var(--error)' }} onClick={() => handleUpdateStatus(a._id, 'cancelled')}>Decline</button>
                        </div>
                      )}
                      {a.status === 'confirmed' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(a._id, 'completed')}>Mark Completed</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'availability' && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <h4 style={{ marginBottom: '16px' }}>Available Days</h4>
          <div className="flex flex-wrap gap-sm mb-lg">
            {DAYS.map(day => (
              <button key={day} type="button" className={`btn btn-sm ${availableDays.includes(day) ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleDay(day)} style={{ textTransform: 'capitalize' }}>
                {day}
              </button>
            ))}
          </div>

          <h4 style={{ marginBottom: '16px' }}>Time Slots</h4>
          {availableDays.length === 0 ? (
            <div style={{ padding: '24px', background: 'var(--surface-container-low)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <HiOutlineClock style={{ fontSize: '28px', opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>Select available days above to configure time slots</p>
            </div>
          ) : (
            <>
              <div className="grid grid-4 mb-md" style={{ alignItems: 'end' }}>
                <div className="input-group">
                  <label>Day</label>
                  <select className="input" value={newSlot.day} onChange={e => setNewSlot({ ...newSlot, day: e.target.value })}>
                    {availableDays.map(d => <option key={d} value={d} style={{ textTransform: 'capitalize' }}>{d}</option>)}
                  </select>
                </div>
                <div className="input-group"><label>Start Time (24h)</label><select className="input" value={newSlot.startTime} onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}>{TIME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div className="input-group"><label>End Time (24h)</label><select className="input" value={newSlot.endTime} onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}>{TIME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div className="input-group"><button className="btn btn-secondary btn-block" onClick={addSlot}>Add Slot</button></div>
              </div>

              {timeSlots.length > 0 && (
                <div className="table-wrapper mb-lg">
                  <table>
                    <thead><tr><th>Day</th><th>Time</th><th>Action</th></tr></thead>
                    <tbody>
                      {timeSlots.filter(ts => availableDays.includes(ts.day)).map((ts, i) => (
                        <tr key={i}>
                          <td style={{ textTransform: 'capitalize' }}>{ts.day}</td>
                          <td>{ts.startTime} - {ts.endTime}</td>
                          <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => removeSlot(timeSlots.indexOf(ts))}>Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <button className="btn btn-primary" onClick={handleSaveSchedule}>Save Settings</button>
        </div>
      )}
    </div>
  );
}
