import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { serviceAPI } from '../../services/api';

export default function AdminServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', icon: '🎉', image: '', shortDescription: '', description: '', startingPrice: '', isActive: true, features: '' });
    const [saving, setSaving] = useState(false);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await serviceAPI.getAllAdmin();
            setServices(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch { toast.error('Failed to load services'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchServices(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ title: '', icon: '🎉', image: '', shortDescription: '', description: '', startingPrice: '', isActive: true, features: '' });
        setShowForm(true);
    };

    const openEdit = (s) => {
        setEditing(s);
        setForm({ title: s.title, icon: s.icon || '🎉', image: s.image || '', shortDescription: s.shortDescription || '', description: s.description || '', startingPrice: s.startingPrice || '', isActive: s.isActive, features: (s.features || []).join('\n') });
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { ...form, startingPrice: form.startingPrice ? Number(form.startingPrice) : undefined, features: form.features.split('\n').filter(Boolean) };
        try {
            if (editing) { await serviceAPI.update(editing._id, payload); toast.success('Updated'); }
            else { await serviceAPI.create(payload); toast.success('Created'); }
            setShowForm(false); fetchServices();
        } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this service?')) return;
        await serviceAPI.delete(id);
        toast.success('Deleted');
        fetchServices();
    };

    return (
        <>
            <Helmet><title>Services – Shiv Event Management Admin</title></Helmet>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">Services</h1>
                    <p className="text-gray-500 text-sm">{services.length} services</p>
                </div>
                <button onClick={openCreate} className="btn-primary text-sm">+ Add Service</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? [...Array(6)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-gray-200" />) :
                    services.map(s => (
                        <div key={s._id} className={`card p-6 ${!s.isActive ? 'opacity-60' : ''}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="text-3xl">{s.icon || '🎉'}</div>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${s.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                            <h3 className="font-display font-semibold text-gray-900 mb-1">{s.title}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-3">{s.shortDescription}</p>
                            {s.startingPrice && <p className="text-primary-600 text-sm">₹{s.startingPrice.toLocaleString('en-IN')}</p>}
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => openEdit(s)} className="text-primary-600 text-xs hover:text-primary-300">Edit</button>
                                <button onClick={() => handleDelete(s._id)} className="text-red-600 text-xs hover:text-red-300 ml-auto">Delete</button>
                            </div>
                        </div>
                    ))
                }
            </div>
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                    <div className="card max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-xl font-bold text-gray-900">{editing ? 'Edit Service' : 'New Service'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 text-2xl">×</button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-4 gap-3">
                                <div><label className="block text-xs text-gray-500 mb-1.5">Icon</label><input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="input-field text-center text-2xl" maxLength={2} /></div>
                                <div className="col-span-3"><label className="block text-xs text-gray-500 mb-1.5">Title *</label><input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Wedding Planning" className="input-field" /></div>
                            </div>
                            <div><label className="block text-xs text-gray-500 mb-1.5">Cover Image URL</label><input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://example.com/service-bg.jpg" className="input-field" /></div>
                            <div><label className="block text-xs text-gray-500 mb-1.5">Short Description</label><input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="Brief one-liner" className="input-field" /></div>
                            <div><label className="block text-xs text-gray-500 mb-1.5">Full Description *</label><textarea required rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description…" className="input-field resize-none" /></div>
                            <div><label className="block text-xs text-gray-500 mb-1.5">Starting Price (₹)</label><input type="number" value={form.startingPrice} onChange={e => setForm(f => ({ ...f, startingPrice: e.target.value }))} placeholder="50000" className="input-field" /></div>
                            <div><label className="block text-xs text-gray-500 mb-1.5">Features (one per line)</label><textarea rows={4} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder={"Full planning\nVendor coordination\n24/7 support"} className="input-field resize-none text-sm" /></div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-green-600' : 'bg-gray-100 border border-gray-300'}`} onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                                <span className="text-sm text-gray-600">Active</span>
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