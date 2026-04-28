import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { blogAPI } from '../../services/api';

export default function AdminBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: '', content: '', excerpt: '', category: 'General', isPublished: false });
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await blogAPI.getAllAdmin();
            setBlogs(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch { toast.error('Failed to load blogs'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBlogs(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ title: '', content: '', excerpt: '', category: 'General', isPublished: false });
        setShowForm(true);
    };

    const openEdit = (blog) => {
        setEditing(blog);
        setForm({ title: blog.title, content: blog.content, excerpt: blog.excerpt || '', category: blog.category || 'General', isPublished: blog.isPublished });
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) { await blogAPI.update(editing._id, form); toast.success('Blog updated'); }
            else { await blogAPI.create(form); toast.success('Blog created'); }
            setShowForm(false);
            fetchBlogs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this blog?')) return;
        await blogAPI.delete(id);
        toast.success('Deleted');
        fetchBlogs();
    };

    return (
        <>
            <Helmet><title>Blogs – Shiv Event Management Admin</title></Helmet>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">Blog Posts</h1>
                    <p className="text-gray-500 text-sm">{blogs.length} posts</p>
                </div>
                <button onClick={openCreate} className="btn-primary text-sm">+ New Post</button>
            </div>
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />)}</div>
                ) : blogs.length === 0 ? (
                    <p className="p-10 text-center text-gray-500">No blog posts yet. Create your first one!</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100">
                            {['Title', 'Category', 'Status', 'Views', 'Created', 'Actions'].map(h => (
                                <th key={h} className="text-left px-5 py-3.5 text-xs text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {blogs.map(b => (
                                <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-5 py-4 text-gray-900 font-medium max-w-xs truncate">{b.title}</td>
                                    <td className="px-5 py-4 text-gray-500">{b.category}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                                            {b.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-gray-500">{b.views || 0}</td>
                                    <td className="px-5 py-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => openEdit(b)} className="text-primary-600 text-xs hover:text-primary-300">Edit</button>
                                            <button onClick={() => handleDelete(b._id)} className="text-red-600 text-xs hover:text-red-300">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                    <div className="card max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-xl font-bold text-gray-900">{editing ? 'Edit Post' : 'New Blog Post'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 text-2xl">×</button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1.5">Title *</label>
                                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1.5">Excerpt</label>
                                <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary…" className="input-field resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1.5">Content *</label>
                                <textarea required rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write blog content (supports HTML)…" className="input-field resize-none font-mono text-xs" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1.5">Category</label>
                                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                                        {['General', 'Wedding', 'Corporate', 'Birthday', 'Tips', 'Trends'].map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-11 h-6 rounded-full transition-colors relative ${form.isPublished ? 'bg-primary-600' : 'bg-gray-100 border border-gray-300'}`}
                                            onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}>
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </div>
                                        <span className="text-sm text-gray-600">Publish</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : editing ? 'Update Post' : 'Create Post'}</button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}