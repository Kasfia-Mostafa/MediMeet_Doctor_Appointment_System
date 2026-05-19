import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { HiOutlineDocumentText, HiOutlineEye, HiOutlineDownload, HiOutlineX, HiOutlineCalendar, HiOutlineUser } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params = typeFilter !== 'all' ? { type: typeFilter } : {};
        const { data } = await API.get('/records', { params });
        setRecords(data || []);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast.error('Failed to fetch records');
      } finally { setLoading(false); }
    };
    fetch();
  }, [typeFilter]);

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'medical-record-file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Fallback to opening in new tab if fetch fails (CORS)
      window.open(url, '_blank');
    }
  };

  const types = ['all', 'prescription', 'lab-result', 'other'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Medical Records</h2>
        <p>Access your complete medical history and clinical documents</p>
      </div>

      <div className="tabs" style={{ marginBottom: '32px' }}>
        {types.map(t => (
          <button
            key={t}
            className={`tab ${typeFilter === t ? 'active' : ''}`}
            onClick={() => setTypeFilter(t)}
            style={{ textTransform: 'capitalize' }}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><HiOutlineDocumentText /></div>
          <h3>No records found</h3>
          <p>Your medical records will appear here after your clinical consultations.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {records.map((r) => (
            <div className="card" key={r._id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex items-center justify-between mb-md">
                <span className={`chip chip-${r.type === 'prescription' ? 'confirmed' : 'in-progress'}`} style={{ fontSize: '11px' }}>
                  {r.type.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-sm" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  <HiOutlineCalendar /> {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>

              <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{r.title}</h4>
              <div className="flex items-center gap-sm mb-md" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                <HiOutlineUser /> <span>By {r.doctor?.name}</span>
              </div>

              {r.description && (
                <p style={{ fontSize: '14px', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {r.description}
                </p>
              )}

              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={() => setSelectedRecord(r)}
                >
                  <HiOutlineEye /> View Details
                </button>
                {r.files && r.files.length > 0 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    title="Quick Download"
                    onClick={() => handleDownload(r.files[0].url, r.files[0].name)}
                  >
                    <HiOutlineDownload />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <span className="chip chip-confirmed mb-sm">{selectedRecord.type.replace('-', ' ')}</span>
                <h3>{selectedRecord.title}</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedRecord(null)}>
                <HiOutlineX size={24} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="flex items-center justify-between" style={{ padding: '16px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-md">
                  <div className="avatar">
                    {selectedRecord.doctor?.avatar ? <img src={selectedRecord.doctor.avatar} alt="" /> : selectedRecord.doctor?.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Dr. {selectedRecord.doctor?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Consulting Physician</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date Issued</div>
                  <div style={{ fontWeight: 600 }}>{new Date(selectedRecord.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                </div>
              </div>

              {selectedRecord.description && (
                <div>
                  <h5 style={{ marginBottom: '8px', fontSize: '15px' }}>Clinical Summary</h5>
                  <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{selectedRecord.description}</p>
                </div>
              )}

              {selectedRecord.vitals && Object.keys(selectedRecord.vitals).some(k => selectedRecord.vitals[k]) && (
                <div style={{ padding: '20px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)' }}>
                  <h5 style={{ marginBottom: '12px', fontSize: '15px' }}>Vital Signs</h5>
                  <div className="grid grid-3">
                    {selectedRecord.vitals.bloodPressure && (
                      <div className="stat-item">
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Blood Pressure</div>
                        <div style={{ fontWeight: 700 }}>{selectedRecord.vitals.bloodPressure}</div>
                      </div>
                    )}
                    {selectedRecord.vitals.heartRate && (
                      <div className="stat-item">
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Heart Rate</div>
                        <div style={{ fontWeight: 700 }}>{selectedRecord.vitals.heartRate} bpm</div>
                      </div>
                    )}
                    {selectedRecord.vitals.temperature && (
                      <div className="stat-item">
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Temperature</div>
                        <div style={{ fontWeight: 700 }}>{selectedRecord.vitals.temperature}°F</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                <div>
                  <h5 style={{ marginBottom: '12px', fontSize: '15px' }}>Prescribed Medications</h5>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRecord.medications.map((med, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{med.name}</td>
                            <td>{med.dosage}</td>
                            <td>{med.frequency}</td>
                            <td>{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedRecord.files && selectedRecord.files.length > 0 && (
                <div>
                  <h5 style={{ marginBottom: '12px', fontSize: '15px' }}>Attachments ({selectedRecord.files.length})</h5>
                  <div className="flex flex-col gap-sm">
                    {selectedRecord.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                        style={{ padding: '12px 16px', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-md)' }}
                      >
                        <div className="flex items-center gap-md">
                          <HiOutlineDocumentText size={20} color="var(--primary)" />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{file.name || `Document ${idx + 1}`}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{file.type || 'PDF Document'}</div>
                          </div>
                        </div>
                        <div className="flex gap-sm">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            title="View"
                          >
                            <HiOutlineEye />
                          </a>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDownload(file.url, file.name)}
                            title="Download"
                          >
                            <HiOutlineDownload />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: '32px' }}>
              <button className="btn btn-secondary btn-block" onClick={() => setSelectedRecord(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
