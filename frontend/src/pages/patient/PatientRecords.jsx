import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { HiOutlineDocumentText } from 'react-icons/hi';

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = typeFilter !== 'all' ? { type: typeFilter } : {};
        const { data } = await API.get('/records', { params });
        setRecords(data || []);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [typeFilter]);

  const types = ['all', 'prescription', 'lab-result'];

  return (
    <div className="fade-in">
      <div className="page-header"><h2>Medical Records</h2><p>Access your complete medical history</p></div>

      <div className="tabs">
        {types.map(t => <button key={t} className={`tab ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t === 'all' ? 'All' : t.replace('-', ' ')}</button>)}
      </div>

      {loading ? <div className="loader"><div className="spinner"></div></div> : records.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"><HiOutlineDocumentText /></div><h3>No records found</h3><p>Your medical records will appear here after your appointments.</p></div>
      ) : (
        <div className="grid grid-2">
          {records.map((r) => (
            <div className="card" key={r._id}>
              <div className="flex items-center justify-between mb-md">
                <span className={`chip chip-confirmed`}>{r.type}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>{r.title}</h4>
              {r.description && <p style={{ fontSize: '14px', marginBottom: '8px' }}>{r.description}</p>}
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>By {r.doctor?.name}</div>
              {r.vitals && Object.keys(r.vitals).some(k => r.vitals[k]) && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius)', fontSize: '13px' }}>
                  <strong>Vitals:</strong>
                  <div className="flex flex-wrap gap-md mt-sm">
                    {r.vitals.bloodPressure && <span>BP: {r.vitals.bloodPressure}</span>}
                    {r.vitals.heartRate && <span>HR: {r.vitals.heartRate} bpm</span>}
                    {r.vitals.temperature && <span>Temp: {r.vitals.temperature}°F</span>}
                  </div>
                </div>
              )}
              {r.files && r.files.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <strong style={{ fontSize: '13px' }}>Files:</strong>
                  <div className="flex flex-col gap-sm mt-sm">
                    {r.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-sm"
                        style={{ padding: '8px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 500 }}
                      >
                        <HiOutlineDocumentText size={16} /> {file.name || `File ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
