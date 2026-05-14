import { useState, useEffect } from 'react';
import { HiOutlineHeart, HiOutlineTrendingUp, HiOutlineSave, HiOutlinePencilAlt, HiOutlineClock } from 'react-icons/hi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function PatientWellness() {
  const [data, setData] = useState({
    metrics: { heartRate: 72, bloodPressure: '120/80', temperature: 98.6, oxygen: 98, weight: 68 },
    goals: { steps: 0, water: 0, sleep: 0 }
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todayRes, historyRes] = await Promise.all([
          API.get('/wellness/today'),
          API.get('/wellness/history')
        ]);
        if (todayRes.data && todayRes.data.metrics) {
          setData(todayRes.data);
        }
        setHistory(historyRes.data || []);
      } catch (err) {
        toast.error('Failed to fetch wellness data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const res = await API.post('/wellness/today', data);
      setData(res.data);
      toast.success('Health Insight updated!');
      setIsEditing(false);

      // Refresh history
      const historyRes = await API.get('/wellness/history');
      setHistory(historyRes.data || []);
    } catch (err) {
      toast.error('Failed to update tracker');
    }
  };

  const targetGoals = { steps: 10000, water: 8, sleep: 8 };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Health Insight</h2>
          <p>Monitor your daily health metrics and wellness goals</p>
        </div>
        {!isEditing ? (
          <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
            <HiOutlinePencilAlt /> Update Today's Log
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <HiOutlineSave /> Save Log
            </button>
          </div>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card" style={{ border: isEditing ? '2px solid var(--primary)' : '' }}>
          <div style={{ fontSize: '32px' }}>❤️</div>
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Heart Rate</div>
            {isEditing ? (
              <input type="number" className="form-input" value={data.metrics.heartRate} onChange={e => handleChange('metrics', 'heartRate', e.target.value)} style={{ marginTop: '8px', padding: '8px' }} />
            ) : (
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: '28px', fontWeight: 800, color: 'var(--error)' }}>{data.metrics.heartRate || '-'} <small style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>bpm</small></div>
            )}
          </div>
        </div>

        <div className="stat-card" style={{ border: isEditing ? '2px solid var(--primary)' : '' }}>
          <div style={{ fontSize: '32px' }}>🩸</div>
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Blood Pressure</div>
            {isEditing ? (
              <input type="text" className="form-input" value={data.metrics.bloodPressure} onChange={e => handleChange('metrics', 'bloodPressure', e.target.value)} placeholder="120/80" style={{ marginTop: '8px', padding: '8px' }} />
            ) : (
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{data.metrics.bloodPressure || '-'} <small style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>mmHg</small></div>
            )}
          </div>
        </div>

        <div className="stat-card" style={{ border: isEditing ? '2px solid var(--primary)' : '' }}>
          <div style={{ fontSize: '32px' }}>🌡️</div>
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Temperature</div>
            {isEditing ? (
              <input type="number" step="0.1" className="form-input" value={data.metrics.temperature} onChange={e => handleChange('metrics', 'temperature', e.target.value)} style={{ marginTop: '8px', padding: '8px' }} />
            ) : (
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: '28px', fontWeight: 800, color: 'var(--warning)' }}>{data.metrics.temperature || '-'} <small style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>°F</small></div>
            )}
          </div>
        </div>

        <div className="stat-card" style={{ border: isEditing ? '2px solid var(--primary)' : '' }}>
          <div style={{ fontSize: '32px' }}>⚖️</div>
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Weight</div>
            {isEditing ? (
              <input type="number" className="form-input" value={data.metrics.weight} onChange={e => handleChange('metrics', 'weight', e.target.value)} style={{ marginTop: '8px', padding: '8px' }} />
            ) : (
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: '28px', fontWeight: 800, color: 'var(--success)' }}>{data.metrics.weight || '-'} <small style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>kg</small></div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card mb-xl">
          <div className="card-header"><h4>Daily Goals Progress</h4></div>
          <div className="flex flex-col gap-lg">
            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-sm">
                <span style={{ fontWeight: 600, fontSize: '14px' }}>👟 Daily Steps</span>
                {isEditing ? (
                  <input type="number" value={data.goals.steps} onChange={e => handleChange('goals', 'steps', e.target.value)} style={{ width: '80px', padding: '4px' }} />
                ) : (
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{data.goals.steps} / {targetGoals.steps}</span>
                )}
              </div>
              <div style={{ height: '8px', background: 'var(--surface-container-high)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((data.goals.steps / targetGoals.steps) * 100, 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Water */}
            <div>
              <div className="flex items-center justify-between mb-sm">
                <span style={{ fontWeight: 600, fontSize: '14px' }}>💧 Water Intake (Glasses)</span>
                {isEditing ? (
                  <input type="number" value={data.goals.water} onChange={e => handleChange('goals', 'water', e.target.value)} style={{ width: '80px', padding: '4px' }} />
                ) : (
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{data.goals.water} / {targetGoals.water}</span>
                )}
              </div>
              <div style={{ height: '8px', background: 'var(--surface-container-high)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((data.goals.water / targetGoals.water) * 100, 100)}%`, height: '100%', background: 'var(--info)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Sleep */}
            <div>
              <div className="flex items-center justify-between mb-sm">
                <span style={{ fontWeight: 600, fontSize: '14px' }}>😴 Sleep Hours</span>
                {isEditing ? (
                  <input type="number" value={data.goals.sleep} onChange={e => handleChange('goals', 'sleep', e.target.value)} style={{ width: '80px', padding: '4px' }} />
                ) : (
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{data.goals.sleep} / {targetGoals.sleep}</span>
                )}
              </div>
              <div style={{ height: '8px', background: 'var(--surface-container-high)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((data.goals.sleep / targetGoals.sleep) * 100, 100)}%`, height: '100%', background: 'var(--secondary)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h4>7-Day History</h4></div>
          {history.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <HiOutlineClock style={{ fontSize: '48px', color: 'var(--accent-light)' }} />
              <p style={{ marginTop: '12px' }}>Your logged history will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {history.map(entry => (
                <div key={entry._id} className="flex items-center justify-between" style={{ padding: '12px', background: 'var(--surface-container-lowest)', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
                  <div style={{ fontWeight: 600 }}>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  <div className="flex gap-md" style={{ fontSize: '13px' }}>
                    <span title="Steps">👟 {entry.goals?.steps || 0}</span>
                    <span title="Water">💧 {entry.goals?.water || 0}</span>
                    <span title="Blood Pressure">🩸 {entry.metrics?.bloodPressure || '-'}</span>
                    <span title="Temperature">🌡️ {entry.metrics?.temperature || '-'}°F</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
