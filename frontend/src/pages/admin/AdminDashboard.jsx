import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlineCalendar, HiOutlineCurrencyBangladeshi, HiOutlineCube, HiOutlineArrowRight, HiOutlineUserAdd } from 'react-icons/hi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, doctors: 0, appointments: 0, revenue: 0, recentUsers: [] });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics. Please try again.');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2>Admin Dashboard</h2>
          <p>System overview and key metrics</p>
        </div>
        <button onClick={fetchStats} className="btn btn-ghost btn-sm" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      <div className="grid grid-4 mb-xl">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><HiOutlineUserGroup /></div>
          <div><div className="stat-value">{stats.users}</div><div className="stat-label">Total Patients</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary"><HiOutlineUserGroup /></div>
          <div><div className="stat-value">{stats.doctors}</div><div className="stat-label">Total Doctors</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success"><HiOutlineCalendar /></div>
          <div><div className="stat-value">{stats.appointments}</div><div className="stat-label">Appointments</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning"><HiOutlineCurrencyBangladeshi /></div>
          <div><div className="stat-value">৳{stats.revenue}</div><div className="stat-label">Total Revenue</div></div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h4>Recent Registrations</h4>
            <Link to="/admin/doctors" className="btn btn-ghost btn-sm">Manage Doctors <HiOutlineArrowRight /></Link>
          </div>
          {stats.recentUsers?.map(u => (
            <div key={u._id} className="flex items-center justify-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--surface-container-high)' }}>
              <div className="flex items-center gap-md">
                <div className="avatar avatar-sm">{u.name.charAt(0)}</div>
                <div><div style={{fontWeight:600,fontSize:'14px'}}>{u.name}</div><div style={{fontSize:'13px',color:'var(--text-muted)'}}>{u.email}</div></div>
              </div>
              <span className="chip chip-confirmed">{u.role}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h4>Quick Actions</h4></div>
          <div className="flex flex-col gap-md">
            <Link to="/admin/appointments" className="btn btn-primary btn-block" style={{justifyContent:'flex-start'}}><HiOutlineCalendar /> Manage Appointments</Link>
            <Link to="/admin/add-doctor" className="btn btn-secondary btn-block" style={{justifyContent:'flex-start'}}><HiOutlineUserAdd /> Add New Doctor</Link>
            <Link to="/admin/doctors" className="btn btn-secondary btn-block" style={{justifyContent:'flex-start'}}><HiOutlineUserGroup /> Manage Doctors</Link>
            <Link to="/admin/inventory" className="btn btn-secondary btn-block" style={{justifyContent:'flex-start'}}><HiOutlineCube /> Inventory Management</Link>
            <Link to="/admin/analytics" className="btn btn-secondary btn-block" style={{justifyContent:'flex-start'}}><HiOutlineCurrencyBangladeshi /> Financial Analytics</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
