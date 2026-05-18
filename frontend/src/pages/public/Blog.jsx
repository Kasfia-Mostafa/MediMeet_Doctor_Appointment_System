import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { HiOutlineCalendar, HiOutlineArrowRight, HiOutlineClock, HiOutlineUser } from 'react-icons/hi';
import './Blog.css';

const categories = ['All', 'wellness', 'nutrition', 'mental-health', 'fitness', 'medical-tips', 'news', 'other'];

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const categoryParam = activeCategory === 'All' ? '' : `category=${activeCategory.toLowerCase()}`;
        const { data } = await API.get(`/blogs?${categoryParam}&page=${page}&limit=9`);
        setBlogs(data.blogs);
        setTotalPages(data.pages);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [activeCategory, page]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setPage(1);
  };

  if (loading) return (
    <div className="loader">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="blog-page fade-in">
      {/* Page Header */}
      <section className="blog-hero">
        <div className="container">
          <span className="blog-label">Medical Articles</span>
          <h1>Health & Wellness <span>Insights</span></h1>
          <p>Expert advice, latest research, and wellness tips from our certified medical professionals.</p>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="blog-tabs-wrapper">
        <div className="container">
          <div className="blog-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`blog-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat === 'All' ? cat : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <section className="blog-grid-section">
        <div className="container">
          {blogs.length === 0 ? (
            <div className="blog-empty">
              <div className="blog-empty-icon">📝</div>
              <h3>No articles found</h3>
              <p>We haven't published any articles in this category yet.</p>
              <button className="btn btn-secondary" onClick={() => handleCategoryChange('All')}>
                View All Articles
              </button>
            </div>
          ) : (
            <>
              {/* Featured Article (first one) */}
              {activeCategory === 'All' && page === 1 && blogs.length > 0 && (
                <Link to={`/blog/${blogs[0]._id}`} className="blog-featured">
                  {blogs[0].coverImage && (
                    <div className="blog-featured-img">
                      <img src={blogs[0].coverImage} alt={blogs[0].title} />
                    </div>
                  )}
                  <div className="blog-featured-body">
                    <div className="blog-meta">
                      <span className="blog-category-tag">{blogs[0].category.replace('-', ' ')}</span>
                      <span className="blog-date" style={{ marginRight: '8px' }}>
                        <HiOutlineUser />
                        {blogs[0].authorName || blogs[0].author?.name || 'Medical Team'}
                      </span>
                      <span className="blog-date">
                        <HiOutlineCalendar />
                        {new Date(blogs[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h2>{blogs[0].title}</h2>
                    <p>{blogs[0].excerpt || blogs[0].content?.substring(0, 200) + '...'}</p>
                    <div className="blog-featured-footer">
                      <span className="blog-read-link">
                        Read Full Article <HiOutlineArrowRight />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Article Grid */}
              <div className="blog-grid">
                {(activeCategory === 'All' && page === 1 ? blogs.slice(1) : blogs).map(blog => (
                  <Link to={`/blog/${blog._id}`} key={blog._id} className="blog-card">
                    {blog.coverImage && (
                      <div className="blog-card-img">
                        <img src={blog.coverImage} alt={blog.title} />
                      </div>
                    )}
                    <div className="blog-card-body">
                      <div className="blog-meta" style={{ flexWrap: 'wrap' }}>
                        <span className="blog-category-tag">{blog.category.replace('-', ' ')}</span>
                        <span className="blog-date" style={{ marginRight: '8px' }}>
                          <HiOutlineUser />
                          {blog.authorName || blog.author?.name || 'Medical Team'}
                        </span>
                        <span className="blog-date">
                          <HiOutlineCalendar />
                          {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3>{blog.title}</h3>
                      <p>{blog.excerpt || blog.content?.substring(0, 120) + '...'}</p>
                      <div className="blog-card-footer">
                        <span className="blog-read-link">
                          Read More <HiOutlineArrowRight />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    style={{ width: 'auto', padding: '0 16px' }}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={page === i + 1 ? 'active' : ''}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    style={{ width: 'auto', padding: '0 16px' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
