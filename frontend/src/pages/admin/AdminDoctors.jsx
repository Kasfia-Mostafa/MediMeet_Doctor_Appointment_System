import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineUserGroup, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/admin/staff?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      setDoctors(data.doctors || []);
      setTotalPages(data.pages || 1);
      setTotalDocs(data.total || 0);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Doctor Fetch Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDoctors]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2>Doctor Management</h2>
          <p>Displaying {totalDocs} total doctors</p>
        </div>
        <div className="flex gap-md items-center">
          <div className="search-bar" style={{ margin: 0 }}>
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              className="input"
              placeholder="Filter by name or specialization..."
              value={search}
              onChange={handleSearch}
              style={{ width: '350px' }}
            />

          </div>
          <Link to="/admin/add-doctor" className="btn btn-primary">
            <HiOutlinePlus /> Add Doctor
          </Link>
        </div>
      </div>

      {loading && doctors.length === 0 ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : doctors.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-icon"><HiOutlineUserGroup /></div>
          <h3>No doctors found</h3>
          <p>No matches for "{search}"</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{
              margin: 0,
              transition: 'opacity 0.25s ease-in-out',
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? 'none' : 'auto'
            }}>
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Specialization</th>
                  <th>Email Address</th>
                  <th>Consultation Fee</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d._id} className="hover-row">
                    <td>
                      <Link to={`/admin/doctors/${d._id}`} className="flex items-center gap-sm no-underline" style={{ color: 'inherit' }}>
                        <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '16px', flexShrink: 0 }}>
                          {d.user?.avatar ? (
                            <img src={d.user.avatar} alt={d.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            d.user?.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div style={{fontWeight: 600, color: 'var(--primary)'}}>{d.user?.name}</div>
                        </div>
                      </Link>
                    </td>
                    <td><span className="chip chip-info">{d.specialization}</span></td>
                    <td>{d.user?.email}</td>
                    <td>৳{d.consultationFee}</td>
                    <td>
                      <span className={`chip ${d.isAvailable ? 'chip-confirmed' : 'chip-pending'}`}>
                        {d.isAvailable ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-lg" style={{ padding: '0 10px' }}>
            <div style={{color: 'var(--text-muted)', fontSize: '14px'}}>
              Showing <strong>{(page-1)*10 + 1}</strong> to <strong>{Math.min(page*10, totalDocs)}</strong> of {totalDocs} doctors
            </div>

            <div className="flex items-center gap-md">
              <span style={{ fontSize: '14px' }}>Page {page} of {totalPages}</span>
              <div className="flex gap-xs">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <HiOutlineChevronLeft /> Prev
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Next <HiOutlineChevronRight />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
