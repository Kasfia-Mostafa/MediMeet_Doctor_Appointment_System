import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import {
  HiOutlineShieldCheck, HiOutlineClock, HiOutlineUserGroup,
  HiOutlineHeart, HiOutlineStar, HiOutlineArrowRight,
  HiOutlineCalendar, HiOutlineClipboardList, HiOutlineChat,
  HiOutlineLightningBolt, HiOutlineGlobe, HiOutlinePhone,
  HiOutlineCheckCircle, HiOutlineBadgeCheck
} from 'react-icons/hi';
import './Landing.css';

const features = [
  {
    icon: <HiOutlineClock />,
    title: 'Easy Booking',
    desc: 'Book appointments with top doctors in just a few clicks. Choose your preferred time and specialist easily.',
    color: 'var(--primary)'
  },
  {
    icon: <HiOutlineShieldCheck />,
    title: 'Verified Doctors',
    desc: 'All our doctors are verified and certified healthcare professionals with years of expertise.',
    color: 'var(--success)'
  },
  {
    icon: <HiOutlineUserGroup />,
    title: '24/7 Support',
    desc: 'Our dedicated support team is here to help you around the clock with any queries or concerns.',
    color: 'var(--info)'
  },
  {
    icon: <HiOutlineLightningBolt />,
    title: 'Instant Results',
    desc: 'Receive your prescriptions, lab reports, and medical records instantly through your dashboard.',
    color: 'var(--warning)'
  }
];

const steps = [
  { num: '01', icon: <HiOutlineCalendar />, title: 'Choose a Doctor', desc: 'Browse our extensive list of verified specialists and pick the one that suits you best.' },
  { num: '02', icon: <HiOutlineClipboardList />, title: 'Book Appointment', desc: 'Select your convenient date & time slot. Get instant confirmation via email notification.' },
  { num: '03', icon: <HiOutlineChat />, title: 'Get Consultation', desc: 'Visit your doctor at the scheduled time. Receive expert care and treatment plans.' },
];

const testimonials = [
  { name: 'Anwar Ahmed', role: 'Patient', text: 'MediMeet made it incredibly easy to find a specialist near me. The booking process was seamless and I got an appointment within hours!', rating: 5 },
  { name: 'Safin Uddin', role: 'Patient', text: 'I love how I can manage all my medical records in one place. The dashboard is intuitive and the doctors are truly professional.', rating: 5 },
  { name: 'Fatima Rahman', role: 'Patient', text: 'As a busy professional, being able to book appointments online is a game-changer. The automated reminders ensure I never miss one.', rating: 5 },
];

const specialties = [
  { name: 'Neurology', emoji: '🧠' },
  { name: 'Pediatrics', emoji: '👶' },
  { name: 'Orthopedics', emoji: '🦴' },
  { name: 'Dermatology', emoji: '🧴' },
  { name: 'Psychiatry', emoji: '🧘' },
  { name: 'Dentistry', emoji: '🦷' },
  { name: 'Gynecology', emoji: '👩‍⚕️' },
  { name: 'Ophthalmology', emoji: '👁️' },
];

