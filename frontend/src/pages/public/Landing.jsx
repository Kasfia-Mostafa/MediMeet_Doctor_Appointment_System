import { Link } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineClock, HiOutlineUserGroup, HiOutlineHeart, HiOutlineStar, HiOutlineArrowRight } from 'react-icons/hi';
import './Landing.css';

const features = [
  {
    icon: <HiOutlineClock />,
    title: 'Easy Booking',
    desc: 'Book appointments with top doctors in just a few clicks. Choose your preferred time and specialist easily.'
  },
  {
    icon: <HiOutlineShieldCheck />,
    title: 'Verified Doctors',
    desc: 'All our doctors are verified and certified healthcare professionals with years of expertise.'
  },
  {
    icon: <HiOutlineUserGroup />,
    title: '24/7 Support',
    desc: 'Our dedicated support team is here to help you around the clock with any queries or concerns.'
  }
];

const specialties = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Gastroenterology', 'Psychiatry', 'Dentistry'
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="badge">Trusted Healthcare Partner</div>
            <h1>Healthcare at your <span>Fingertips</span></h1>
            <p>Connect with the best doctors and book appointments online. Manage your health records securely and get personalized care from the comfort of your home.</p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started <HiOutlineArrowRight />
              </Link>
              <Link to="/find-doctor" className="btn btn-secondary btn-lg">Find Doctors</Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <strong>10k+</strong>
                <span>Happy Patients</span>
              </div>
              <div className="stat">
                <strong>500+</strong>
                <span>Specialists</span>
              </div>
              <div className="stat">
                <strong>4.9/5</strong>
                <span>User Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-blob"></div>
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" alt="Medical Professional" />
            <div className="floating-card">
              <div className="icon-wrap"><HiOutlineHeart /></div>
              <div>
                <strong>Expert Care</strong>
                <span>Top rated doctors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header text-center">
            <span className="label">Why Choose Us</span>
            <h2>Our Top Features</h2>
            <p>We provide the best digital healthcare experience for our patients.</p>
          </div>
          <div className="grid grid-3">
            {features.map((feature, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="specialties bg-surface">
        <div className="container">
          <div className="section-header text-center">
            <span className="label">Our Expertise</span>
            <h2>Top Specializations</h2>
            <p>Access world-class medical experts across multiple departments.</p>
          </div>
          <div className="specialties-grid">
            {specialties.map((spec, i) => (
              <Link to={`/find-doctor?specialization=${spec}`} key={i} className="spec-card">
                <div className="spec-icon">
                  <HiOutlineStar />
                </div>
                <span>{spec}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-xl">
            <Link to="/find-doctor" className="btn btn-secondary">
              View All Specializations
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to take control of your health?</h2>
              <p>Join thousands of patients who trust MediMeet for their healthcare needs. Sign up today and experience the future of medical care.</p>
              <div className="cta-actions">
                <Link to="/signup" className="btn btn-primary btn-lg">Create Account</Link>
                <Link to="/contact" className="btn btn-ghost btn-lg" style={{ color: 'white' }}>Contact Support</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
