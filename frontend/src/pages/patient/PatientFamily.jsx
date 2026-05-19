import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineUsers, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

export default function PatientFamily() {
  const { user, fetchUser } = useAuth();
  const [members, setMembers] = useState(user?.familyMembers || []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', relation: '', dateOfBirth: '', bloodGroup: '' });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMembers(user?.familyMembers || []);
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users/family', form);
      await fetchUser();
      setShowForm(false);
      setForm({ name: '', relation: '', dateOfBirth: '', bloodGroup: '' });
      toast.success('Family member added');
    } catch { toast.error('Failed to add'); }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this family member?')) return;
    try {
      await API.delete(`/users/family/${id}`);
      await fetchUser();
      toast.success('Removed');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-xl">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Family Profiles</h2>
          <p>Manage health profiles for your family</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus /> Add Member
        </button>
      </div>

      {showForm && (
        <div className="card mb-xl">
          <h4 style={{ marginBottom: '16px' }}>Add Family Member</h4>
          <form onSubmit={handleAdd}>
            <div className="grid grid-2">
              <div className="input-group">
                <label>Name</label>
                <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Relation</label>
                <select className="input" value={form.relation} onChange={e => setForm({...form, relation: e.target.value})} required>
                  <option value="">Select...</option>
                  <option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option>
                </select>
              </div>
            </div>
            <div className="flex gap-md">
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {members.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"><HiOutlineUsers /></div><h3>No family members</h3></div>
      ) : (
        <div className="grid grid-3">
          {members.map(m => (
            <div className="card" key={m._id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <div className="avatar">{m.name.charAt(0)}</div>
                  <div><h4 style={{fontSize:'16px'}}>{m.name}</h4><p style={{fontSize:'13px',color:'var(--primary)'}}>{m.relation}</p></div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{color:'var(--error)'}} onClick={() => handleRemove(m._id)}><HiOutlineTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
