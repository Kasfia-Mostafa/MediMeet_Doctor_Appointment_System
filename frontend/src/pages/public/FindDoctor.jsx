import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import {
  HiOutlineSearch, HiOutlineStar, HiOutlineLocationMarker,
  HiOutlineCurrencyBangladeshi, HiOutlineBadgeCheck, HiOutlineClock,
  HiOutlineAcademicCap, HiOutlineArrowRight,
  HiOutlineChevronLeft, HiOutlineChevronRight
} from 'react-icons/hi';
import './FindDoctor.css';

const specializations = [
  'All', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology',
  'Gastroenterology', 'Psychiatry', 'Dentistry', 'Gynecology',
  'ENT', 'Ophthalmology', 'Urology'
];

const specIcons = {
  'Neurology': '🧠', 'Pediatrics': '👶', 'Orthopedics': '🦴',
  'Dermatology': '🧴', 'Gastroenterology': '🫁', 'Psychiatry': '🧘', 'Dentistry': '🦷',
  'Gynecology': '👩‍⚕️', 'ENT': '👂', 'Ophthalmology': '👁️', 'Urology': '💊'
};

export default function FindDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSpec, setActiveSpec] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await API.get('/doctors?limit=100');
        console.log('Fetched Doctors:', data.doctors.length);
        setDoctors(data.doctors);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Reset to first page when search or filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [search, activeSpec]);

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      doc.hospital?.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = activeSpec === 'All' || doc.specialization === activeSpec;
    return matchesSearch && matchesSpec;
  });

  // Pagination Logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="find-doctor-page fade-in">
      {/* Hero Header */}
      <section className="fd-hero">
        <div className="fd-hero-bg"></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="fd-hero-content">
            <span className="fd-badge">
              <HiOutlineBadgeCheck /> Verified Professionals
            </span>
            <h1>Find Your <span>Specialist</span></h1>
            <p>Connect with experienced, board-certified doctors across 14+ medical specializations. Book your appointment in minutes.</p>

            {/* Search Bar */}
            <div className="fd-search-wrapper">
              <div className="fd-search-box">
                <HiOutlineSearch className="fd-search-icon" />
                <input
                  type="text"
                  placeholder="Search by doctor name, specialization, or hospital..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="fd-hero-stats">
              <div className="fd-stat">
                <strong>500+</strong>
                <span>Verified Doctors</span>
              </div>
              <div className="fd-stat-divider"></div>
              <div className="fd-stat">
                <strong>14+</strong>
                <span>Specializations</span>
              </div>
              <div className="fd-stat-divider"></div>
              <div className="fd-stat">
                <strong>50k+</strong>
                <span>Appointments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialization Filter Chips */}
      <section className="fd-filters">
        <div className="container">
          <div className="fd-filter-scroll">
            {specializations.map(s => (
              <button
                key={s}
                className={`fd-chip ${activeSpec === s ? 'active' : ''}`}
                onClick={() => setActiveSpec(s)}
              >
                {s !== 'All' && <span className="fd-chip-emoji">{specIcons[s] || '⚕️'}</span>}
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Grid */}
      <section className="fd-grid-section">
        <div className="container">
          {loading ? (
            <div className="loader"><div className="spinner"></div></div>
          ) : filteredDoctors.length === 0 ? (
            <div className="fd-empty">
              <div className="fd-empty-icon">👨‍⚕️</div>
              <h3>No doctors found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setActiveSpec('All'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="fd-doctor-grid">
                {currentDoctors.map(doc => (
                  <div key={doc._id} className="fd-card">
                    <div className="fd-card-top">
                      <div className="fd-card-avatar">
                        {doc.user?.avatar ? (
                          <img src={doc.user.avatar} alt={doc.user?.name} />
                        ) : (
                          <div className="fd-avatar-placeholder">{doc.user?.name?.charAt(0)}</div>
                        )}
                        <div className="fd-verified-badge" title="Verified Doctor">
                          <HiOutlineBadgeCheck />
                        </div>
                      </div>

                      <div className="fd-card-info">
                        <div className="fd-card-rating">
                          <HiOutlineStar />
                          <span>4.9</span>
                        </div>
                        <h3>{doc.user?.name}</h3>
                        <div className="fd-card-spec">{doc.specialization}</div>
                      </div>
                    </div>

                    <div className="fd-card-details">
                      {doc.qualification && (
                        <div className="fd-detail-row">
                          <HiOutlineAcademicCap />
                          <span>{doc.qualification}</span>
                        </div>
                      )}
                      <div className="fd-detail-row">
                        <HiOutlineLocationMarker />
                        <span>{doc.hospital || 'MediMeet Hospital'}</span>
                      </div>
                      {doc.experience && (
                        <div className="fd-detail-row">
                          <HiOutlineClock />
                          <span>{doc.experience}+ years experience</span>
                        </div>
                      )}
                    </div>

                    <div className="fd-card-footer">
                      <div className="fd-card-fee">
                        <HiOutlineCurrencyBangladeshi />
                        <div>
                          <span className="fd-fee-amount">৳{doc.consultationFee || 500}</span>
                          <span className="fd-fee-label">per visit</span>
                        </div>
                      </div>
                      <Link to={`/doctor-details/${doc._id}`} className="fd-book-btn">
                        Book Now <HiOutlineArrowRight />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="fd-pagination-container">
                  <div className="fd-pagination">
                    <button
                      className="fd-page-btn"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Previous Page"
                    >
                      <HiOutlineChevronLeft />
                    </button>
                    <div className="fd-page-numbers">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          className={`fd-page-number ${currentPage === i + 1 ? 'active' : ''}`}
                          onClick={() => paginate(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      className="fd-page-btn"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      title="Next Page"
                    >
                      <HiOutlineChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
