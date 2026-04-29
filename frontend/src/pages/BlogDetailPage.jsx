import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { blogAPI } from '../services/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
  :root { --gold:#C9A84C;--gold-light:#E8C97A;--gold-dark:#8B6914;--ivory:#FAF7F0;--ink:#0D0A0B;--cream:#F5EDD8; }
  .eyebrow { font-family:'Outfit',sans-serif;font-size:0.65rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--gold);font-weight:500; }
  .blog-prose { font-family:'Outfit',sans-serif;font-weight:300;color:#555;line-height:1.9;font-size:1rem; }
  .blog-prose h1,.blog-prose h2,.blog-prose h3 { font-family:'Cormorant Garamond',serif;font-weight:400;color:var(--ink);margin:2rem 0 1rem; }
  .blog-prose h1 { font-size:2.2rem; }
  .blog-prose h2 { font-size:1.8rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(201,168,76,0.2); }
  .blog-prose h3 { font-size:1.4rem; }
  .blog-prose p { margin:1.25rem 0; }
  .blog-prose a { color:var(--gold-dark);text-decoration:none;border-bottom:1px solid rgba(201,168,76,0.3);transition:border-color 0.2s; }
  .blog-prose a:hover { border-color:var(--gold); }
  .blog-prose ul,.blog-prose ol { padding-left:1.5rem;margin:1.25rem 0; }
  .blog-prose li { margin-bottom:0.5rem; }
  .blog-prose blockquote { border-left:3px solid var(--gold);margin:2rem 0;padding:0.75rem 1.5rem;background:rgba(201,168,76,0.04); }
  .blog-prose blockquote p { font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.2rem;color:var(--ink);margin:0; }
  .blog-prose img { width:100%;border-radius:0;margin:2rem 0; }
  .blog-prose strong { font-weight:500;color:var(--ink); }
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;}
  .d1{animation-delay:0.1s}.d2{animation-delay:0.2s}
  @keyframes spin{to{transform:rotate(360deg)}}
`;

export function BlogDetailPage() {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        blogAPI.getOne(slug)
            .then(r => setBlog(r.data.data))
            .catch(() => setBlog(null))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return (
        <>
            <style>{STYLES}</style>
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '1.5px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        </>
    );

    if (!blog) return (
        <>
            <style>{STYLES}</style>
            <Navbar />
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', color: 'var(--gold)', marginBottom: '1rem' }}>✦</div>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '0.75rem' }}>Article Not Found</h2>
                    <p style={{ fontFamily: 'Outfit', color: '#888', fontWeight: 300, marginBottom: '2rem' }}>The article you're looking for doesn't exist.</p>
                    <Link to="/blog" style={{ fontFamily: 'Outfit', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, padding: '1rem 2.5rem', background: 'var(--gold)', color: 'var(--ink)', textDecoration: 'none', display: 'inline-flex', transition: 'all 0.3s' }}>
                        Back to Blog
                    </Link>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <style>{STYLES}</style>
            <Helmet>
                <title>{blog.title} – Shiv Event Management Blog</title>
                <meta name="description" content={blog.metaDescription || blog.excerpt || blog.title} />
            </Helmet>
            <Navbar />
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', paddingTop: '7rem', paddingBottom: '5rem' }}>
                <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <Link to="/blog" style={{ fontFamily: 'Outfit', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', fontWeight: 500 }}>
                        ← Back to Blog
                    </Link>

                    <div>
                        <span className="eyebrow fade-up">{blog.category}</span>
                        <h1 className="fade-up d1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: 'var(--ink)', marginTop: '1rem', marginBottom: '1.5rem', lineHeight: 1.15 }}>
                            {blog.title}
                        </h1>

                        <div className="fade-up d1" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
                            <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: '#999', fontWeight: 300 }}>
                                {blog.author || 'Shiv Event Management'}
                            </span>
                            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(201,168,76,0.4)', display: 'inline-block' }} />
                            <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: '#999', fontWeight: 300 }}>
                                {new Date(blog.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                            </span>
                            {blog.views > 0 && (
                                <>
                                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(201,168,76,0.4)', display: 'inline-block' }} />
                                    <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: '#bbb', fontWeight: 300 }}>{blog.views} views</span>
                                </>
                            )}
                        </div>

                        {blog.image && (
                            <div className="fade-up d2" style={{ overflow: 'hidden', marginBottom: '3rem' }}>
                                <img src={blog.image} alt={blog.title}
                                    style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }}
                                    onError={e => { e.target.style.display = 'none'; }} />
                            </div>
                        )}

                        <div className="blog-prose fade-up d2"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }} />

                        {blog.tags?.length > 0 && (
                            <div className="fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(201,168,76,0.12)' }}>
                                <span className="eyebrow" style={{ width: '100%', marginBottom: '0.75rem' }}>Tags</span>
                                {blog.tags.map((tag, i) => (
                                    <span key={i} style={{ fontFamily: 'Outfit', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.4rem 1rem', border: '1px solid rgba(201,168,76,0.2)', color: '#888', fontWeight: 400 }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default BlogDetailPage;