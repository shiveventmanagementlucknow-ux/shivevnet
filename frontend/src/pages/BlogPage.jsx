import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { blogAPI } from '../services/api';

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
            <Helmet><title>Blog – Shiv Event Management</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Insights</p>
                        <h1 className="section-title">Event Planning <span className="gradient-text">Blog</span></h1>
                        <p className="section-subtitle mx-auto">Tips, trends, and inspiration for every occasion.</p>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-64 animate-pulse bg-gray-100 rounded-2xl" />)}
                        </div>
                    ) : blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map(blog => (
                                <Link key={blog._id} to={`/blog/${blog.slug}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                    <div className="overflow-hidden relative h-52 bg-gray-100 shrink-0">
                                        {blog.image ? (
                                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/f3f4f6/a1a1aa?text=Event+Blog'; }} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                                <span className="text-4xl">📝</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <span className="text-xs text-primary-600 font-medium bg-primary-50 px-3 py-1 rounded-full w-fit">{blog.category}</span>
                                        <h3 className="font-display text-lg font-semibold text-gray-900 mt-3 mb-2 group-hover:text-primary-600 transition-colors">{blog.title}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{blog.excerpt}</p>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 text-xs text-gray-400">
                                            <span>{new Date(blog.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                                            {blog.views > 0 && <span>👁 {blog.views}</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">📝</div>
                            <h3 className="font-display text-xl text-gray-900 mb-2">No blog posts yet</h3>
                            <p className="text-gray-500">Blog content is coming soon. Stay tuned!</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default BlogPage;
