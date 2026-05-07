import { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import { HiOutlineCreditCard, HiOutlineReceiptTax, HiOutlineCurrencyDollar } from 'react-icons/hi';

export default function PatientBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/billing').then(({ data }) => setBills(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalPaid = useMemo(() => bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + (Number(b.netAmount) || 0), 0), [bills]);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h2>Billing & Payments</h2>
        <p>View and manage your consultation invoices</p>
      </div>

      <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="stat-card glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="stat-icon" style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '14px', fontSize: '28px' }}>
            <HiOutlineCurrencyDollar />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '4px' }}>Total Paid</p>
            <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>৳{totalPaid}</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', overflow: 'hidden' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 600 }}>Recent Invoices</h3>
        {loading ? <div className="loader"><div className="spinner"></div></div> : bills.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 0' }}>
            <div className="empty-icon" style={{ fontSize: '56px', color: 'var(--primary)', opacity: 0.5, marginBottom: '16px' }}><HiOutlineCreditCard /></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>No billing history</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Your payment records will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Invoice ID</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Date</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Doctor</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Amount</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Status</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Method</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--primary)' }}>{b.invoiceNumber}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-primary)' }}>{new Date(b.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-primary)' }}>{b.appointment?.doctor?.name ? `Dr. ${b.appointment.doctor.name}` : 'Consultation'}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>৳{Number(b.netAmount) || 0}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`chip chip-${b.status}`} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textTransform: 'capitalize', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {b.paymentMethod || '—'}
                    </td>
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
