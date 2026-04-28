import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { testimonialAPI } from '../../services/api';

export default function AdminTestimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', role: '', text: '', rating: 5, isActive: true });
    const [saving, setSaving] = useState(false);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const res = await testimonialAPI.getAllAdmin();
            setTestimonials(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch { toast.error('Failed to load testimonials'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTestimonials(); }, []);

    const openCreate = () => { setEditing(null); setForm({ name: '', role: '', text: '', rating: 5, isActive: true }); setShowForm(true); };
    const openEdit = (t) => { setEditing(t); setForm({ name: t.name, role: t.role || '', text: t.text, rating: t.rating || 5, isActive: t.isActive }); setShowForm(true); };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) { await testimonialAPI.update(editing._id, form); toast.success('Updated'); }
            else { await testimonialAPI.create(form); toast.success('Created'); }
            setShowForm(false); fetchTestimonials();
        } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this testimonial?')) return;
        await testimonialAPI.delete(id); toast.success('Deleted'); fetchTestimonials();
    };

    return (
        <>
            <Helmet><title>Testimonials – Shiv Event Management Admin</title></Helmet>
            <div className="mb-6 flex items-center justify-between">
                <div><h1 className="font-display text-2xl font-bold text-gray-900">Testimonials</h1><p className="text-gray-500 text-sm">{testimonials.length} testimonials</p></div>
                <button onClick={openCreate} className="btn-primary text-sm">+ Add Testimonial</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? [...Array(3)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-gray-200" />) :
                    testimonials.length === 0 ? <div className="col-span-full text-center py-12 text-gray-500">No testimonials yet.</div> :
                        testimonials.map(t => (
                            <div key={t._id} className={`card p-6 ${!t.isActive ? 'opacity-60' : ''}`}>
                                <div className="flex gap-1 mb-3">{[...Array(t.rating || 5)].map((_, j) => <span key={j} className="text-gold text-sm">★</span>)}</div>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-3">"{t.text}"</p>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs">{t.name[0]}</div>
                                    <div><div className="text-gray-900 text-sm font-medium">{t.name}</div>{t.role && <div className="text-gray-500 text-xs">{t.role}</div>}</div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${t.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>{t.isActive ? 'Active' : 'Hidden'}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(t)} className="text-primary-600 text-xs hover:text-primary-300">Edit</button>
                                        <button onClick={() => handleDelete(t._id)} className="text-red-600 text-xs hover:text-red-300">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                }
            </div>
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                    <div className="card max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-xl font-bold text-gray-900">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 text-2xl">×</button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs text-gray-500 mb-1.5">Client Name *</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Priya Sharma" className="input-field" /></div>
                                <div><label className="block text-xs text-gray-500 mb-1.5">Role / Title</label><input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Bride / CEO" className="input-field" /></div>
                            </div>
                            <div><label className="block text-xs text-gray-500 mb-1.5">Testimonial Text *</label><textarea required rows={4} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="What the client said…" className="input-field resize-none" /></div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">Rating</label>
                                <div className="flex gap-2">{[1, 2, 3, 4, 5].map(r => <button key={r} type="button" onClick={() => setForm(f => ({ ...f, rating: r }))} className={`text-2xl transition-colors ${r <= form.rating ? 'text-gold' : 'text-gray-600'}`}>★</button>)}</div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-green-600' : 'bg-gray-100 border border-gray-300'}`} onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                                <span className="text-sm text-gray-600">Show on website</span>
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}