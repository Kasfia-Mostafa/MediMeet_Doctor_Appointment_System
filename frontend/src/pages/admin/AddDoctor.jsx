import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  HiOutlineUserAdd, HiOutlineMail, HiOutlineLockClosed, HiOutlinePhone, 
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineCurrencyBangladeshi,
  HiOutlineStar, HiOutlineUser, HiOutlineBadgeCheck, HiOutlineCamera, HiOutlineStatusOnline,
  HiOutlineClock, HiOutlineTrash, HiOutlineCalendar, HiOutlinePlus,
  HiOutlineEye, HiOutlineEyeOff
} from 'react-icons/hi';

export default function AddDoctor() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
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
  const [newSlot, setNewSlot] = useState({ day: 'monday', startTime: '09:00', endTime: '13:00', maxPatients: 10 });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSlot = () => {
    setForm({ ...form, timeSlots: [...form.timeSlots, newSlot] });
  };

  const removeSlot = (index) => {
    const slots = [...form.timeSlots];
    slots.splice(index, 1);
    setForm({ ...form, timeSlots: slots });
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
    setLoading(true);
    
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'status') {
        formData.append('isAvailable', form.status === 'Active');
      } else if (key === 'timeSlots') {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    });
    
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      await API.post('/admin/staff', formData);
      toast.success('Doctor added successfully!');
      navigate('/admin/doctors');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Add New Doctor</h2>
        <p>Create a new doctor profile and set up system access</p>
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
              className="avatar-upload" 
              onClick={() => fileInputRef.current.click()}
              style={{
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--surface-container-highest)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                border: '2px dashed var(--outline)'
              }}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <HiOutlineCamera style={{ fontSize: '24px', marginBottom: '4px' }} />
                  <span style={{ fontSize: '10px', textAlign: 'center' }}>Add Photo</span>
                </div>
              )}
            </div>
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
                <HiOutlineUserAdd style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="name" className="input" placeholder="Dr. John Doe" value={form.name} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineMail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" name="email" className="input" placeholder="doctor@example.com" value={form.email} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type={showPass ? "text" : "password"} 
                  name="password" 
                  className="input" 
                  placeholder="••••••••" 
                  value={form.password} 
                  onChange={handleChange} 
                  required 
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
            <div className="input-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <HiOutlinePhone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" name="phone" className="input" placeholder="+880 1XXX-XXXXXX" value={form.phone} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
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
                <input type="text" name="specialization" className="input" placeholder="e.g. Cardiology" value={form.specialization} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Qualification</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineAcademicCap style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="qualification" className="input" placeholder="e.g. MBBS, MD" value={form.qualification} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>Experience (Years)</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineStar style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="number" name="experience" className="input" placeholder="5" value={form.experience} onChange={handleChange} required min="0" style={{ paddingLeft: '40px' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Consultation Fee (BDT)</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineCurrencyBangladeshi style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="number" name="consultationFee" className="input" placeholder="500" value={form.consultationFee} onChange={handleChange} required min="0" style={{ paddingLeft: '40px' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>Hospital Name</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineBriefcase style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="hospital" className="input" placeholder="e.g. Dhaka Medical College" value={form.hospital} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Hospital Location</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineStatusOnline style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="location" className="input" placeholder="e.g. Dhanmondi, Dhaka" value={form.location} onChange={handleChange} required style={{ paddingLeft: '40px' }} />
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
            <h3 style={{ margin: 0 }}>Weekly Scheduling Slots</h3>
          </div>



          <div style={{ background: 'var(--surface-container-low)', padding: '24px', borderRadius: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Add Scheduling Slots</h4>
            <div className="grid grid-3 items-end" style={{ gap: '16px' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px' }}>Day</label>
                <select 
                  className="input" 
                  value={newSlot.day} 
                  onChange={e => setNewSlot({...newSlot, day: e.target.value})}
                >
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px' }}>Start Time</label>
                <input 
                  type="time" 
                  className="input" 
                  value={newSlot.startTime} 
                  onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
                />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px' }}>End Time</label>
                <input 
                  type="time" 
                  className="input" 
                  value={newSlot.endTime} 
                  onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
                />
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary mt-md" 
              onClick={addSlot}
              style={{ width: '100%', borderStyle: 'dashed' }}
            >
              <HiOutlinePlus /> Add This Slot
            </button>
          </div>

          {form.timeSlots.length > 0 && (
            <div className="mt-lg">
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-muted)' }}>Current Slots</h4>
              <div className="flex flex-col gap-sm">
                {form.timeSlots.map((slot, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between"
                    style={{ 
                      padding: '12px 20px', 
                      background: 'var(--surface-container-lowest)', 
                      borderRadius: '12px',
                      border: '1px solid var(--outline-variant)'
                    }}
                  >
                    <div className="flex items-center gap-md">
                      <span style={{ fontWeight: 700, textTransform: 'capitalize', minWidth: '80px' }}>{slot.day}</span>
                      <div className="flex items-center gap-xs" style={{ color: 'var(--primary)' }}>
                        <HiOutlineClock />
                        <span style={{ fontWeight: 600 }}>{slot.startTime} - {slot.endTime}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeSlot(index)}
                      style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end" style={{ padding: '16px 0' }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px 32px' }}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}


