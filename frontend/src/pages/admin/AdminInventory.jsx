import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineCube, HiOutlinePlus, HiOutlineTrash, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', quantity: '', unit: '', minThreshold: '' });

  useEffect(() => {
    API.get('/admin/inventory')
      .then(({ data }) => setItems(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/admin/inventory', form);
      setItems([...items, data]);
      setShowForm(false);
      setForm({ name: '', category: '', quantity: '', unit: '', minThreshold: '' });
      toast.success('Item added');
    } catch { toast.error('Failed to add'); }
  };

  const handleUpdateQuantity = async (id, val) => {
    try {
      const { data } = await API.put(`/admin/inventory/${id}`, { quantity: val });
      setItems(items.map(i => i._id === id ? data : i));
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete item?')) return;
    try {
      await API.delete(`/admin/inventory/${id}`);
      setItems(items.filter(i => i._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const lowStockCount = items.filter(i => i.quantity <= i.minThreshold).length;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-xl">
        <div className="page-header" style={{ marginBottom: 0 }}><h2>Inventory</h2><p>Manage medical supplies and equipment</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><HiOutlinePlus /> Add Item</button>
      </div>

      {lowStockCount > 0 && (
        <div style={{ background: 'var(--error-container)', color: 'var(--error)', padding: '16px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <HiOutlineExclamationCircle style={{ fontSize: '24px' }} /> <strong>Warning:</strong> {lowStockCount} items are running low on stock.
        </div>
      )}

      {showForm && (
        <div className="card mb-xl">
          <h4 style={{ marginBottom: '16px' }}>Add New Item</h4>
          <form onSubmit={handleAdd}>
            <div className="grid grid-2">
              <div className="input-group"><label>Item Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="input-group"><label>Category</label><input className="input" placeholder="e.g. Medicine, Equipment" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required /></div>
            </div>
            <div className="grid grid-3">
              <div className="input-group"><label>Quantity</label><input type="number" className="input" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required /></div>
              <div className="input-group"><label>Unit</label><input className="input" placeholder="e.g. Boxes, Bottles" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} required /></div>
              <div className="input-group"><label>Low Stock Alert</label><input type="number" className="input" value={form.minThreshold} onChange={e => setForm({...form, minThreshold: e.target.value})} required /></div>
            </div>
            <div className="flex gap-md"><button type="submit" className="btn btn-primary">Save Item</button><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        </div>
      )}

      {loading ? <div className="loader"><div className="spinner"></div></div> : items.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"><HiOutlineCube /></div><h3>Inventory empty</h3></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Item Name</th><th>Category</th><th>Quantity</th><th>Unit</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(i => {
                const isLow = i.quantity <= i.minThreshold;
                return (
                  <tr key={i._id} style={{ background: isLow ? 'var(--error-container)' : 'transparent' }}>
                    <td style={{ fontWeight: 600 }}>{i.name}</td>
                    <td>{i.category}</td>
                    <td>
                      <div className="flex items-center gap-sm">
                        <input type="number" className="input" style={{ width: '80px', padding: '4px 8px', height: '32px' }} value={i.quantity} onChange={e => handleUpdateQuantity(i._id, e.target.value)} />
                      </div>
                    </td>
                    <td>{i.unit}</td>
                    <td>{isLow ? <span className="chip chip-cancelled">Low Stock</span> : <span className="chip chip-completed">In Stock</span>}</td>
                    <td><button className="btn btn-ghost btn-sm" style={{color:'var(--error)'}} onClick={() => handleDelete(i._id)}><HiOutlineTrash /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
