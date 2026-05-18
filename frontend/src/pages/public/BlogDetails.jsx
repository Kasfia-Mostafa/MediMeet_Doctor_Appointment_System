import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import { HiOutlineCalendar, HiOutlineArrowLeft, HiOutlineUser } from 'react-icons/hi';
import './Blog.css'; // Reuse blog styles

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await API.get(`/blogs/${id}`);
        setBlog(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) return (
    <div className="loader">
      <div className="spinner"></div>
    </div>
  );

  if (!blog) return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <h2>Article not found</h2>
      <Link to="/blog" className="btn btn-primary" style={{ marginTop: '16px' }}>Return to Articles</Link>
    </div>
  );

  return (
    <div className="blog-details-page fade-in" style={{ paddingBottom: '80px' }}>
      {/* Article Header */}
      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
          <Link to="/blog" className="blog-read-link" style={{ marginBottom: '24px', display: 'inline-flex' }}>
            <HiOutlineArrowLeft /> Back to Medical Articles
          </Link>

          <div className="blog-meta" style={{ marginBottom: '16px' }}>
            {blog.category && (
              <span className="blog-category-tag">{blog.category.replace('-', ' ')}</span>
            )}
            <span className="blog-date">
              <HiOutlineCalendar />
              {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 style={{ fontSize: '40px', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px', color: 'var(--text-primary)' }}>
            {blog.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '32px', borderBottom: '1px solid var(--outline-variant)' }}>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '15px' }}>
                {blog.authorName || blog.author?.name || 'Medical Team'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Author
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Cover Image */}
      {blog.coverImage && (
        <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', borderRadius: '24px', overflow: 'hidden', maxHeight: '500px' }}>
            <img
              src={blog.coverImage}
              alt={blog.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="container">
        <div
          className="blog-content"
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            fontSize: '18px',
            lineHeight: '1.8',
            color: 'var(--text-secondary)'
          }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  );
}
