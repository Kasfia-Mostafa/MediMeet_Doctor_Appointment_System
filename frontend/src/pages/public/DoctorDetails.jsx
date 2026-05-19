import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineStar, HiOutlineLocationMarker, HiOutlineCurrencyBangladeshi,
  HiOutlineAcademicCap, HiOutlineClock,
  HiOutlineShieldCheck, HiOutlineCalendar,
  HiStar, HiOutlineAnnotation
} from 'react-icons/hi';

export default function DoctorDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const fetchData = async () => {
    try {
      const [docRes, reviewRes] = await Promise.allSettled([
        API.get(`/doctors/${id}`),
        API.get(`/reviews/doctor/${id}`)
      ]);

      if (docRes.status === 'fulfilled') {
        setDoctor(docRes.value.data);
      }
      if (reviewRes.status === 'fulfilled') {
        setReviews(reviewRes.value.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [id]);

  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in to leave a review');
    if (user.role !== 'patient') return toast.error('Only patients can leave reviews');

    setSubmitting(true);
    try {
      if (editingReviewId) {
        await API.put(`/reviews/${editingReviewId}`, { rating, comment });
        toast.success('Review updated successfully!');
      } else {
        await API.post('/reviews', { doctorId: id, rating, comment });
        toast.success('Review submitted successfully!');
      }
      setComment('');
      setRating(5);
      setEditingReviewId(null);
      fetchData(); // Refresh reviews and doctor rating
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!doctor) return <div className="container section text-center"><h2>Doctor not found</h2></div>;

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={{ padding: '80px 0 60px', background: 'linear-gradient(180deg, var(--surface-container-low) 0%, var(--background) 100%)' }}>
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: '32px', overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)', border: '8px solid white'
              }}>
                {doctor.user?.avatar ? (
                  <img src={doctor.user.avatar} alt={doctor.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-container-highest)', fontSize: '80px', color: 'var(--text-muted)' }}>
                    {doctor.user?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div style={{
                position: 'absolute', bottom: '20px', right: '-20px',
                background: 'white', padding: '12px 20px', borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <HiOutlineShieldCheck style={{ color: 'var(--primary)', fontSize: '24px' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>VERIFIED</div>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>Medical Expert</div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-sm mb-sm">
                <span className="chip" style={{ background: 'var(--primary-container)', color: 'var(--primary)', fontWeight: 700 }}>
                  {doctor.specialization}
                </span>
                <div className="flex items-center gap-xs" style={{ color: '#F59E0B', fontWeight: 700 }}>
                  <HiStar /> {doctor.rating.toFixed(1)} ({doctor.totalReviews} Reviews)
                </div>
              </div>
              <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
                Dr. {doctor.user?.name}
              </h1>
              <p style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                {doctor.qualification} with over {doctor.experience} years of clinical excellence in the field of {doctor.specialization.toLowerCase()}.
              </p>

              <div className="flex gap-md">
                <Link to={`/book-appointment?doctor=${doctor._id}`} className="btn btn-primary btn-lg" style={{ padding: '0 40px' }}>
                  <HiOutlineCalendar style={{ fontSize: '20px' }} /> Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Content */}
      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '2fr 1.2fr', gap: '48px', alignItems: 'start' }}>
            <div className="flex flex-col gap-xl">
              <div className="card" style={{ padding: '40px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Professional Biography</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '16px' }}>
                  {doctor.bio || `Dr. ${doctor.user?.name} is a dedicated professional with extensive experience in ${doctor.specialization}. They have spent years honing their skills in various clinical settings, ensuring that every patient receives the highest standard of care. Their approach combines modern medical techniques with compassionate patient support.`}
                </p>
              </div>

              {/* Reviews Section */}

              <div className="card" id="review-form" style={{ padding: '40px', borderRadius: '24px', marginTop: '40px' }}>
                <div className="flex items-center justify-between mb-xl">
                  <h3 style={{ fontSize: '24px', fontWeight: 700 }}>Patient Reviews</h3>
                  <div className="flex items-center gap-xs" style={{ fontSize: '18px', fontWeight: 700, color: '#F59E0B' }}>
                    <HiStar /> {doctor.rating.toFixed(1)}
                  </div>
                </div>

                {/* Review Form */}

                {user?.role === 'patient' && (
                  <div style={{ marginBottom: '40px', padding: '24px', background: 'var(--surface-container-lowest)', borderRadius: '20px', border: editingReviewId ? '2px solid var(--primary)' : '1px dashed var(--outline-variant)' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>
                      {editingReviewId ? 'Update Your Feedback' : 'Share Your Experience'}
                    </h4>
                    <form onSubmit={handleReviewSubmit}>
                      <div className="flex gap-xs mb-md">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star} type="button"
                            onClick={() => setRating(star)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: star <= rating ? '#F59E0B' : 'var(--outline-variant)' }}
                          >
                            {star <= rating ? <HiStar /> : <HiOutlineStar />}
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="input" rows={3} placeholder="Write your review here..."
                        value={comment} onChange={e => setComment(e.target.value)} required
                        style={{ marginBottom: '16px' }}
                      />
                      <div className="flex gap-sm">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                          {submitting ? 'Processing...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                        </button>
                        {editingReviewId && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancelEdit}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {!user && (
                  <div style={{ marginBottom: '40px', padding: '20px', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: '16px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      Please <Link to="/signin" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link> to share your experience with Dr. {doctor.user?.name}.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-lg">
                  {reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      <HiOutlineAnnotation style={{ fontSize: '48px', opacity: 0.2, marginBottom: '12px' }} />
                      <p>No reviews yet. Be the first to share your experience!</p>
                    </div>
                  ) : (
                    reviews.map(review => {
                      const isOwner = user && (review.user?._id === user._id || review.user === user._id);
                      const isEdited = new Date(review.updatedAt).getTime() > new Date(review.createdAt).getTime();

                      return (
                        <div key={review._id} style={{ paddingBottom: '24px', borderBottom: '1px solid var(--outline-variant)' }}>
                          <div className="flex items-center justify-between mb-sm">
                            <div className="flex items-center gap-sm">
                              <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                {review.user?.avatar ? <img src={review.user.avatar} alt="" /> : review.user?.name?.charAt(0)}
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '15px' }}>{review.user?.name}</span>
                              {isOwner && (
                                <button
                                  onClick={() => handleEditClick(review)}
                                  style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', padding: 0, marginLeft: '8px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Edit Review
                                </button>
                              )}
                            </div>
                            <div className="flex gap-xs" style={{ color: '#F59E0B', fontSize: '14px' }}>
                              {[...Array(review.rating)].map((_, i) => <HiStar key={i} />)}
                            </div>
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{review.comment}</p>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', opacity: 0.7 }}>
                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            {isEdited && ' (Edited)'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-xl">
              <div className="card" style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--primary)', background: 'var(--surface-container-lowest)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '24px', fontSize: '18px' }}>Consultation Details</h4>
                <div className="flex flex-col gap-lg">
                  <div className="flex items-center gap-md">
                    <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--surface-container-high)', color: 'var(--primary)' }}>
                      <HiOutlineCurrencyBangladeshi style={{ fontSize: '20px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>VISIT FEE</div>
                      <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--success)' }}>৳{doctor.consultationFee}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-md">
                    <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--surface-container-high)', color: 'var(--primary)' }}>
                      <HiOutlineLocationMarker style={{ fontSize: '20px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PRIMARY CLINIC</div>
                      <div style={{ fontWeight: 700 }}>{doctor.hospital || 'Medical Center'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-md">
                    <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--surface-container-high)', color: 'var(--primary)' }}>
                      <HiOutlineClock style={{ fontSize: '20px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AVAILABLE DAYS</div>
                      <div style={{ fontWeight: 700 }}>{doctor.availableDays?.join(', ') || 'Mon, Wed, Fri'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '32px', borderRadius: '24px', marginTop: '40px' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '24px', fontSize: '18px' }}>Academic Excellence</h4>
                <div className="flex items-start gap-md">
                  <div style={{ paddingTop: '22px', paddingRight: '10px', paddingLeft: '10px', paddingBottom: '10px', borderRadius: '12px', background: 'var(--surface-container-high)', color: 'var(--primary)', }}>
                    <HiOutlineAcademicCap style={{ fontSize: '20px' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{doctor.qualification}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Certified specialist with international training in advanced clinical procedures.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
