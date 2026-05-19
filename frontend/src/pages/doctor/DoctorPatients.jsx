import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { HiOutlineUserGroup, HiOutlineSearch } from 'react-icons/hi';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/doctors/patients')
      .then(({ data }) => setPatients(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = patients.filter(p => 
    p.patient?.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.patient?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2>My Patients</h2>
          <p>Directory of all your patients</p>
        </div>
        <div className="search-bar">
          <HiOutlineSearch className="search-icon" />
          <input type="text" className="input" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="loader"><div className="spinner"></div></div> : filteredPatients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><HiOutlineUserGroup /></div>
          <h3>No patients found</h3>
          <p>{search ? 'Try a different search term.' : 'You have not consulted with any patients yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredPatients.map((p) => (
            <Link to={`/doctor/patients/${p.patient._id}`} key={p.patient._id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="flex items-center gap-md mb-md">
                <div className="avatar avatar-lg">
                  {p.patient?.avatar ? <img src={p.patient.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : p.patient?.name?.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{p.patient?.name}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.patient?.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-sm" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                <div><strong>Total Visits:</strong> {p.totalVisits}</div>
                <div><strong>Last Visit:</strong> {new Date(p.lastVisit).toLocaleDateString()}</div>
                {p.patient?.bloodGroup && <div><strong>Blood Group:</strong> {p.patient.bloodGroup}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
