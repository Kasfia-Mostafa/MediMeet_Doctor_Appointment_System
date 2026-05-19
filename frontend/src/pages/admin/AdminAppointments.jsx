/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineSearch } from 'react-icons/hi';

const formatTime12h = (time24) => {
  if (!time24 || typeof time24 !== 'string') return '';
  const [hourStr, minute] = time24.split(':');
  if (!hourStr || !minute) return time24;
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        let statusParam = filter;
        if (filter === 'expired') statusParam = 'no-show';
        const params = statusParam !== 'all' ? { status: statusParam } : {};
        const { data } = await API.get('/appointments', { params });
        setAppointments(data.appointments || []);
      } catch (err) {
        toast.error('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success('Appointment status updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleCancelClick = (id) => {
    setSelectedApptId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      await API.delete(`/appointments/${selectedApptId}`, { data: { reason: 'Cancelled by administrator' } });
      setAppointments(prev => prev.map(a => a._id === selectedApptId ? { ...a, status: 'cancelled' } : a));
      toast.success('Appointment cancelled by admin');
    } catch (err) {
      toast.error('Failed to cancel');
    } finally {
      setShowCancelModal(false);
      setSelectedApptId(null);
    }
  };

  const filteredAppointments = appointments.filter(a =>
    a.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'expired'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Manage Appointments</h2>
        <p>Monitor and manage all medical appointments across the platform</p>
      </div>

      <div className="card mb-xl">
        <div className="flex flex-wrap items-center justify-between gap-md">
          <div className="tabs" style={{ marginBottom: 0 }}>
            {tabs.map(t => (
              <button
                key={t}
                className={`tab ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="search-box" style={{ maxWidth: '300px', width: '100%', position: 'relative' }}>
            <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search patient or doctor..."
              className="input"
              style={{ paddingLeft: '36px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><HiOutlineCalendar /></div>
          <h3>No appointments found</h3>
          <p>Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Payment</th>

              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => (
                <tr key={a._id}>
                  <td>
                    <div className="flex items-center gap-sm">
                      <div className="avatar avatar-sm">
                        {a.patient?.avatar ? <img src={a.patient.avatar} alt="" /> : a.patient?.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.patient?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {a._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-sm">
                      <div className="avatar avatar-sm">
                        {a.doctor?.avatar ? <img src={a.doctor.avatar} alt="" /> : a.doctor?.name?.charAt(0)}
                      </div>
                      {a.doctor?.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{new Date(a.date).toLocaleDateString()}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatTime12h(a.timeSlot)}</div>
                  </td>
                  <td><span style={{ textTransform: 'capitalize' }}>{a.type}</span></td>
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.reason}>
                      {a.reason || 'General Checkup'}
                    </div>
                  </td>
                  <td>
                    <select
                      className={`chip chip-${a.status === 'no-show' ? 'expired' : a.status}`}
                      style={{ border: 'none', cursor: 'pointer', outline: 'none', appearance: 'none', textAlign: 'center' }}
                      value={a.status}
                      onChange={(e) => handleUpdateStatus(a._id, e.target.value)}
                    >
                      {['pending', 'confirmed', 'completed', 'cancelled', 'no-show'].map(s => (
                        <option key={s} value={s}>{s === 'no-show' ? 'Expired' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`chip chip-${a.paymentStatus === 'paid' ? 'confirmed' : 'pending'}`}>
                      {a.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
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
            <h3>Administrative Override</h3>
            <p>Are you sure you want to cancel this appointment as an administrator? This will notify both the patient and the doctor.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-ghost" onClick={() => setShowCancelModal(false)}>Keep Active</button>
              <button
                className="btn"
                style={{ background: 'var(--error)', color: 'white' }}
                onClick={confirmCancel}
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
