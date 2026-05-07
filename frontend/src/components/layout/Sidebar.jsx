import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HiOutlineViewGrid, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineCreditCard,
  HiOutlineHeart, HiOutlineUsers, HiOutlineCog, HiOutlineClipboardList,
  HiOutlineClock, HiOutlineUserGroup, HiOutlineChartBar, HiOutlineCube,
  HiOutlineLogout, HiOutlineBriefcase, HiOutlineAdjustments, HiOutlineChatAlt2,
  HiOutlineUserCircle, HiOutlineCurrencyBangladeshi
} from 'react-icons/hi';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const adminSections = [
    {
      label: 'Main Menu',
      icon: <HiOutlineViewGrid />,
      links: [
        { to: '/admin/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
        { to: '/admin/appointments', icon: <HiOutlineCalendar />, label: 'Manage Appointments' },
      ]
    },
    {
      label: 'Medical Management',
      icon: <HiOutlineBriefcase />,
      links: [
        { to: '/admin/doctors', icon: <HiOutlineUserGroup />, label: 'Manage Doctors' },
        { to: '/admin/users', icon: <HiOutlineUsers />, label: 'Global Users' },
      ]
    },
    {
      label: 'System Operations',
      icon: <HiOutlineAdjustments />,
      links: [
        { to: '/admin/analytics', icon: <HiOutlineChartBar />, label: 'System Analytics' },
        { to: '/admin/articles', icon: <HiOutlineDocumentText />, label: 'Medical Articles' },
      ]
    }
  ];

  const doctorSections = [
    {
      label: 'Clinical Menu',
      links: [
        { to: '/doctor/dashboard', icon: <HiOutlineViewGrid />, label: 'Overview' },
        { to: '/doctor/appointments', icon: <HiOutlineCalendar />, label: 'Manage Appointments' },
        { to: '/doctor/patients', icon: <HiOutlineClipboardList />, label: 'Patient Directory' },
        { to: '/doctor/schedule', icon: <HiOutlineClock />, label: 'My Schedule' },
      ]
    },
    {
      label: 'Performance & Growth',
      links: [
        { to: '/doctor/reviews', icon: <HiOutlineChatAlt2 />, label: 'Patient Reviews' },
        { to: '/doctor/earnings', icon: <HiOutlineCurrencyBangladeshi />, label: 'Earnings & Revenue' },
      ]
    }
  ];

  const patientSections = [
    {
      label: 'My Health',
      links: [
        { to: '/patient/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
        { to: '/patient/appointments', icon: <HiOutlineCalendar />, label: 'Appointments' },
        { to: '/patient/records', icon: <HiOutlineDocumentText />, label: 'Medical Records' },
      ]
    },
    {
      label: 'Care & Wellness',
      links: [
        { to: '/patient/wellness', icon: <HiOutlineHeart />, label: 'Wellness Tracker' },
        { to: '/patient/family', icon: <HiOutlineUsers />, label: 'Family Members' },
      ]
    },
    {
      label: 'Financials',
      links: [
        { to: '/patient/billing', icon: <HiOutlineCreditCard />, label: 'Billing & Payments' },
      ]
    }
  ];


  return (
    <aside className="sidebar">


      <div className="sidebar-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {user?.role === 'admin' ? (
          adminSections.map((section, sIdx) => (
            <div key={sIdx} className="sidebar-section" style={{ marginBottom: '24px' }}>
              <div className="sidebar-label" style={{
                fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '16px'
              }}>
                {section.label}
              </div>
              {section.links.map(link => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          ))
        ) : user?.role === 'doctor' ? (
          doctorSections.map((section, sIdx) => (
            <div key={sIdx} className="sidebar-section" style={{ marginBottom: '24px' }}>
              <div className="sidebar-label" style={{
                fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '16px'
              }}>
                {section.label}
              </div>
              {section.links.map(link => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          ))
        ) : (
          patientSections.map((section, sIdx) => (
            <div key={sIdx} className="sidebar-section" style={{ marginBottom: '24px' }}>
              <div className="sidebar-label" style={{
                fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '16px'
              }}>
                {section.label}
              </div>
              {section.links.map(link => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer" style={{ marginTop: 'auto', borderTop: '1px solid var(--outline-variant)', paddingTop: '12px' }}>
        <Link
          to={user?.role === 'admin' ? '/admin/adminprofile' : (user?.role === 'doctor' ? '/doctor/doctorprofile' : '/patient/patientprofile')}
          className="sidebar-profile-link"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
            textDecoration: 'none', color: 'inherit', borderRadius: '12px', transition: 'all 0.2s'
          }}
        >
          <div className="avatar avatar-sm">
            {user?.avatar ? <img src={user.avatar} alt="" /> : user?.name?.charAt(0)}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>View Profile</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
