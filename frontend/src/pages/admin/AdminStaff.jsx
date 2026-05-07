import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup, HiOutlineTrash, HiOutlineSearch,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineFilter
} from 'react-icons/hi';

export default function AdminStaff() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}&role=${roleFilter}`);
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalDocs(data.total || 0);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await API.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success('Role updated successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2>User Management</h2>
          <p>Control roles and system access ({totalDocs} total)</p>
        </div>
        <div className="search-bar" style={{ width: '300px' }}>
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-lg">
        <div className="tabs">
          {['all', 'patient', 'doctor', 'admin'].map(r => (
            <button
              key={r}
              className={`tab ${roleFilter === r ? 'active' : ''}`}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              style={{ textTransform: 'capitalize' }}
            >
              {r}s
            </button>
          ))}
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : users.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-icon"><HiOutlineUserGroup /></div>
          <h3>No users found</h3>
          <p>No matches found for your current filters.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper card" style={{ padding: 0, position: 'relative', overflow: 'hidden' }}>
            <table style={{
              margin: 0,
              transition: 'opacity 0.25s ease-in-out',
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? 'none' : 'auto'
            }}>
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Email Address</th>
                  <th>System Role</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="hover-row">
                    <td>
                      <div className="flex items-center gap-sm">
                        <div className="avatar avatar-sm">
                          {u.avatar ? <img src={u.avatar} alt="" /> : u.name.charAt(0)}
                        </div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="input"
                        style={{ padding: '6px 14px', width: 'auto', minWidth: '130px', fontSize: '13px', borderRadius: '8px', cursor: 'pointer' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                      {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--error)' }}
                        onClick={() => handleDelete(u._id, u.name)}
                        title="Delete User"
                      >
                        <HiOutlineTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar flex items-center justify-between mt-lg">
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Showing <strong>{(page-1)*10 + 1}</strong> to <strong>{Math.min(page*10, totalDocs)}</strong> of {totalDocs} users
            </div>

            <div className="flex items-center gap-md">
              <span style={{ fontSize: '14px' }}>Page {page} of {totalPages}</span>
              <div className="flex gap-xs">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === 1 || loading}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <HiOutlineChevronLeft /> Prev
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === totalPages || loading}
                  onClick={() => handlePageChange(page + 1)}
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
