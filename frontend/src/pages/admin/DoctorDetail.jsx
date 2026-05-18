import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUserAdd, HiOutlineMail, HiOutlinePhone,
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineCurrencyBangladeshi,
  HiOutlineStar, HiOutlineUser, HiOutlineBadgeCheck, HiOutlineCamera, HiOutlineStatusOnline,
  HiOutlineArrowLeft, HiOutlineTrash, HiOutlineLockClosed, HiOutlineClock, HiOutlineCalendar, HiOutlinePlus, HiOutlinePencil,
  HiOutlineEye, HiOutlineEyeOff
} from 'react-icons/hi';

const TIME_OPTIONS = (() => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    const hh = String(hour).padStart(2, '0');
    options.push(`${hh}:00`);
    options.push(`${hh}:30`);
  }
  return options;
})();

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'doctor',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    hospital: '',
    location: '',
    status: 'Active',
    timeSlots: [],
  });
  const [newSlot, setNewSlot] = useState({ day: 'monday', startTime: '09:00', endTime: '17:00', maxPatients: 10 });
  const [availableDays, setAvailableDays] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await API.get(`/admin/staff/${id}`);
        setUserId(data.user?._id);
        setForm({
          name: data.user?.name || '',
          email: data.user?.email || '',
          phone: data.user?.phone || '',
          password: '',
          role: 'doctor',
          specialization: data.specialization || '',
          qualification: data.qualification || '',
          experience: data.experience || '',
          consultationFee: data.consultationFee || '',
          hospital: data.hospital || '',
          location: data.location || '',
          status: data.isAvailable ? 'Active' : 'Inactive',
          timeSlots: data.timeSlots || [],
        });
        setAvailableDays(data.availableDays || []);
        setNewSlot(prev => ({ ...prev, day: data.availableDays?.[0] || 'monday' }));
        console.log('Fetched Doctor Data:', data);
        console.log('Time Slots in state:', data.timeSlots);
        setPreview(data.user?.avatar || null);
      } catch (err) {
        toast.error('Failed to fetch doctor details');
        navigate('/admin/doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) return toast.error('Enter start and end times');
    if (availableDays.length === 0) return toast.error('Select at least one available day first');
    setForm(prev => ({ ...prev, timeSlots: [...prev.timeSlots, { ...newSlot }] }));
    setNewSlot(prev => ({ ...prev, startTime: '09:00', endTime: '17:00' }));
  };

  const removeSlot = (index) => {
    const slots = [...form.timeSlots];
    slots.splice(index, 1);
    setForm({ ...form, timeSlots: slots });
  };

  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      const updatedDays = availableDays.filter(d => d !== day);
      setAvailableDays(updatedDays);
      setForm(prev => ({
        ...prev,
        timeSlots: prev.timeSlots.filter(slot => slot.day !== day)
      }));
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'status') {
        formData.append('isAvailable', form.status === 'Active');
      } else if (key === 'password') {
        if (form.password) formData.append('password', form.password);
      } else if (key === 'timeSlots') {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    });

    formData.append('availableDays', JSON.stringify(availableDays));

    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      console.log('Updating Doctor with ID:', userId);
      console.log('Sending Time Slots:', JSON.stringify(form.timeSlots));
      const { data: updatedData } = await API.put(`/admin/staff/${userId}`, formData);
      console.log('Update Response Data:', updatedData);
      toast.success('Doctor updated successfully!');
      navigate('/admin/doctors');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setSaving(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const executeDelete = async () => {
    try {
      await API.delete(`/admin/staff/${userId}`);
      toast.success('Doctor removed successfully');
      navigate('/admin/doctors');
    } catch (err) {
      toast.error('Failed to remove doctor');
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <details style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px' }}>
        <summary>Debug Data (Slots: {form.timeSlots?.length || 0})</summary>
        <pre>{JSON.stringify(form.timeSlots, null, 2)}</pre>
      </details>
      {/* Premium Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '32px',
            animation: 'slideUp 0.3s ease-out',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px', height: '64px',
                backgroundColor: 'rgba(var(--error-rgb, 220, 53, 69), 0.1)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--error)'
              }}>
                <HiOutlineTrash style={{ fontSize: '32px' }} />
              </div>
            </div>

            <h3 style={{ textAlign: 'center', marginBottom: '12px', color: 'var(--text-primary)' }}>Remove Doctor?</h3>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.5' }}>
              Are you sure you want to permanently remove <strong>{form.name}</strong> from the system? This action cannot be undone and all associated records will be deleted.
            </p>

            <div className="flex gap-md">
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px' }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{ flex: 1, padding: '12px', backgroundColor: 'var(--error)', color: 'white', border: 'none' }}
                onClick={executeDelete}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header flex items-center justify-between">
        <div className="flex items-center gap-md">
          <button onClick={() => navigate('/admin/doctors')} className="btn btn-ghost btn-sm">
            <HiOutlineArrowLeft style={{ fontSize: '20px' }} />
          </button>
          <div>
            <h2>Doctor Profile</h2>
            <p>View and manage {form.name}'s details</p>
          </div>
        </div>
        <button onClick={() => setShowDeleteModal(true)} className="btn" style={{ backgroundColor: 'var(--error)', color: '#fff', border: 'none', fontWeight: 600 }}>
          <HiOutlineTrash /> Remove Doctor
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        {/* Account Information Section */}
        <div className="card mb-lg" style={{ padding: '32px' }}>
          <div className="flex items-center gap-sm mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px' }}>
            <HiOutlineUser style={{ fontSize: '24px', color: 'var(--primary)' }} />
            <h3 style={{ margin: 0 }}>Account Information</h3>
          </div>

          <div className="flex flex-col items-center mb-lg">
            <div
              className="avatar-preview"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-container-highest)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                border: '4px solid var(--surface-container-highest)',
                marginBottom: '16px'
              }}
            >
              {preview ? (
                <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <HiOutlineUser style={{ fontSize: '48px', color: 'var(--text-muted)' }} />
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current.click()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <HiOutlineCamera /> Update Photo
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineUser style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="name" className="input" value={form.name} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineMail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" name="email" className="input" value={form.email} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <HiOutlinePhone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" name="phone" className="input" value={form.phone} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
            <div className="input-group">
              <label>New Password (Optional)</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  className="input"
                  placeholder="Leave blank to keep current"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details Section */}
        <div className="card mb-lg" style={{ padding: '32px' }}>
          <div className="flex items-center gap-sm mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px' }}>
            <HiOutlineBadgeCheck style={{ fontSize: '24px', color: 'var(--primary)' }} />
            <h3 style={{ margin: 0 }}>Professional Details</h3>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>Specialization</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineBriefcase style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="specialization" className="input" value={form.specialization} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Qualification</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineAcademicCap style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="qualification" className="input" value={form.qualification} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>Experience (Years)</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineStar style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="number" name="experience" className="input" value={form.experience} onChange={handleChange} required min="0" style={{ paddingLeft: '40px' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Consultation Fee (BDT)</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineCurrencyBangladeshi style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="number" name="consultationFee" className="input" value={form.consultationFee} onChange={handleChange} required min="0" style={{ paddingLeft: '40px' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>Hospital Name</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineBriefcase style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="hospital" className="input" value={form.hospital} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Hospital Location</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineStatusOnline style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="location" className="input" value={form.location} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
          </div>

          <div className="input-group" style={{ maxWidth: '300px' }}>
            <label>Status</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineStatusOnline style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select name="status" className="input" value={form.status} onChange={handleChange} required style={{ paddingLeft: '40px' }}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Availability & Slots Section */}
        <div className="card mb-lg" style={{ padding: '32px' }}>
          <div className="flex items-center gap-sm mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px' }}>
            <HiOutlineCalendar style={{ fontSize: '24px', color: 'var(--primary)' }} />
            <h3 style={{ margin: 0 }}>Weekly Scheduling Slots ({form.timeSlots?.filter(ts => availableDays.includes(ts.day)).length || 0})</h3>
          </div>

          <h4 style={{ marginBottom: '16px' }}>Available Days</h4>
          <div className="flex flex-wrap gap-sm mb-lg">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
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
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Day</label>
                  <select className="input" value={newSlot.day} onChange={e => setNewSlot({ ...newSlot, day: e.target.value })}>
                    {availableDays.map(d => <option key={d} value={d} style={{ textTransform: 'capitalize' }}>{d}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Start Time (24h)</label>
                  <select className="input" value={newSlot.startTime} onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}>
                    {TIME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>End Time (24h)</label>
                  <select className="input" value={newSlot.endTime} onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}>
                    {TIME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <button type="button" className="btn btn-secondary btn-block" onClick={addSlot}>Add Slot</button>
                </div>
              </div>

              {form.timeSlots.filter(ts => availableDays.includes(ts.day)).length > 0 ? (
                <div className="table-wrapper mb-lg">
                  <table>
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.timeSlots.filter(ts => availableDays.includes(ts.day)).map((ts, i) => (
                        <tr key={i}>
                          <td style={{ textTransform: 'capitalize' }}>{ts.day}</td>
                          <td>{ts.startTime} - {ts.endTime}</td>
                          <td>
                            <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => removeSlot(form.timeSlots.indexOf(ts))}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-lg p-lg text-center" style={{ border: '1px dashed var(--outline-variant)', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>No scheduling slots configured yet.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-md" style={{ padding: '16px 0' }}>
          <button type="button" onClick={() => navigate('/admin/doctors')} className="btn btn-secondary" style={{ padding: '12px 32px' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '12px 32px' }}>
            {saving ? 'Updating...' : 'Update Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
