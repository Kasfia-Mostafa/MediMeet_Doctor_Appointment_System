import { HiOutlineHeart, HiOutlineShieldCheck, HiOutlineLightBulb, HiOutlineGlobe } from 'react-icons/hi';

const values = [
  { icon: <HiOutlineHeart />, title: 'Patient First', desc: 'Every decision we make starts with the patient experience in mind.' },
  { icon: <HiOutlineShieldCheck />, title: 'Trust & Security', desc: 'Bank-grade encryption protects your most sensitive health data.' },
  { icon: <HiOutlineLightBulb />, title: 'Innovation', desc: 'We leverage cutting-edge technology to simplify healthcare.' },
  { icon: <HiOutlineGlobe />, title: 'Accessibility', desc: 'Making quality healthcare accessible to every citizen of Bangladesh.' },
];

const team = [
  { name: 'Dr. Anika Sultana', role: 'Chief Medical Officer', initials: 'AS', image: 'https://i.ibb.co.com/r2FT5VNy/sultana.jpg' },
  { name: 'Rafiq Hossain', role: 'CEO & Founder', initials: 'RH', image: 'https://i.ibb.co.com/sp1JhjyG/men.jpg' },
  { name: 'Tahmina Akter', role: 'Head of Technology', initials: 'TA', image: 'https://i.ibb.co.com/hx8HSZbV/tahmina.jpg' },
  { name: 'Dr. Imran Chowdhury', role: 'Medical Director', initials: 'IC', image: 'https://i.ibb.co.com/1JwmvJXy/men2.jpg' },
];

export default function About() {
  return (
    <div className="fade-in">
      {/* Hero */}
      <section style={{ padding: '80px 0 60px', background: 'linear-gradient(180deg, var(--surface) 0%, var(--background) 100%)' }}>
        <div className="container text-center">
          <span className="label" style={{ color: 'var(--primary)' }}>About MediMeet</span>
          <h1 style={{ marginTop: '8px', marginBottom: '16px' }}>Redefining Healthcare<br />in Bangladesh</h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '18px', lineHeight: 1.7 }}>
            We're building a healthcare platform that combines clinical excellence with modern technology, making quality care accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '64px' }}>
            <div>
              <span className="label" style={{ color: 'var(--primary)' }}>Our Mission</span>
              <h2 style={{ marginTop: '8px', marginBottom: '16px' }}>Bridging the gap between patients and quality care</h2>
              <p style={{ fontSize: '16px', lineHeight: 1.7, marginBottom: '16px' }}>
                MediMeet was born from a simple observation: healthcare in Bangladesh deserves a digital transformation. Too many patients struggle with long wait times, lost records, and fragmented care.
              </p>
              <p style={{ fontSize: '16px', lineHeight: 1.7 }}>
                We're changing that by providing a unified platform where patients can find doctors, book appointments, track wellness, and manage their entire health journey — all in one place.
              </p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary), var(--accent))', borderRadius: 'var(--radius-xl)', padding: '48px', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', fontWeight: 800, fontFamily: 'var(--font-headline)' }}>2024</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>Founded in Dhaka</p>
              <div className="grid grid-3" style={{ marginTop: '32px', gap: '16px' }}>
                <div><div style={{ fontSize: '28px', fontWeight: 800 }}>500+</div><small style={{ opacity: 0.7 }}>Doctors</small></div>
                <div><div style={{ fontSize: '28px', fontWeight: 800 }}>10K+</div><small style={{ opacity: 0.7 }}>Patients</small></div>
                <div><div style={{ fontSize: '28px', fontWeight: 800 }}>50K+</div><small style={{ opacity: 0.7 }}>Bookings</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: 'var(--surface-container-low)', margin: '50px 0px' }}>
        <div className="container">
          <div className="text-center"><span className="label" style={{ color: 'var(--primary)' }}>Our Values</span><h2 style={{ marginTop: '8px' }}>What drives us</h2></div>
          <div className="grid grid-4 mt-xl">
            {values.map((v, i) => (
              <div className="card" key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'rgba(83,43,136,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px' }}>{v.icon}</div>
                <h4>{v.title}</h4>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" style={{ marginBottom: '60px' }}>
        <div className="container">
          <div className="text-center">
            <span className="label" style={{ color: 'var(--primary)' }}>
              Leadership
            </span>
            <h2 style={{ marginTop: '8px' }}>Our Team</h2>
          </div>

          <div
            className="grid mt-xl"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
            }}
          >
            {team.map((t, i) => (
              <div
                key={i}
                className="card text-center"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  transition: '0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Image centered */}
                <img
                  src={t.image}
                  alt={t.name}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                    margin: '0 auto 12px',
                  }}
                />

                <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>
                  {t.name}
                </h4>

                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {t.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
