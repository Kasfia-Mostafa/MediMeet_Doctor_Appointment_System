import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineFilter, HiOutlineSearch, HiOutlineClock, HiOutlineTrendingUp } from 'react-icons/hi';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all'); // all, today, tomorrow, specific
  const [specificDate, setSpecificDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = { limit: 100 };
        if (filterStatus !== 'all') params.status = filterStatus;
        
        const { data } = await API.get('/appointments', { params });
        setAppointments(data.appointments || []);
      } catch (err) {
        toast.error('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filterStatus]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success('Status updated successfully');
    } catch {
      toast.error('Update failed');
    }
  };

  const getFilteredAppointments = () => {
    let filtered = [...appointments];

    // Status filter is handled by API call (useEffect), but we can double check here
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    // Date Filter
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (filterDate === 'today') {
      filtered = filtered.filter(a => {
        const d = new Date(a.date);
        d.setHours(0,0,0,0);
        return d.getTime() === today.getTime();
      });
    } else if (filterDate === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(a => {
        const d = new Date(a.date);
        d.setHours(0,0,0,0);
        return d.getTime() === tomorrow.getTime();
      });
    } else if (filterDate === 'specific' && specificDate) {
      const spec = new Date(specificDate);
      spec.setHours(0,0,0,0);
      filtered = filtered.filter(a => {
        const d = new Date(a.date);
        d.setHours(0,0,0,0);
        return d.getTime() === spec.getTime();
      });
    }

    // Search
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredAppts = getFilteredAppointments();

  // Calculate stats for the selected day
  const dailyStats = {
    total: filteredAppts.length,
    pending: filteredAppts.filter(a => a.status === 'pending').length,
    confirmed: filteredAppts.filter(a => a.status === 'confirmed').length,
    completed: filteredAppts.filter(a => a.status === 'completed').length,
  };

  const tabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2>Manage Appointments</h2>
          <p>Review, filter and update your patient consultation schedule</p>
        </div>
        <div className="flex gap-md">
          <div className="stat-card" style={{ padding: '12px 20px', minWidth: '140px' }}>
            <div className="stat-label" style={{ fontSize: '11px' }}>Daily Load</div>
            <div className="stat-value" style={{ fontSize: '20px' }}>{dailyStats.total} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>sessions</span></div>
          </div>
        </div>
      </div>

      <div className="card mb-xl">
        <div className="flex flex-col gap-lg">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div className="tabs" style={{ marginBottom: 0 }}>
              {tabs.map(t => (
                <button key={t} className={`tab ${filterStatus === t ? 'active' : ''}`} onClick={() => setFilterStatus(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="search-box" style={{ maxWidth: '300px', width: '100%', position: 'relative' }}>
              <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" placeholder="Search patient or reason..." className="input" 
                style={{ paddingLeft: '36px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '20px' }}>
            <div className="flex items-center gap-md flex-wrap">
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter by Date:</span>
              <div className="flex gap-xs">
                {['all', 'today', 'tomorrow', 'specific'].map(d => (
                  <button 
                    key={d} 
                    className={`btn btn-sm ${filterDate === d ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilterDate(d)}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
              {filterDate === 'specific' && (
                <input 
                  type="date" className="input" style={{ width: 'auto', height: '36px', padding: '0 12px' }}
                  value={specificDate} onChange={(e) => setSpecificDate(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? <div className="loader"><div className="spinner"></div></div> : filteredAppts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><HiOutlineCalendar /></div>
          <h3>No appointments found</h3>
          <p>You don't have any appointments matching these filters.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppts.map((a) => (
                <tr key={a._id} className="hover-row">
                  <td>
                    <div className="flex items-center gap-sm">
                      <div className="avatar avatar-sm">{a.patient?.avatar ? <img src={a.patient.avatar} alt="" /> : a.patient?.name?.charAt(0)}</div>
                      <div style={{ fontWeight: 600 }}>{a.patient?.name}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{new Date(a.date).toLocaleDateString()}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><HiOutlineClock style={{ display: 'inline', marginRight: '4px' }} />{a.timeSlot}</div>
                  </td>
                  <td style={{ fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</td>
                  <td>
                    <select 
                      className={`chip chip-${a.status}`} 
                      style={{ border: 'none', cursor: 'pointer', outline: 'none', appearance: 'none', textAlign: 'center', fontSize: '11px' }}
                      value={a.status}
                      onChange={(e) => handleUpdateStatus(a._id, e.target.value)}
                    >
                      {tabs.slice(1).map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`chip chip-${a.paymentStatus === 'paid' ? 'confirmed' : 'pending'}`}>
                      {a.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }} onClick={() => window.location.href=`/doctor/patients/${a.patient?._id}`}>
                      View Records
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
