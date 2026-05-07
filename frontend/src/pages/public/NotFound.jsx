import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineHome } from 'react-icons/hi';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <div>
        <div style={{ fontSize: '120px', fontFamily: 'var(--font-headline)', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
          404
        </div>
        <h2 style={{ marginTop: '16px', marginBottom: '12px' }}>Page Not Found</h2>
        <p style={{ maxWidth: '400px', margin: '0 auto 32px', color: 'var(--text-muted)' }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex justify-center gap-md">
          <Link to="/" className="btn btn-primary"><HiOutlineHome /> Go Home</Link>
          <button onClick={() => window.history.back()} className="btn btn-secondary"><HiOutlineArrowLeft /> Go Back</button>
        </div>
      </div>
    </div>
  );
}
