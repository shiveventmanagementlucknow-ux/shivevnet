import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { blogAPI } from '../services/api';

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

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!blog) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h2 className="font-display text-3xl text-gray-900 mb-3">Blog not found</h2>
                    <p className="text-gray-500 mb-6">The article you're looking for doesn't exist.</p>
                    <Link to="/blog" className="btn-primary">Back to Blog</Link>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <Helmet>
                <title>{blog.title} – Shiv Event Management Blog</title>
                <meta name="description" content={blog.metaDescription || blog.excerpt || blog.title} />
            </Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-4">
                    <Link to="/blog" className="text-primary-600 text-sm hover:text-primary-700 flex items-center gap-1 mb-8">← Back to Blog</Link>
                    <span className="text-xs text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{blog.category}</span>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-4">{blog.title}</h1>
                    <div className="flex items-center gap-4 text-gray-400 text-sm mb-8">
                        <span>{blog.author || 'Shiv Event Management Team'}</span>
                        <span>•</span>
                        <span>{new Date(blog.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                        {blog.views > 0 && <><span>•</span><span>👁 {blog.views} views</span></>}
                    </div>
                    {blog.image && (
                        <div className="overflow-hidden rounded-2xl mb-8 bg-gray-50">
                            <img src={blog.image} alt={blog.title} className="w-full max-h-[500px] object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                    )}
                    <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }} />
                    {blog.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                            {blog.tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs text-gray-500">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default BlogDetailPage;
