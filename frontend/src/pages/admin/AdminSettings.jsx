import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { settingsAPI, galleryAPI } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import imageCompression from 'browser-image-compression';

export default function AdminSettings() {
    const { refetch } = useSettings();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [slideForm, setSlideForm] = useState({ title: '', subtitle: '', image: '', tag: '' });
    const [editSlideIdx, setEditSlideIdx] = useState(-1);
    const [slideUploading, setSlideUploading] = useState(false);
    const [slidePreview, setSlidePreview] = useState(null);

    useEffect(() => {
        settingsAPI.get()
            .then(r => setForm(r.data?.data || {}))
            .catch(() => toast.error('Failed to load settings'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try { await settingsAPI.update(form); toast.success('Settings saved!'); refetch(); }
        catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleSlideImageFile = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith('image/')) return toast.error('Only image files allowed');
        if (f.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
        setSlideUploading(true);
        try {
            const compressed = await imageCompression(f, {
                maxSizeMB: 5,              // Max quality (Up to 5MB)
                maxWidthOrHeight: 3840,    // 4K resolution support to prevent pixelation
                initialQuality: 1,         // 100% origin quality retention
                useWebWorker: true
            });
            const data = new FormData();
            data.append('media', compressed, f.name);
            data.append('title', slideForm.title || 'slide');
            data.append('category', 'Other');
            data.append('mediaType', 'image');
            const res = await galleryAPI.upload(data);
            const imageUrl = res.data.data?.imageUrl || res.data.imageUrl;
            setSlideForm(sf => ({ ...sf, image: imageUrl }));
            setSlidePreview(imageUrl);
            toast.success('Image uploaded!');
        } catch { toast.error('Image upload failed'); }
        finally { setSlideUploading(false); }
    };

    const addSlide = () => {
        if (!slideForm.title) return toast.error('Slide title required');
        if (!slideForm.image) return toast.error('Image required');
        if (editSlideIdx >= 0) {
            const slides = [...(form.heroSlides || [])];
            slides[editSlideIdx] = slideForm;
            setForm(f => ({ ...f, heroSlides: slides }));
            setEditSlideIdx(-1);
        } else {
            setForm(f => ({ ...f, heroSlides: [...(f.heroSlides || []), slideForm] }));
        }
        setSlideForm({ title: '', subtitle: '', image: '', tag: '' });
        setSlidePreview(null);
    };

    const removeSlide = (idx) => setForm(f => ({ ...f, heroSlides: f.heroSlides.filter((_, i) => i !== idx) }));

    const editSlide = (idx) => {
        const slide = form.heroSlides[idx];
        setSlideForm(slide);
        setSlidePreview(slide.image);
        setEditSlideIdx(idx);
    };

    if (loading || !form) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <>
            <Helmet><title>Settings – Shiv Event Management Admin</title></Helmet>
            <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-gray-900">Site Settings</h1>
                <p className="text-gray-500 text-sm">Manage your website content and company information</p>
            </div>
            <form onSubmit={handleSave} className="space-y-8 max-w-4xl">

                {/* Company Info */}
                <div className="card p-6">
                    <h2 className="font-semibold text-gray-900 text-lg mb-5">Company Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs text-gray-500 mb-1.5">Company Name</label><input value={form.companyName || ''} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} className="input-field" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1.5">Owner Name</label><input value={form.ownerName || ''} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} placeholder="e.g., Kuldeep Rajput" className="input-field" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1.5">Tagline</label><input value={form.tagline || ''} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Premium Event Management" className="input-field" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1.5">Owner Phone</label><input value={form.ownerPhone || ''} onChange={e => setForm(f => ({ ...f, ownerPhone: e.target.value }))} placeholder="6394352002" className="input-field" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1.5">Phone</label><input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className="input-field" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1.5">Email</label><input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="hello@example.com" className="input-field" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1.5">WhatsApp Number</label><input value={form.whatsapp || ''} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="919876543210" className="input-field" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1.5">Working Hours</label><input value={form.workingHours || ''} onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))} placeholder="Mon - Sat: 9 AM - 8 PM" className="input-field" /></div>
                        <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1.5">Address</label><input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Event Street, Mumbai" className="input-field" /></div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="card p-6">
                    <h2 className="font-semibold text-gray-900 text-lg mb-5">Social Media Links</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['instagram', 'facebook', 'twitter', 'youtube'].map(platform => (
                            <div key={platform}>
                                <label className="block text-xs text-gray-500 mb-1.5 capitalize">{platform}</label>
                                <input value={form.socialLinks?.[platform] || ''} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [platform]: e.target.value } }))} placeholder={`https://${platform}.com/yourpage`} className="input-field" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="card p-6">
                    <h2 className="font-semibold text-gray-900 text-lg mb-5">Homepage Stats</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs text-gray-500 mb-1.5">Events Completed</label><input value={form.stats?.eventsCompleted || ''} onChange={e => setForm(f => ({ ...f, stats: { ...f.stats, eventsCompleted: e.target.value } }))} placeholder="500+" className="input-field" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1.5">Client Satisfaction</label><input value={form.stats?.clientSatisfaction || ''} onChange={e => setForm(f => ({ ...f, stats: { ...f.stats, clientSatisfaction: e.target.value } }))} placeholder="98%" className="input-field" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1.5">Years Experience</label><input value={form.stats?.yearsExperience || ''} onChange={e => setForm(f => ({ ...f, stats: { ...f.stats, yearsExperience: e.target.value } }))} placeholder="10+" className="input-field" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1.5">Team Members</label><input value={form.stats?.teamMembers || ''} onChange={e => setForm(f => ({ ...f, stats: { ...f.stats, teamMembers: e.target.value } }))} placeholder="50+" className="input-field" /></div>
                    </div>
                </div>

                {/* Hero Slides */}
                <div className="card p-6">
                    <h2 className="font-semibold text-gray-900 text-lg mb-5">Hero Slides</h2>
                    {form.heroSlides?.length > 0 && (
                        <div className="space-y-3 mb-5">
                            {form.heroSlides.map((slide, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-100 rounded-xl">
                                    {slide.image && <img src={slide.image} alt="" className="w-16 h-10 object-cover rounded-lg" />}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-gray-900 text-sm font-medium truncate">{slide.title}</div>
                                        <div className="text-gray-500 text-xs truncate">{slide.subtitle}</div>
                                    </div>
                                    {slide.tag && <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{slide.tag}</span>}
                                    <button type="button" onClick={() => editSlide(idx)} className="text-primary-600 text-xs hover:text-primary-300">Edit</button>
                                    <button type="button" onClick={() => removeSlide(idx)} className="text-red-600 text-xs hover:text-red-300">Remove</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{editSlideIdx >= 0 ? 'Edit Slide' : 'Add New Slide'}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input value={slideForm.title} onChange={e => setSlideForm(f => ({ ...f, title: e.target.value }))} placeholder="Slide Title *" className="input-field" />
                            <input value={slideForm.subtitle} onChange={e => setSlideForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Subtitle" className="input-field" />
                            <input value={slideForm.tag} onChange={e => setSlideForm(f => ({ ...f, tag: e.target.value }))} placeholder="Tag (e.g. Wedding)" className="input-field" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500">Image — file upload karo ya URL paste karo</p>
                            {slidePreview && (
                                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={slidePreview} alt="preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => { setSlidePreview(null); setSlideForm(f => ({ ...f, image: '' })); }} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">Remove</button>
                                </div>
                            )}
                            <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-xl px-4 py-3 cursor-pointer transition-colors">
                                <span className="text-xl">📁</span>
                                <span className="text-sm text-gray-500">{slideUploading ? 'Uploading…' : 'Click to upload image file'}</span>
                                <input type="file" accept="image/*" onChange={handleSlideImageFile} className="hidden" disabled={slideUploading} />
                                {slideUploading && <span className="ml-auto inline-block w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />}
                            </label>
                            <div className="flex items-center gap-2"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">ya URL se</span><div className="flex-1 h-px bg-gray-200" /></div>
                            <input value={slideForm.image} onChange={e => { setSlideForm(f => ({ ...f, image: e.target.value })); setSlidePreview(e.target.value || null); }} placeholder="https://example.com/image.jpg" className="input-field" />
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={addSlide} disabled={slideUploading} className="btn-primary text-sm">{editSlideIdx >= 0 ? '✅ Update Slide' : '+ Add Slide'}</button>
                            {editSlideIdx >= 0 && (
                                <button type="button" onClick={() => { setEditSlideIdx(-1); setSlideForm({ title: '', subtitle: '', image: '', tag: '' }); setSlidePreview(null); }} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* About & SEO */}
                <div className="card p-6">
                    <h2 className="font-semibold text-gray-900 text-lg mb-5">About & SEO</h2>
                    <div className="space-y-4">
                        <div><label className="block text-xs text-gray-500 mb-1.5">About Text</label><textarea rows={3} value={form.aboutText || ''} onChange={e => setForm(f => ({ ...f, aboutText: e.target.value }))} placeholder="Tell visitors about your company…" className="input-field resize-none" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-xs text-gray-500 mb-1.5">Meta Title</label><input value={form.metaTitle || ''} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} placeholder="Shiv Event Management" className="input-field" /></div>
                            <div><label className="block text-xs text-gray-500 mb-1.5">Meta Description</label><input value={form.metaDescription || ''} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} placeholder="India's premier event management..." className="input-field" /></div>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary text-base px-8 py-3">{saving ? 'Saving…' : '💾 Save All Settings'}</button>
            </form>
        </>
    );
}