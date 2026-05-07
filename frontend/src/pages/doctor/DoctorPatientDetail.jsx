import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  HiOutlineArrowLeft, HiOutlineDocumentText, HiOutlinePlus, 
  HiOutlineUser, HiOutlinePhone, HiOutlineMail, HiOutlineCalendar,
  HiOutlinePaperClip, HiOutlineDownload, HiOutlineEye
} from 'react-icons/hi';

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const [data, setData] = useState({ patient: null, appointments: [] });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'prescription', description: '', diagnosis: '' });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [detailRes, recordsRes] = await Promise.all([
          API.get(`/doctors/patients/${id}`),
          API.get(`/records`, { params: { patient: id } })
        ]);
        setData(detailRes.data);
        setRecords(recordsRes.data || []);
      } catch (err) {
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      const { data: newRecord } = await API.post('/records', { ...form, patient: id });
      setRecords([newRecord, ...records]);
      setShowAddRecord(false);
      setForm({ title: '', type: 'prescription', description: '', diagnosis: '' });
      toast.success('Record added');
    } catch { toast.error('Failed to add record'); }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!data.patient) return <div className="container py-xl text-center"><h3>Patient not found</h3></div>;

  const { patient, appointments } = data;

  return (
    <div className="fade-in">
      <div className="mb-md">
        <Link to="/doctor/patients" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          <HiOutlineArrowLeft /> Back to Patients
        </Link>
      </div>
      
      {/* Patient Profile Header */}
      <div className="card mb-xl" style={{ border: 'none', background: 'linear-gradient(135deg, var(--surface-container-highest), var(--surface-container-low))' }}>
        <div className="flex items-center gap-xl flex-wrap">
          <div className="avatar avatar-xl" style={{ width: '100px', height: '100px', fontSize: '32px' }}>
            {patient.avatar ? <img src={patient.avatar} alt="" /> : patient.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-md mb-xs">
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>{patient.name}</h2>
              <span className="chip chip-confirmed">{patient.bloodGroup || 'O+'}</span>
            </div>
            <div className="flex flex-wrap gap-lg mt-md">
              <div className="flex items-center gap-xs text-muted" style={{ fontSize: '14px' }}>
                <HiOutlineMail /> {patient.email}
              </div>
              <div className="flex items-center gap-xs text-muted" style={{ fontSize: '14px' }}>
                <HiOutlinePhone /> {patient.phone || 'No phone'}
              </div>
              <div className="flex items-center gap-xs text-muted" style={{ fontSize: '14px' }}>
                <HiOutlineUser /> {patient.gender || 'Not specified'} • {patient.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years` : 'Age unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-xl">
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Medical Profile</button>
        <button className={`tab ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}>Appointment History</button>
        <button className={`tab ${tab === 'records' ? 'active' : ''}`} onClick={() => setTab('records')}>File Records</button>
      </div>

      {tab === 'profile' && (
        <div className="grid grid-2">
          <div className="card">
            <h4 className="mb-md">Personal Information</h4>
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between py-xs" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <span className="text-muted">Address</span>
                <strong>{patient.address?.street || 'Not provided'}</strong>
              </div>
              <div className="flex justify-between py-xs" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <span className="text-muted">Emergency Contact</span>
                <strong>{patient.emergencyContact?.name || 'None'} ({patient.emergencyContact?.phone || 'N/A'})</strong>
              </div>
            </div>
          </div>
          <div className="card">
            <h4 className="mb-md">Vital Statistics</h4>
            <div className="grid grid-2 gap-md">
              <div className="stat-card" style={{ background: 'var(--surface-container-low)', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Blood Group</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{patient.bloodGroup || '—'}</div>
              </div>
              <div className="stat-card" style={{ background: 'var(--surface-container-low)', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last Visit</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--secondary)' }}>{appointments[0] ? new Date(appointments[0].date).toLocaleDateString() : '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'appointments' && (
        <div className="card">
          <h4 className="mb-lg">Visit History & Attached Files</h4>
          {appointments.length === 0 ? (
            <div className="empty-state">No appointments found.</div>
          ) : (
            <div className="flex flex-col gap-lg">
              {appointments.map((appt) => (
                <div key={appt._id} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '20px', paddingBottom: '10px' }}>
                  <div className="flex items-center justify-between mb-sm">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>{new Date(appt.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{appt.timeSlot} • {appt.type.toUpperCase()}</div>
                    </div>
                    <span className={`chip chip-${appt.status}`}>{appt.status}</span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Reason:</strong> {appt.reason}</p>
                  
                  {appt.medicalFiles?.length > 0 && (
                    <div className="flex flex-wrap gap-sm mt-md">
                      {appt.medicalFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-sm px-sm py-xs" style={{ background: 'var(--surface-container-highest)', borderRadius: '8px', fontSize: '12px' }}>
                          <HiOutlinePaperClip />
                          <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.originalName || 'Medical File'}</span>
                          <div className="flex gap-xs">
                            <a href={file.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '2px', color: 'var(--primary)' }}><HiOutlineEye /></a>
                            <a href={file.url} download className="btn btn-ghost btn-sm" style={{ padding: '2px' }}><HiOutlineDownload /></a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'records' && (
        <>
          <div className="flex items-center justify-between mb-lg">
            <h4 style={{ margin: 0 }}>Patient File Records</h4>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddRecord(!showAddRecord)}>
              <HiOutlinePlus /> Add New Record
            </button>
          </div>

          {showAddRecord && (
            <div className="card mb-xl">
              <h4 style={{ marginBottom: '16px' }}>New Medical Record</h4>
              <form onSubmit={handleAddRecord}>
                <div className="grid grid-2">
                  <div className="input-group"><label>Title</label><input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                  <div className="input-group">
                    <label>Type</label>
                    <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="prescription">Prescription</option><option value="diagnosis">Diagnosis</option><option value="lab-result">Lab Result</option><option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="input-group"><label>Diagnosis (Optional)</label><input className="input" value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} /></div>
                <div className="input-group"><label>Description / Notes</label><textarea className="input" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
                <div className="flex gap-md">
                  <button type="submit" className="btn btn-primary">Save Record</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddRecord(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {records.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><HiOutlineDocumentText /></div><h3>No medical records</h3></div>
          ) : (
            <div className="grid grid-2">
              {records.map(r => (
                <div className="card" key={r._id}>
                  <div className="flex items-center justify-between mb-md">
                    <span className="chip chip-confirmed">{r.type}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 style={{ marginBottom: '8px' }}>{r.title}</h4>
                  {r.diagnosis && <p style={{ fontSize: '14px', marginBottom: '8px' }}><strong>Diagnosis:</strong> {r.diagnosis}</p>}
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{r.description}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