// Intersection Observer hook for scroll animations
function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.reveal');
    elements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function Landing() {
  const pageRef = useScrollReveal();

  return (
    <div className="landing" ref={pageRef}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero">
        <div className="hero-particles">
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
          <div className="particle p4"></div>
          <div className="particle p5"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge animate-slide-down">
              <HiOutlineBadgeCheck />
              <span>Trusted Healthcare Partner</span>
            </div>
            <h1 className="animate-slide-up">
              Healthcare at your <br /><span className="hero-gradient-text">Fingertips</span>
            </h1>
            <p className="animate-slide-up delay-1">
              Connect with the best doctors and book appointments online. Manage your health records securely and get personalized care from the comfort of your home.
            </p>
            <div className="hero-actions animate-slide-up delay-2">
              <Link to="/signup" className="btn-hero-primary">
                Get Started <HiOutlineArrowRight />
              </Link>
              <Link to="/find-doctor" className="btn-hero-secondary">
                <HiOutlineCalendar /> Find Doctors
              </Link>
            </div>
            <div className="hero-trust animate-slide-up delay-3">
              <div className="hero-avatars">
                <div className="hero-avatar-ring" style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>S</div>
                <div className="hero-avatar-ring" style={{background: 'linear-gradient(135deg, #ec4899, #f43f5e)'}}>M</div>
                <div className="hero-avatar-ring" style={{background: 'linear-gradient(135deg, #14b8a6, #06b6d4)'}}>F</div>
                <div className="hero-avatar-ring hero-avatar-count">+2k</div>
              </div>
              <div className="hero-trust-text">
                <div className="hero-trust-stars">
                  {[...Array(5)].map((_, i) => <HiOutlineStar key={i} />)}
                </div>
                <span>Trusted by <strong>2,000+</strong> patients</span>
              </div>
            </div>
          </div>

          <div className="hero-visual animate-scale-in">
            <div className="hero-blob"></div>
            <div className="hero-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070"
                alt="Medical Professional"
              />
            </div>
            <div className="floating-card fc-1 animate-float">
              <div className="fc-icon" style={{ background: 'rgba(46,125,50,0.12)', color: 'var(--success)' }}>
                <HiOutlineHeart />
              </div>
              <div>
                <strong>Expert Care</strong>
                <span>Top rated doctors</span>
              </div>
            </div>
            <div className="floating-card fc-2 animate-float-delay">
              <div className="fc-icon" style={{ background: 'rgba(83,43,136,0.12)', color: 'var(--primary)' }}>
                <HiOutlineCheckCircle />
              </div>
              <div>
                <strong>500+ Doctors</strong>
                <span>Verified specialists</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS COUNTER ═══════════════ */}
      <section className="stats-banner">
        <div className="container">
          <div className="stats-grid reveal">
            <div className="stats-item">
              <span className="stats-number">10k+</span>
              <span className="stats-label">Happy Patients</span>
            </div>
            <div className="stats-divider"></div>
            <div className="stats-item">
              <span className="stats-number">500+</span>
              <span className="stats-label">Specialists</span>
            </div>
            <div className="stats-divider"></div>
            <div className="stats-item">
              <span className="stats-number">14+</span>
              <span className="stats-label">Specializations</span>
            </div>
            <div className="stats-divider"></div>
            <div className="stats-item">
              <span className="stats-number">4.9</span>
              <span className="stats-label">User Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-label">Why Choose Us</span>
            <h2>Everything You Need for <span className="text-gradient">Better Health</span></h2>
            <p className="section-desc">We provide the most comprehensive digital healthcare experience for our patients.</p>
          </div>
          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={i} className="feature-card reveal" style={{ '--delay': `${i * 0.1}s` }}>
                <div className="feature-icon-wrap" style={{ '--accent': feature.color }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <div className="feature-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-label">How It Works</span>
            <h2>Get Started in <span className="text-gradient">3 Easy Steps</span></h2>
            <p className="section-desc">Your journey to better healthcare starts here.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card reveal" style={{ '--delay': `${i * 0.15}s` }}>
                <div className="step-number">{step.num}</div>
                <div className="step-icon-wrap">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SPECIALIZATIONS ═══════════════ */}
      <section className="specialties-section">
        <div className="container">
          <div className="spec-layout reveal">
            <div className="spec-header-side">
              <span className="section-label">Our Expertise</span>
              <h2>Top Medical <span className="text-gradient">Specializations</span></h2>
              <p>Access world-class medical experts across 14+ departments. Each specialist is verified and board-certified.</p>
              <div className="spec-header-stats">
                <div className="spec-stat">
                  <strong>14+</strong>
                  <span>Departments</span>
                </div>
                <div className="spec-stat">
                  <strong>500+</strong>
                  <span>Specialists</span>
                </div>
              </div>
              <Link to="/find-doctor" className="btn-outline-primary">
                View All Doctors <HiOutlineArrowRight />
              </Link>
            </div>
            <div className="specialties-grid">
              {specialties.map((spec, i) => (
                <Link
                  to={`/find-doctor?specialization=${spec.name}`}
                  key={i}
                  className="spec-card reveal"
                  style={{ '--delay': `${i * 0.06}s` }}
                >
                  <div className="spec-emoji">{spec.emoji}</div>
                  <div className="spec-card-info">
                    <span className="spec-name">{spec.name}</span>
                    <span className="spec-count">View doctors →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-label">Testimonials</span>
            <h2>What Our <span className="text-gradient">Patients Say</span></h2>
            <p className="section-desc">Real stories from real patients who trust MediMeet.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card reveal" style={{ '--delay': `${i * 0.12}s` }}>
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => <HiOutlineStar key={j} />)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HEALTHCARE ACCESS ═══════════════ */}
      <section className="app-promo-section">
        <div className="container">
          <div className="app-promo reveal">
            <div className="app-promo-bg-orbs">
              <div className="orb orb-1"></div>
              <div className="orb orb-2"></div>
              <div className="orb orb-3"></div>
            </div>
            <div className="app-promo-content">
              <span className="promo-label">
                <HiOutlineGlobe /> Accessible Everywhere
              </span>
              <h2>Healthcare Access <br />From <span className="promo-highlight">Any Device</span></h2>
              <p>Whether you're on your phone, tablet, or computer — MediMeet gives you seamless access to book appointments, view records, and manage your health anytime, anywhere.</p>
              <div className="app-promo-features">
                <div className="app-feature">
                  <HiOutlineGlobe />
                  <span>Access Anywhere</span>
                </div>
                <div className="app-feature">
                  <HiOutlinePhone />
                  <span>Responsive Design</span>
                </div>
                <div className="app-feature">
                  <HiOutlineShieldCheck />
                  <span>Secure & Private</span>
                </div>
              </div>
              <Link to="/signup" className="btn-promo">
                Get Started Free <HiOutlineArrowRight />
              </Link>
            </div>
            <div className="app-promo-visual">
              <div className="device-mockup">
                <div className="device-screen">
                  <div className="mock-header">
                    <div className="mock-dot"></div>
                    <div className="mock-dot"></div>
                    <div className="mock-dot"></div>
                  </div>
                  <div className="mock-content">
                    <div className="mock-avatar"></div>
                    <div className="mock-line w80"></div>
                    <div className="mock-line w60"></div>
                    <div className="mock-cards">
                      <div className="mock-card-sm"></div>
                      <div className="mock-card-sm"></div>
                    </div>
                    <div className="mock-btn"></div>
                  </div>
                </div>
              </div>
              <div className="device-glow"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
