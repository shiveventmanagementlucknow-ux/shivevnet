import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { pricingAPI } from '../../services/api';

export default function AdminPricing() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', description: '', features: '', tag: '', ctaText: 'Get Started', ctaLink: '/booking', isPopular: false, isActive: true, order: 0 });
    const [saving, setSaving] = useState(false);

    const fetchPlans = async () => {
        setLoading(true);
        try { const res = await pricingAPI.getAllAdmin(); setPlans(Array.isArray(res.data?.data) ? res.data.data : []); }
        catch { toast.error('Failed to load pricing'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPlans(); }, []);

    const openCreate = () => { setEditing(null); setForm({ name: '', price: '', description: '', features: '', tag: '', ctaText: 'Get Started', ctaLink: '/booking', isPopular: false, isActive: true, order: 0 }); setShowForm(true); };
    const openEdit = (p) => { setEditing(p); setForm({ name: p.name, price: p.price, description: p.description || '', features: (p.features || []).join('\n'), tag: p.tag || '', ctaText: p.ctaText || 'Get Started', ctaLink: p.ctaLink || '/booking', isPopular: p.isPopular, isActive: p.isActive, order: p.order || 0 }); setShowForm(true); };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        const payload = { ...form, features: form.features.split('\n').filter(Boolean), order: Number(form.order) || 0 };
        try {
            if (editing) { await pricingAPI.update(editing._id, payload); toast.success('Updated'); }
            else { await pricingAPI.create(payload); toast.success('Created'); }
            setShowForm(false); fetchPlans();
        } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this pricing plan?')) return;
        await pricingAPI.delete(id); toast.success('Deleted'); fetchPlans();
    };

    return (
        <>
            <Helmet><title>Pricing – Shiv Event Management Admin</title></Helmet>
            <div className="mb-6 flex items-center justify-between">
                <div><h1 className="font-display text-2xl font-bold text-gray-900">Pricing Plans</h1><p className="text-gray-500 text-sm">{plans.length} plans</p></div>
                <button onClick={openCreate} className="btn-primary text-sm">+ Add Plan</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {loading ? [...Array(3)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-gray-200" />) :
                    plans.length === 0 ? <div className="col-span-full text-center py-12 text-gray-500">No pricing plans yet.</div> :
                        plans.map(p => (
                            <div key={p._id} className={`card p-6 ${p.isPopular ? 'border-primary-500/50' : ''} ${!p.isActive ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div><h3 className="font-display text-lg font-bold text-gray-900">{p.name}</h3>{p.tag && <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{p.tag}</span>}</div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${p.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>{p.isActive ? 'Active' : 'Hidden'}</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-2">{p.price}</div>
                                {p.description && <p className="text-gray-500 text-sm mb-3">{p.description}</p>}
                                {p.features?.length > 0 && (
                                    <ul className="space-y-1 mb-3">
                                        {p.features.slice(0, 4).map((f, i) => <li key={i} className="text-xs text-gray-500 flex items-center gap-1"><span className="text-primary-600">✓</span>{f}</li>)}
                                        {p.features.length > 4 && <li className="text-xs text-gray-500">+{p.features.length - 4} more…</li>}
                                    </ul>
                                )}
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => openEdit(p)} className="text-primary-600 text-xs hover:text-primary-300">Edit</button>
                                    <button onClick={() => handleDelete(p._id)} className="text-red-600 text-xs hover:text-red-300 ml-auto">Delete</button>
                                </div>
                            </div>
                        ))
                }
            </div>
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                    <div className="card max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-xl font-bold text-gray-900">{editing ? 'Edit Plan' : 'New Pricing Plan'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 text-2xl">×</button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs text-gray-500 mb-1.5">Plan Name *</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Essential" className="input-field" /></div>
                                <div><label className="block text-xs text-gray-500 mb-1.5">Price *</label><input required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="₹49,999" className="input-field" /></div>
                            </div>
                            <div><label className="block text-xs text-gray-500 mb-1.5">Description</label><input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Perfect for small celebrations" className="input-field" /></div>
                            <div><label className="block text-xs text-gray-500 mb-1.5">Features (one per line)</label><textarea rows={5} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder={"Up to 50 guests\nBasic décor\nEvent coordinator"} className="input-field resize-none text-sm" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs text-gray-500 mb-1.5">Badge/Tag</label><input value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} placeholder="Most Popular" className="input-field" /></div>
                                <div><label className="block text-xs text-gray-500 mb-1.5">Order</label><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} className="input-field" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs text-gray-500 mb-1.5">Button Text</label><input value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Get Started" className="input-field" /></div>
                                <div><label className="block text-xs text-gray-500 mb-1.5">Button Link</label><input value={form.ctaLink} onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="/booking" className="input-field" /></div>
                            </div>
                            <div className="flex items-center gap-6">
                                {[['isPopular', 'Popular', 'bg-primary-600'], ['isActive', 'Active', 'bg-green-600']].map(([key, label, bg]) => (
                                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-11 h-6 rounded-full transition-colors relative ${form[key] ? bg : 'bg-gray-100 border border-gray-300'}`} onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}>
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </div>
                                        <span className="text-sm text-gray-600">{label}</span>
                                    </label>
                                ))}
                            </div>
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