import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import StripeCheckout from '../../components/payment/StripeCheckout';

const STEPS = ['Schedule', 'Details', 'Review'];

const formatTime12h = (time24) => {
  if (!time24 || typeof time24 !== 'string') return '';
  const [hourStr, minute] = time24.split(':');
  if (!hourStr || !minute) return time24;
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [selectedDoctor] = useState(searchParams.get('doctor') || '');
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [form, setForm] = useState({
    date: '', timeSlot: '', type: 'in-person',
    reason: '', symptoms: '', patientNotes: '', familyMember: '',
  });
  const [slots, setSlots] = useState([]);
  const [patientBusy, setPatientBusy] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [medicalFiles, setMedicalFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [dateError, setDateError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch doctor info
  useEffect(() => {
    if (selectedDoctor) {
      API.get(`/doctors/${selectedDoctor}`).then(({ data }) => {
        setDoctorInfo(data);
      }).catch(() => {
        toast.error('Doctor not found', { id: 'no-doctor' });
        navigate('/find-doctor');
      });
    } else {
      toast.error('Please select a doctor first', { id: 'no-doctor' });
      navigate('/find-doctor');
    }
  }, [selectedDoctor, navigate]);

  // Fetch latest user info (to get family members)
  const { fetchUser } = useAuth();
  useEffect(() => {
    if (user) {
      fetchUser();
    }
  }, [fetchUser, !!user]);

  // Fetch slots
  useEffect(() => {
    if (selectedDoctor && form.date) {
      if (doctorInfo && doctorInfo.availableDays && doctorInfo.availableDays.length > 0) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dateObj = new Date(form.date);
        const dayOfWeek = days[dateObj.getDay()];
        if (!doctorInfo.availableDays.includes(dayOfWeek)) {
          setDateError(`Doctor is only available on: ${doctorInfo.availableDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`);
          setSlots([]);
          setPatientBusy([]);
          return;
        }
      }
      setDateError('');
      const params = { date: form.date };
      if (user?._id) params.patientId = user._id;

      API.get(`/doctors/${selectedDoctor}/slots`, { params })
        .then(({ data }) => {
          setSlots(data.slots || []);
          setPatientBusy(data.patientBusy || []);
          setBookedSlots(data.bookedSlots || []);
        })
        .catch(() => {
          setSlots([]);
          setPatientBusy([]);
          setBookedSlots([]);
        });
    }
  }, [selectedDoctor, form.date, doctorInfo]);

  // File handling
  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Invalid type. Only JPG, PNG, PDF allowed.';
    if (file.size > MAX_FILE_SIZE) return 'File too large. Max 10MB.';
    return null;
  };

  const addFiles = useCallback((newFiles) => {
    const remaining = MAX_FILES - medicalFiles.length;
    if (remaining <= 0) { toast.error(`Maximum ${MAX_FILES} files allowed`); return; }

    const filesToAdd = Array.from(newFiles).slice(0, remaining);
    const validFiles = [];

    filesToAdd.forEach((file) => {
      const error = validateFile(file);
      if (error) { toast.error(`${file.name}: ${error}`); return; }
      // Create preview for images
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      validFiles.push({ file, preview, name: file.name, size: file.size, type: file.type });
    });

    setMedicalFiles((prev) => [...prev, ...validFiles]);
  }, [medicalFiles.length]);

  const removeFile = (index) => {
    setMedicalFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Drag handlers
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragOut = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const canGoNext = () => {
    if (step === 0) return !!selectedDoctor;
    if (step === 1) return !!(form.date && form.timeSlot);
    if (step === 2) return !!form.reason;
    return true;
  };

  const handleFinalSubmit = async (transactionId = '') => {
    console.log('[BookAppointment] handleFinalSubmit started', { transactionId });
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('doctor', doctorInfo?.user?._id || doctorInfo?.user);
      formData.append('date', form.date);
      formData.append('timeSlot', form.timeSlot);
      formData.append('type', form.type);
      formData.append('reason', form.reason);
      formData.append('patientNotes', form.patientNotes);
      formData.append('familyMember', form.familyMember);
      if (transactionId) formData.append('transactionId', transactionId);

      const symptomsArr = form.symptoms.split(',').map(s => s.trim()).filter(Boolean);
      symptomsArr.forEach((s) => formData.append('symptoms', s));

      medicalFiles.forEach(({ file }) => formData.append('medicalFiles', file));

      await API.post('/appointments', formData);
      toast.success('Appointment booked and paid successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      console.error('[BookAppointment] Booking error:', err);
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const handleBookClick = () => {
    console.log('[BookAppointment] handleBookClick', { consultationFee: doctorInfo?.consultationFee });
    if (!user) { 
      toast.error('Please sign in to book'); 
      navigate('/signin', { state: { from: window.location.pathname + window.location.search } }); 
      return; 
    }

    if (!doctorInfo?.consultationFee || doctorInfo.consultationFee === 0) {
      handleFinalSubmit(); // Free consultation, skip stripe
    } else {
      const submitBtn = document.getElementById('submit');
      if (submitBtn) {
        if (submitBtn.disabled) {
          toast.error('Payment system is still initializing. Please wait a second.');
        } else {
          submitBtn.click(); // Paid consultation, trigger stripe
        }
      } else {
        console.error('[BookAppointment] Stripe submit button not found');
        toast.error('Payment system not ready. Please refresh the page.');
      }
    }
  };

  // ── Render Helpers ──
  const renderStepper = () => (
    <div className="ba-stepper">
      {STEPS.map((label, i) => (
        <div key={label} className={`ba-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}
          onClick={() => i < step && setStep(i)}>
          <div className="ba-step-dot">
            {i < step ? '✓' : i + 1}
          </div>
          <span className="ba-step-label">{label}</span>
          {i < STEPS.length - 1 && <div className="ba-step-line" />}
        </div>
      ))}
    </div>
  );

  const renderScheduleStep = () => (
    <div className="ba-step-content fade-in-up">
      <div className="ba-step-header">
        <h2>Pick Date & Time</h2>
        <p>Select your preferred appointment schedule</p>
      </div>

      {doctorInfo?.availableDays?.length > 0 && (
        <div className="ba-info-banner">
          <span style={{ fontSize: '18px' }}>ℹ️</span>
          <span>
            Dr. {doctorInfo.user?.name} is available on:
            <strong> {doctorInfo.availableDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</strong>
          </span>
        </div>
      )}

      {/* Visit type indicator */}
      <div className="ba-type-cards">
        <div className="ba-type-card selected">
          <span className="ba-type-icon">🏥</span>
          <strong>In-Person Visit</strong>
          <small>Visit the clinic</small>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '24px' }}>
        <div className="input-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px', color: 'var(--primary)' }}>📅</span>
            Appointment Date
          </label>
          <input type="date" className={`input ${dateError ? 'input-error' : ''}`} value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: '' })}
            min={new Date().toISOString().split('T')[0]} required />
          {dateError && <p style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>{dateError}</p>}
        </div>
        <div className="input-group">
          <label className="ba-field-label">Who is this visit for?</label>
          <div className="flex flex-col gap-sm">
            <select
              className="input"
              value={form.familyMember === '' ? 'myself' : (user?.familyMembers?.some(fm => fm.name === form.familyMember) ? form.familyMember : 'other')}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'myself') setForm({ ...form, familyMember: '' });
                else if (val === 'other') setForm({ ...form, familyMember: ' ' }); // Space as marker for "other"
                else setForm({ ...form, familyMember: val });
              }}
            >
              <option value="myself">👤 Myself ({user?.name})</option>
              {user?.familyMembers?.length > 0 && (
                <optgroup label="Saved Family Members">
                  {user.familyMembers.map((fm, idx) => (
                    <option key={idx} value={fm.name}>
                      {fm.relation.toUpperCase()}: {fm.name}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="other">➕ Someone Else / New Member</option>
            </select>

            {(form.familyMember === ' ' || (form.familyMember !== '' && !user?.familyMembers?.some(fm => fm.name === form.familyMember))) && (
              <div className="fade-in">
                <input
                  type="text"
                  className="input"
                  placeholder="Enter relative's name..."
                  autoFocus
                  value={form.familyMember === ' ' ? '' : form.familyMember}
                  onChange={(e) => setForm({ ...form, familyMember: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {form.date && slots.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div className="flex items-center justify-between mb-sm">
            <label className="ba-field-label" style={{ margin: 0 }}>Available Time Slots</label>
            {form.timeSlot && (
              <div className="fade-in" style={{ 
                fontSize: '14px', 
                color: 'var(--primary)', 
                fontWeight: 600, 
                backgroundColor: 'rgba(var(--primary-rgb, 83, 43, 136), 0.1)', 
                padding: '4px 12px', 
                borderRadius: '20px' 
              }}>
                Selected: {formatTime12h(form.timeSlot)}
              </div>
            )}
          </div>
          <div className="ba-slots-grid">
            {slots.map((s) => {
              const isPatientBusy = patientBusy.includes(s);
              const isBooked = bookedSlots.includes(s);
              const isSelected = form.timeSlot === s;

              return (
                <button 
                  type="button" 
                  key={s}
                  className={`ba-slot ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                  disabled={isBooked}
                  onClick={() => {
                    if (isPatientBusy) {
                      toast.error('You already have another appointment scheduled at this time. Please reschedule or cancel it first.', { id: 'busy-slot' });
                    } else if (isBooked) {
                      toast.error('This slot is already booked.', { id: 'booked-slot' });
                    } else {
                      setForm({ ...form, timeSlot: s });
                    }
                  }}
                >
                  {formatTime12h(s)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {form.date && slots.length === 0 && selectedDoctor && !dateError && (
        <div className="ba-no-slots">
          <span>📅</span>
          <p>No available slots for this date. Please try another day.</p>
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="ba-step-content fade-in-up">
      <div className="ba-step-header">
        <h2>Visit Details & Files</h2>
        <p>Describe your reason and attach any relevant medical documents</p>
      </div>

      <div className="input-group">
        <label>Reason for Visit *</label>
        <input type="text" className="input" placeholder="e.g. Regular checkup, chest pain, follow-up..."
          value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
      </div>

      <div className="input-group">
        <label>Symptoms (comma separated)</label>
        <input type="text" className="input" placeholder="e.g. headache, fever, fatigue"
          value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
      </div>

      <div className="input-group">
        <label>Additional Notes for Doctor</label>
        <textarea className="input" rows="3" placeholder="Any additional information the doctor should know..."
          value={form.patientNotes} onChange={(e) => setForm({ ...form, patientNotes: e.target.value })} />
      </div>

      {/* Medical file upload */}
      <div className="ba-upload-section">
        <label className="ba-field-label">
          📎 Medical Files
          <span className="ba-file-count">({medicalFiles.length}/{MAX_FILES})</span>
        </label>
        <p className="ba-upload-hint">Upload lab reports or prescriptions (JPG, PNG, PDF — max 10MB each)</p>

        <div className={`ba-dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDragIn} onDragLeave={handleDragOut}
          onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf"
            multiple style={{ display: 'none' }}
            onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          <div className="ba-dropzone-content">
            <div className="ba-dropzone-icon">📄</div>
            <p><strong>Drag & drop files here</strong></p>
            <p className="ba-dropzone-sub">or click to browse</p>
            <span className="ba-dropzone-formats">JPG, PNG, PDF up to 10MB</span>
          </div>
        </div>

        {medicalFiles.length > 0 && (
          <div className="ba-file-list">
            {medicalFiles.map((f, i) => (
              <div key={i} className="ba-file-item">
                <div className="ba-file-thumb">
                  {f.preview ? (
                    <img src={f.preview} alt={f.name} />
                  ) : (
                    <span className="ba-pdf-icon">PDF</span>
                  )}
                </div>
                <div className="ba-file-info">
                  <span className="ba-file-name">{f.name}</span>
                  <span className="ba-file-size">{formatFileSize(f.size)}</span>
                </div>
                <button type="button" className="ba-file-remove" onClick={() => removeFile(i)} title="Remove file">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="ba-step-content fade-in-up">
      <div className="ba-step-header">
        <h2>Review & Confirm</h2>
        <p>Double-check your appointment details before booking</p>
      </div>

      <div className="ba-review-card">
        {/* Doctor Summary */}
        <div className="ba-review-section">
          <h4 className="ba-review-label">Doctor</h4>
          <div className="ba-review-doctor">
            {doctorInfo?.user?.avatar ? (
              <img src={doctorInfo.user.avatar} alt={doctorInfo.user.name} className="avatar avatar-lg" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff' }}>
                {doctorInfo?.user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <strong>{doctorInfo?.user?.name}</strong>
              <span className="ba-review-spec">{doctorInfo?.specialization}</span>
            </div>
          </div>
        </div>

        <div className="ba-review-divider" />

        {/* Schedule */}
        <div className="ba-review-section">
          <h4 className="ba-review-label">Schedule</h4>
          <div className="ba-review-grid">
            <div className="ba-review-item">
              <span className="ba-review-icon">📅</span>
              <div>
                <small>Date</small>
                <strong>{form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</strong>
              </div>
            </div>
            <div className="ba-review-item">
              <span className="ba-review-icon">🕐</span>
              <div><small>Time</small><strong>{form.timeSlot ? formatTime12h(form.timeSlot) : '—'}</strong></div>
            </div>
            <div className="ba-review-item">
              <span className="ba-review-icon">🏥</span>
              <div><small>Type</small><strong>In-Person</strong></div>
            </div>
            <div className="ba-review-item">
              <span className="ba-review-icon">💰</span>
              <div><small>Fee</small><strong>৳{doctorInfo?.consultationFee || '—'}</strong></div>
            </div>
          </div>
        </div>

        <div className="ba-review-divider" />

        {/* Details */}
        <div className="ba-review-section">
          <h4 className="ba-review-label">Visit Details</h4>
          <div className="ba-review-detail">
            <span>Reason:</span> <strong>{form.reason}</strong>
          </div>
          {form.symptoms && (
            <div className="ba-review-detail">
              <span>Symptoms:</span>
              <div className="ba-symptom-chips">
                {form.symptoms.split(',').filter(Boolean).map((s, i) => (
                  <span key={i} className="ba-symptom-chip">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}
          {form.patientNotes && (
            <div className="ba-review-detail">
              <span>Notes:</span> <em>{form.patientNotes}</em>
            </div>
          )}
          {form.familyMember && (
            <div className="ba-review-detail">
              <span>For:</span> <strong>{form.familyMember}</strong>
            </div>
          )}
        </div>

        {medicalFiles.length > 0 && (
          <>
            <div className="ba-review-divider" />
            <div className="ba-review-section">
              <h4 className="ba-review-label">Attached Files ({medicalFiles.length})</h4>
              <div className="ba-review-files">
                {medicalFiles.map((f, i) => (
                  <div key={i} className="ba-review-file">
                    {f.preview ? <img src={f.preview} alt={f.name} /> : <span className="ba-pdf-icon-sm">PDF</span>}
                    <span>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="ba-review-divider" />
        <div className="ba-review-section">
          <h4 className="ba-review-label">Payment Information</h4>
          {doctorInfo?.consultationFee > 0 ? (
            <StripeCheckout
              doctorId={selectedDoctor}
              onPaymentSuccess={handleFinalSubmit}
              isProcessing={loading}
              setIsProcessing={setLoading}
            />
          ) : (
            <div className="alert alert-success" style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '18px' }}>🎉</span> This is a free consultation. No payment required.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const stepContent = [renderScheduleStep, renderDetailsStep, renderReviewStep];

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="ba-hero">
        <div className="ba-hero-bg" />
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <span className="ba-badge">Book Appointment</span>
          <h1 className="ba-hero-title">Schedule Your Visit</h1>
          <p className="ba-hero-sub">Choose a doctor, pick a time, attach medical files, and book in minutes.</p>
        </div>
      </section>

      {/* Stepper + Content */}
      <section className="section" style={{ paddingTop: '0', marginTop: '-40px', position: 'relative', zIndex: 2 }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {renderStepper()}

          {/* Doctor info bar */}
          {doctorInfo && (
            <div className="ba-doctor-bar">
              {doctorInfo.user?.avatar ? (
                <img src={doctorInfo.user.avatar} alt={doctorInfo.user.name} className="avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff' }}>
                  {doctorInfo.user?.name?.charAt(0)}
                </div>
              )}
              <div className="ba-doctor-bar-info">
                <strong>{doctorInfo.user?.name}</strong>
                <span>{doctorInfo.specialization} • ৳{doctorInfo.consultationFee}</span>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => navigate('/find-doctor')}>Change</button>
            </div>
          )}

          <div className="ba-card">
            {stepContent[step]()}

            {/* Navigation */}
            <div className="ba-nav-buttons">
              {step > 0 ? (
                <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                  ← Back
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={() => setShowCancelModal(true)}>
                  Cancel Booking
                </button>
              )}
              <div style={{ flex: 1 }} />
              {step < 2 ? (
                <button className="btn btn-primary" disabled={!canGoNext()} onClick={() => setStep(step + 1)}>
                  Continue →
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" disabled={loading} onClick={handleBookClick}
                  style={{ minWidth: '200px' }}>
                  {loading ? (
                    <span className="ba-loading">
                      <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                      Booking...
                    </span>
                  ) : '✓ Confirm Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Booking?</h3>
            <p>Are you sure you want to cancel? All your entered details will be lost.</p>
            <div className="modal-actions" style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowCancelModal(false)}>No, Continue</button>
              <button className="btn btn-danger" onClick={() => navigate('/find-doctor')}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
