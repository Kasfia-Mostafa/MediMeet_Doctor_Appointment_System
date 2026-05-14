import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { HiOutlineCurrencyBangladeshi, HiOutlineCalendar, HiOutlineTrendingUp, HiOutlineCreditCard } from 'react-icons/hi';

export default function DoctorEarnings() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    paidAppointments: 0,
    pendingPayments: 0,
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/appointments')
      .then(({ data }) => {
        const appointments = data.appointments || [];
        const paid = appointments.filter(a => a.paymentStatus === 'paid');
        const pending = appointments.filter(a => a.paymentStatus === 'pending' && ['confirmed', 'completed'].includes(a.status));
        
        const total = paid.reduce((sum, a) => sum + (a.doctorProfile?.consultationFee || 0), 0);
        
        setStats({
          totalEarnings: total,
          paidAppointments: paid.length,
          pendingPayments: pending.length,
          recentPayments: paid.slice(0, 5)
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Revenue & Earnings</h2>
        <p>Track your consultation earnings and payment history</p>
      </div>

      <div className="grid grid-2 mb-xl">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--primary), #4f46e5)', color: 'white' }}>
          <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}><HiOutlineCurrencyBangladeshi /></div>
          <div>
            <div className="stat-value" style={{ color: 'white' }}>৳{stats.totalEarnings}</div>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Earnings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success"><HiOutlineCreditCard /></div>
          <div>
            <div className="stat-value">{stats.paidAppointments}</div>
            <div className="stat-label">Paid Consultations</div>
          </div>
        </div>
        </div>

      <div className="card">
        <div className="card-header flex items-center justify-between mb-lg">
          <h4>Recent Payouts</h4>
          <span className="chip chip-confirmed">Settled</span>
        </div>

        {stats.recentPayments.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <p>No payment records found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPayments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="flex items-center gap-sm">
                        <div className="avatar avatar-sm">{p.patient?.name?.charAt(0)}</div>
                        {p.patient?.name}
                      </div>
                    </td>
                    <td>{new Date(p.date).toLocaleDateString()}</td>
                    <td><code style={{ fontSize: '12px' }}>{p.transactionId || 'INTERNAL_TRX'}</code></td>
                    <td style={{ fontWeight: 700 }}>৳{p.doctorProfile?.consultationFee || 0}</td>
                    <td><span className="chip chip-confirmed">Paid</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
