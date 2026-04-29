// ─────────────────────────────────────────────────────────────────────────────
// BlogPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { blogAPI } from '../services/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
  :root { --gold:#C9A84C;--gold-light:#E8C97A;--gold-dark:#8B6914;--ivory:#FAF7F0;--ink:#0D0A0B;--cream:#F5EDD8; }
  .eyebrow { font-family:'Outfit',sans-serif;font-size:0.65rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--gold);font-weight:500; }
  .ornament { display:flex;align-items:center;gap:1rem;justify-content:center;margin:0.75rem 0; }
  .ornament::before,.ornament::after { content:'';flex:1;max-width:60px;height:1px; }
  .ornament::before { background:linear-gradient(90deg,transparent,var(--gold)); }
  .ornament::after { background:linear-gradient(90deg,var(--gold),transparent); }
  .blog-card {
    background:white;border:1px solid rgba(201,168,76,0.1);overflow:hidden;display:flex;
    flex-direction:column;text-decoration:none;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  .blog-card:hover { transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,0.09),0 0 0 1px rgba(201,168,76,0.2); }
  .blog-card img { transition:transform 0.7s ease; }
  .blog-card:hover img { transform:scale(1.06); }
  .blog-card .read-more { opacity:0;transition:opacity 0.3s ease; }
  .blog-card:hover .read-more { opacity:1; }
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;}
  .d1{animation-delay:0.1s}.d2{animation-delay:0.2s}
  .skeleton{background:linear-gradient(90deg,#f0ebe0 25%,#e8e0d0 50%,#f0ebe0 75%);background-size:200% auto;animation:shimmer 1.5s linear infinite;}
  @keyframes shimmer{0%{background-position:200%}100%{background-position:-200%}}
`;

export function BlogPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        blogAPI.getAll()
            .then(r => setBlogs(Array.isArray(r.data?.data) ? r.data.data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <style>{STYLES}</style>
            <Helmet><title>Blog – Shiv Event Management</title></Helmet>
            <Navbar />
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', paddingTop: '7rem', paddingBottom: '5rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <p className="eyebrow fade-up mb-4">Insights & Ideas</p>
                        <h1 className="fade-up d1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, color: 'var(--ink)', marginBottom: '0.5rem' }}>
                            Event Planning <em style={{ color: 'var(--gold-dark)' }}>Journal</em>
                        </h1>
                        <div className="ornament fade-up d1"><span style={{ color: 'var(--gold)' }}>✦</span></div>
                        <p className="fade-up d2" style={{ fontFamily: 'Outfit', fontWeight: 300, color: '#888', marginTop: '0.75rem', maxWidth: '400px', margin: '0.75rem auto 0' }}>
                            Tips, trends, and inspiration for every occasion.
                        </p>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '380px' }} />)}
                        </div>
                    ) : blogs.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                            {blogs.map((blog, idx) => (
                                <Link key={blog._id} to={`/blog/${blog.slug}`} className="blog-card fade-up" style={{ animationDelay: `${(idx % 3) * 0.1}s` }}>
                                    <div style={{ height: '220px', overflow: 'hidden', background: '#f5edd8', flexShrink: 0 }}>
                                        {blog.image ? (
                                            <img src={blog.image} alt={blog.title} loading="lazy"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                onError={e => { e.target.src = 'https://placehold.co/600x400/f5edd8/c9a84c?text=✦'; }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--gold)', opacity: 0.4 }}>✦</div>
                                        )}
                                    </div>
                                    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <span className="eyebrow mb-3">{blog.category}</span>
                                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '0.75rem', lineHeight: 1.3, transition: 'color 0.3s' }}>
                                            {blog.title}
                                        </h3>
                                        <p style={{
                                            fontFamily: 'Outfit', fontSize: '0.875rem', color: '#888', lineHeight: 1.7, fontWeight: 300, flex: 1, marginBottom: '1.5rem',
                                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>
                                            {blog.excerpt}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                                            <span style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: '#bbb', letterSpacing: '0.05em' }}>
                                                {new Date(blog.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                            </span>
                                            <span className="read-more" style={{ fontFamily: 'Outfit', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 500 }}>
                                                Read More →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                            <div style={{ fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '1rem' }}>✦</div>
                            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: 'var(--ink)' }}>No blog posts yet</h3>
                            <p style={{ fontFamily: 'Outfit', color: '#999', fontWeight: 300, marginTop: '0.5rem' }}>Blog content is coming soon. Stay tuned!</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default BlogPage;