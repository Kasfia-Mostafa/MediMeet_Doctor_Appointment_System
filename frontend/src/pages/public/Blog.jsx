import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { HiOutlineCalendar, HiOutlineEye, HiOutlineArrowRight, HiOutlineClock, HiOutlineUser } from 'react-icons/hi';
import './Blog.css';

const categories = ['All', 'wellness', 'nutrition', 'mental-health', 'fitness', 'medical-tips', 'news', 'other'];

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await API.get('/blogs');
        setBlogs(data.blogs);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = activeCategory === 'All' 
    ? blogs 
    : blogs.filter(b => b.category?.toLowerCase() === activeCategory.toLowerCase());

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
                onClick={() => setActiveCategory(cat)}
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
          {filteredBlogs.length === 0 ? (
            <div className="blog-empty">
              <div className="blog-empty-icon">📝</div>
              <h3>No articles found</h3>
              <p>We haven't published any articles in this category yet.</p>
              <button className="btn btn-secondary" onClick={() => setActiveCategory('All')}>
                View All Articles
              </button>
            </div>
          ) : (
            <>
              {/* Featured Article (first one) */}
              {activeCategory === 'All' && filteredBlogs.length > 0 && (
                <Link to={`/blog/${filteredBlogs[0]._id}`} className="blog-featured">
                  {filteredBlogs[0].coverImage && (
                    <div className="blog-featured-img">
                      <img src={filteredBlogs[0].coverImage} alt={filteredBlogs[0].title} />
                    </div>
                  )}
                  <div className="blog-featured-body">
                    <div className="blog-meta">
                      <span className="blog-category-tag">{filteredBlogs[0].category.replace('-', ' ')}</span>
                      <span className="blog-date" style={{ marginRight: '8px' }}>
                        <HiOutlineUser />
                        {filteredBlogs[0].author?.name || 'Medical Team'}
                      </span>
                      <span className="blog-date">
                        <HiOutlineCalendar />
                        {new Date(filteredBlogs[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h2>{filteredBlogs[0].title}</h2>
                    <p>{filteredBlogs[0].excerpt || filteredBlogs[0].content?.substring(0, 200) + '...'}</p>
                    <div className="blog-featured-footer">
                      <span className="blog-read-link">
                        Read Full Article <HiOutlineArrowRight />
                      </span>
                      <span className="blog-views">
                        <HiOutlineEye /> {filteredBlogs[0].views || 0} views
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Article Grid */}
              <div className="blog-grid">
                {(activeCategory === 'All' ? filteredBlogs.slice(1) : filteredBlogs).map(blog => (
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
                          {blog.author?.name || 'Medical Team'}
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
                        <span className="blog-views">
                          <HiOutlineEye /> {blog.views || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
