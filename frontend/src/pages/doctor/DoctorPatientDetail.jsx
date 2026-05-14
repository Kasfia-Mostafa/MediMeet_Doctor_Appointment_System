import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlineDocumentText, HiOutlinePlus,
  HiOutlineUser, HiOutlinePhone, HiOutlineMail, HiOutlineCalendar,
  HiOutlinePaperClip, HiOutlineDownload, HiOutlineEye,
  HiOutlineLocationMarker, HiOutlineHeart, HiOutlineClock,
  HiOutlinePencil
} from 'react-icons/hi';

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const [data, setData] = useState({ patient: null, appointments: [] });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');
  const [showForm, setShowForm] = useState(false);
  const [editRecordId, setEditRecordId] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'prescription', description: '' });
  const [files, setFiles] = useState(null);

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

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (!editRecordId) formData.append('patient', id);
      formData.append('title', form.title);
      formData.append('type', form.type);
      formData.append('description', form.description);

      if (files) {
        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });
      }

      if (editRecordId) {
        const { data: updatedRecord } = await API.put(`/records/${editRecordId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setRecords(records.map(r => r._id === editRecordId ? updatedRecord : r));
        toast.success('Record updated');
      } else {
        const { data: newRecord } = await API.post('/records', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setRecords([newRecord, ...records]);
        toast.success('Record added');
      }

      setShowForm(false);
      setEditRecordId(null);
      setForm({ title: '', type: 'prescription', description: '' });
      setFiles(null);
    } catch { toast.error(editRecordId ? 'Failed to update record' : 'Failed to add record'); }
  };

  const startEdit = (record) => {
    setForm({
      title: record.title,
      type: record.type,
      description: record.description
    });
    setEditRecordId(record._id);
    setFiles(null);
    setShowForm(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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
      <div className="card mb-xl" style={{ border: 'none', background: 'linear-gradient(135deg, var(--surface-container-highest), var(--surface-container-low))',  }}>
        <div className="flex items-center gap-xl flex-wrap">
          <div className="avatar avatar-xl" style={{ width: '100px', height: '100px', fontSize: '32px', marginRight: '20px' }}>
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

      {tab === 'profile' && (() => {
        const allPatientFiles = [];
        records.forEach(r => {
          if (r.files) {
            r.files.forEach(f => {
              allPatientFiles.push({ ...f, name: f.name || 'Medical File', source: 'Medical Record: ' + r.title, date: r.createdAt });
            });
          }
        });
        appointments.forEach(a => {
          if (a.medicalFiles) {
            a.medicalFiles.forEach(f => {
              allPatientFiles.push({ url: f.url, name: f.originalName || 'Appointment File', source: 'Appointment: ' + new Date(a.date).toLocaleDateString(), date: a.createdAt });
            });
          }
        });
        allPatientFiles.sort((a, b) => new Date(b.date) - new Date(a.date));

        return (
          <div className="flex flex-col gap-xl">
            <div className="grid grid-2">
              <div className="card" style={{ padding: '32px', borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
                <h4 className="mb-lg flex items-center gap-sm" style={{ fontSize: '18px', fontWeight: 700 }}>
                  <HiOutlineUser className="text-primary" size={24} /> Personal Information
                </h4>
                <div className="flex flex-col gap-md">
                  <div className="flex items-center gap-md p-md" style={{ background: 'var(--surface-container-low)', borderRadius: '16px', transition: 'all 0.3s ease' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HiOutlineLocationMarker size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{patient.address?.street || 'Not provided'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-md p-md" style={{ background: 'var(--surface-container-low)', borderRadius: '16px', transition: 'all 0.3s ease' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HiOutlinePhone size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emergency Contact</div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{patient.emergencyContact?.name || 'None'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{patient.emergencyContact?.phone || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '32px', borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
                <h4 className="mb-lg flex items-center gap-sm" style={{ fontSize: '18px', fontWeight: 700 }}>
                  <HiOutlineHeart className="text-error" size={24} /> Vital Statistics
                </h4>
                <div className="grid grid-2 gap-md h-full">
                  <div style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <HiOutlineHeart style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '100px', opacity: 0.05, color: '#ef4444' }} />
                    <div style={{ fontSize: '13px', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Blood Group</div>
                    <div style={{ fontSize: '42px', fontWeight: 800, color: '#991b1b', lineHeight: 1.2 }}>{patient.bloodGroup || '—'}</div>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <HiOutlineClock style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '100px', opacity: 0.05, color: '#0f766e' }} />
                    <div style={{ fontSize: '13px', color: '#0f766e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Last Visit</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#115e59', lineHeight: 1.2, marginTop: '12px' }}>{appointments[0] ? new Date(appointments[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                            <a href={file.url} download className="btn btn-ghost btn-sm" style={{ padding: '2px' }}></a>
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
            <button className="btn btn-primary btn-sm" onClick={() => {
              setEditRecordId(null);
              setForm({ title: '', type: 'prescription', description: '' });
              setShowForm(!showForm);
            }}>
              <HiOutlinePlus /> Add New Record
            </button>
          </div>

          {showForm && (
            <div className="card mb-xl">
              <h4 style={{ marginBottom: '16px' }}>{editRecordId ? 'Edit Medical Record' : 'New Medical Record'}</h4>
              <form onSubmit={handleSaveRecord}>
                <div className="grid grid-2">
                  <div className="input-group"><label>Title</label><input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                  <div className="input-group">
                    <label>Type</label>
                    <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="prescription">Prescription</option><option value="lab-result">Lab Result</option><option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="input-group"><label>Description / Notes</label><textarea className="input" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
                <div className="input-group">
                  <label>{editRecordId ? 'Attach Additional Files (Optional)' : 'Attach Files (Max 5)'}</label>
                  <input type="file" multiple className="input" onChange={e => setFiles(e.target.files)} style={{ padding: '8px' }} />
                </div>
                <div className="flex gap-md mt-md">
                  <button type="submit" className="btn btn-primary">{editRecordId ? 'Update Record' : 'Save Record'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
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
                    <div className="flex items-center gap-sm">
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(r)} style={{ padding: '4px', color: 'var(--primary)' }}>
                        <HiOutlinePencil size={16} />
                      </button>
                    </div>
                  </div>
                  <h4 style={{ marginBottom: '8px' }}>{r.title}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{r.description}</p>
                  {r.files && r.files.length > 0 && (
                    <div className="mt-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '12px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Attached Files:</strong>
                      <div className="flex flex-col gap-sm mt-sm">
                        {r.files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between px-sm py-xs" style={{ background: 'var(--surface-container-low)', borderRadius: '8px' }}>
                            <div className="flex items-center gap-sm">
                              <HiOutlineDocumentText style={{ color: 'var(--primary)', fontSize: '18px' }} />
                              <span style={{ fontSize: '13px', fontWeight: 500 }}>{file.name || `Medical File ${idx + 1}`}</span>
                            </div>
                            <div className="flex gap-xs">
                              <a href={file.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '4px', color: 'var(--primary)' }}><HiOutlineEye /></a>
                              <a href={file.url} download className="btn btn-ghost btn-sm" style={{ padding: '4px' }}></a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
