import { useState, useEffect, useMemo, useRef } from 'react';
import API from '../../api/axios';
import { HiOutlineCreditCard, HiOutlineReceiptTax, HiOutlineCurrencyDollar, HiOutlineDownload, HiOutlineInformationCircle } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../../assets/MediMeet-Logo.png';

export default function PatientBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const invoiceRef = useRef(null);
  const [activeBill, setActiveBill] = useState(null);

  useEffect(() => {
    API.get('/billing').then(({ data }) => setBills(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalPaid = useMemo(() => bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + (Number(b.netAmount) || 0), 0), [bills]);

  const handleDownloadInvoice = async (bill) => {
    setDownloading(bill._id);
    setActiveBill(bill);
    
    // Wait for the hidden invoice to render
    setTimeout(async () => {
      try {
        const element = invoiceRef.current;
        const canvas = await html2canvas(element, {
          scale: 2, // High quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`MediMeet_Invoice_${bill.invoiceNumber}.pdf`);
        toast.success('Invoice downloaded successfully!');
      } catch (err) {
        console.error('PDF Generation Error:', err);
        toast.error('Failed to generate PDF. Please try again.');
      } finally {
        setDownloading(null);
        setActiveBill(null);
      }
    }, 100);
  };

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
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Invoice ID</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Date</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Doctor</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Amount</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Status</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Action</th>
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
                    <td style={{ padding: '16px 20px' }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => handleDownloadInvoice(b)}
                        disabled={downloading === b._id}
                        style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {downloading === b._id ? (
                          <>Generating...</>
                        ) : (
                          <><HiOutlineDownload size={18} /> Download</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hidden Invoice Template for PDF Generation */}
      {activeBill && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div 
            ref={invoiceRef}
            style={{ 
              width: '800px', 
              padding: '60px', 
              background: 'white', 
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              color: '#1e1b4b',
              lineHeight: '1.6'
            }}
          >
            <style>
              {`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .paid-stamp {
                  position: absolute;
                  top: 150px;
                  right: 100px;
                  width: 150px;
                  height: 150px;
                  border: 6px solid #22c55e;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #22c55e;
                  font-size: 32px;
                  font-weight: 800;
                  text-transform: uppercase;
                  transform: rotate(-15deg);
                  opacity: 0.15;
                }
              `}
            </style>
            
            {activeBill.status === 'paid' && <div className="paid-stamp">PAID</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={logo} alt="MediMeet Logo" style={{ width: '80px', height: 'auto' }} />
                <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '15px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#532B88' }}>MediMeet</div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Clinical Network</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h1 style={{ fontSize: '42px', fontWeight: 800, margin: 0, color: '#532B88' }}>INVOICE</h1>
                <p style={{ margin: '8px 0 0 0', fontWeight: 600, color: '#64748b' }}>#{activeBill.invoiceNumber}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '60px', marginBottom: '50px' }}>
              <div>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#64748b', margin: '0 0 12px 0' }}>Billed To</h4>
                <p style={{ fontSize: '20px', color: '#532B88', fontWeight: 700 }}>{activeBill.patient?.name || 'Valued Patient'}</p>
                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>{activeBill.patient?.email}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#64748b', margin: '0 0 12px 0' }}>Invoice Details</h4>
                <p style={{ fontWeight: 600 }}>Date: {new Date(activeBill.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p style={{ fontWeight: 600 }}>Method: {activeBill.paymentMethod || 'Credit Card'}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '18px 0', borderBottom: '2px solid #e2e8f0', fontSize: '13px', color: '#64748b' }}>Service Description</th>
                  <th style={{ textAlign: 'center', padding: '18px 0', borderBottom: '2px solid #e2e8f0', fontSize: '13px', color: '#64748b' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '18px 0', borderBottom: '2px solid #e2e8f0', fontSize: '13px', color: '#64748b' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(activeBill.items && activeBill.items.length > 0 ? activeBill.items : [{ description: 'Medical Consultation Fee', amount: activeBill.totalAmount, quantity: 1 }]).map((item, i) => (
                  <tr key={i}>
                    <td style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 600, fontSize: '16px' }}>{item.description}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Professional Clinical Service</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid #f1f5f9' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '20px 0', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>৳{item.amount * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '320px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ color: '#64748b' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>৳{activeBill.totalAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ color: '#64748b' }}>Tax & VAT</span>
                  <span style={{ fontWeight: 600 }}>৳0.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderTop: '2px solid #532B88', marginTop: '10px', fontSize: '28px', fontWeight: 800, color: '#532B88' }}>
                  <span>Total Due</span>
                  <span>৳{activeBill.netAmount}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px' }}>
              <div>
                <p style={{ fontWeight: 700, color: '#1e1b4b', marginBottom: '4px' }}>MediMeet HQ</p>
                <p>House 42, Road 18, Banani, Dhaka</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p>support@medimeet.com</p>
                <p>+880 1234-567890</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
