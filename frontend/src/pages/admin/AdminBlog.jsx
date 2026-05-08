import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineDocumentText, HiOutlineTrash, HiOutlinePlus,
  HiOutlinePhotograph, HiOutlineEye, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlinePencil
} from 'react-icons/hi';

export default function AdminBlog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'wellness',
    isPublished: true
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/admin/blogs?page=${page}&limit=6`);
      setBlogs(data.blogs);
      setTotalPages(data.pages);
      setTotalDocs(data.total);
    } catch (err) {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (file) formData.append('coverImage', file);

    try {
      const action = editingId ? 'Updating' : 'Publishing';
      toast.loading(`${action} blog...`, { id: 'blog-post' });
      
      if (editingId) {
        await API.put(`/admin/blogs/${editingId}`, formData);
        toast.success('Blog updated successfully!', { id: 'blog-post' });
      } else {
        await API.post('/admin/blogs', formData);
        toast.success('Blog published successfully!', { id: 'blog-post' });
      }

      setShowAdd(false);
      setEditingId(null);
      setForm({ title: '', excerpt: '', content: '', category: 'wellness', isPublished: true });
      setFile(null);
      setPreview(null);
      fetchBlogs();
    } catch (err) {
      toast.error(`Failed to ${editingId ? 'update' : 'publish'} blog`, { id: 'blog-post' });
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      isPublished: blog.isPublished
    });
    setPreview(blog.coverImage);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await API.delete(`/admin/blogs/${id}`);
      toast.success('Blog deleted');
      fetchBlogs();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2>Medical Articles Management</h2>
          <p>{editingId ? 'Editing Article' : 'Create and manage health articles for your patients'}</p>
        </div>
        <button
          className={`btn ${showAdd ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => {
            if (showAdd) {
              setShowAdd(false);
              setEditingId(null);
              setForm({ title: '', excerpt: '', content: '', category: 'wellness', isPublished: true });
              setPreview(null);
              setFile(null);
            } else {
              setShowAdd(true);
            }
          }}
          style={{ gap: '8px' }}
        >
          {showAdd ? <><HiOutlineXCircle /> Cancel</> : <><HiOutlinePlus /> Create New Post</>}
        </button>
      </div>

      {showAdd ? (
        <div className="card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} className="grid" style={{ gap: '20px' }}>
            <div className="input-group">
              <label>Article Title</label>
              <input
                className="input"
                placeholder="e.g. 10 Tips for Heart Health"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="input-group">
                <label>Category</label>
                <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="wellness">Wellness</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="mental-health">Mental Health</option>
                  <option value="fitness">Fitness</option>
                  <option value="medical-tips">Medical Tips</option>
                </select>
              </div>
              <div className="input-group">
                <label>Status</label>
                <select className="input" value={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.value === 'true'})}>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Cover Image</label>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  height: '200px', width: '100%', borderRadius: '12px', border: '2px dashed var(--outline-variant)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', backgroundColor: 'var(--surface-container-low)',
                  transition: 'border-color 0.2s'
                }}
              >
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <HiOutlinePhotograph style={{ fontSize: '40px', color: 'var(--text-muted)', marginBottom: '8px' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Click to upload cover image</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
            </div>

            <div className="input-group">
              <label>Short Excerpt</label>
              <textarea
                className="input"
                style={{ minHeight: '80px' }}
                placeholder="A brief summary for the preview card..."
                value={form.excerpt}
                onChange={e => setForm({...form, excerpt: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label>Full Content (Markdown supported)</label>
              <textarea
                className="input"
                style={{ minHeight: '300px' }}
                placeholder="Write your article here..."
                value={form.content}
                onChange={e => setForm({...form, content: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              {editingId ? 'Update Article' : 'Publish Article'}
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            {blogs.length === 0 && !loading ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                <HiOutlineDocumentText style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>No articles yet</h3>
                <p>Start sharing health insights with your patients by creating your first post.</p>
              </div>
            ) : (
              blogs.map(blog => (
                <div key={blog._id} className="card blog-card fade-in" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '180px', position: 'relative' }}>
                    <img
                      src={blog.coverImage || 'https://images.unsplash.com/photo-1505751172107-16d7d6f51042?w=800&q=80'}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      {blog.isPublished ? (
                        <span className="chip chip-completed"><HiOutlineCheckCircle /> Published</span>
                      ) : (
                        <span className="chip chip-pending">Draft</span>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      {blog.category}
                    </span>
                    <h4 style={{ marginBottom: '12px', lineHeight: 1.4 }}>{blog.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', flex: 1 }}>
                      {blog.excerpt.length > 100 ? blog.excerpt.substring(0, 100) + '...' : blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-xs">
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}><HiOutlineEye /></button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--primary)' }}
                          onClick={() => handleEdit(blog)}
                          title="Edit Article"
                        >
                          <HiOutlinePencil />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--error)' }}
                          onClick={() => handleDelete(blog._id)}
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {blogs.length > 0 && (
            <div className="pagination-bar flex items-center justify-between mt-xl" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Showing <strong>{(page - 1) * 6 + 1}</strong> to <strong>{Math.min(page * 6, totalDocs)}</strong> of {totalDocs} articles
              </div>

              <div className="flex items-center gap-md">
                <span style={{ fontSize: '14px' }}>Page {page} of {totalPages}</span>
                <div className="flex gap-xs">
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page === 1 || loading}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Prev
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page === totalPages || loading}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
