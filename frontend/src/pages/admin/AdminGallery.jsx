import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { galleryAPI } from '../../services/api';
import imageCompression from 'browser-image-compression';

const CATEGORIES = ['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Conference', 'Concert', 'Other'];

export default function AdminGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [uploadForm, setUploadForm] = useState({ title: '', category: 'Other', description: '' });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', category: '', description: '' });
    const [savingEdit, setSavingEdit] = useState(false);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await galleryAPI.getAll();
            setImages(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch { toast.error('Failed to load gallery'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchImages(); }, []);

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;

        const isVideo = f.type.startsWith('video/');
        if (!f.type.startsWith('image/') && !isVideo) return toast.error('Only image or video files allowed');
        if (isVideo && f.size > 50 * 1024 * 1024) return toast.error('Video max file size is 50MB');
        if (!isVideo && f.size > 5 * 1024 * 1024) return toast.error('Image max file size is 5MB');

        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Please select an image');
        if (!uploadForm.title.trim()) return toast.error('Please enter a title');

        setUploading(true);
        try {
            const isVideo = file.type.startsWith('video/');
            let uploadFile = file;

            if (!isVideo) {
                setUploadProgress('Compressing image…');
                uploadFile = await imageCompression(file, { maxSizeMB: 2.5, maxWidthOrHeight: 1440, initialQuality: 0.92, useWebWorker: true });
            }

            setUploadProgress(isVideo ? 'Uploading video (might take a while)…' : 'Uploading to server…');

            const data = new FormData();
            data.append('media', uploadFile, file.name);
            data.append('title', uploadForm.title.trim());
            data.append('category', uploadForm.category);
            data.append('description', uploadForm.description);
            data.append('mediaType', isVideo ? 'video' : 'image');

            await galleryAPI.upload(data);
            toast.success(isVideo ? 'Video uploaded!' : 'Image uploaded!');
            setFile(null);
            setPreview(null);
            setUploadForm({ title: '', category: 'Other', description: '' });
            setUploadProgress('');
            fetchImages();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
            setUploadProgress('');
        } finally { setUploading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this image?')) return;
        try {
            await galleryAPI.delete(id);
            toast.success('Image deleted successfully');
            setImages(imgs => imgs.filter(i => i._id !== id));
        } catch (err) {
            console.error('Delete error:', err);
            const message = err.response?.data?.message || err.message || 'Delete failed. Please try again.';
            toast.error(message);
        }
    };

    const handleToggleFeatured = async (img) => {
        try {
            await galleryAPI.update(img._id, { isFeatured: !img.isFeatured });
            setImages(imgs => imgs.map(i => i._id === img._id ? { ...i, isFeatured: !i.isFeatured } : i));
            toast.success(img.isFeatured ? 'Removed from featured' : 'Added to featured');
        } catch (err) {
            toast.error('Failed to update featured status');
        }
    };

    const openEdit = (img) => {
        setEditing(img);
        setEditForm({ title: img.title, category: img.category, description: img.description || '' });
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        setSavingEdit(true);
        try {
            await galleryAPI.update(editing._id, editForm);
            toast.success('Image details updated');
            setEditing(null); fetchImages();
        } catch (err) { toast.error('Update failed'); }
        finally { setSavingEdit(false); }
    };

    const filtered = activeCategory === 'All' ? images : images.filter(i => i.category === activeCategory);

    const checkIsVideo = (img) => img?.mediaType === 'video' || img?.imageUrl?.match(/\.(mp4|webm|mov|ogg)$/i) || img?.imageUrl?.includes('/video/upload/');

    return (
        <>
            <Helmet><title>Gallery – Shiv Event Management Admin</title></Helmet>
            <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-gray-900">Gallery</h1>
                <p className="text-gray-500 text-sm">{images.length} media items</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6">
                    <h2 className="font-semibold text-gray-900 mb-5">Upload New Media</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${preview ? 'border-primary-500/50' : 'border-gray-200 hover:border-gray-400'}`}>
                            {preview ? (
                                file?.type.startsWith('video/')
                                    ? <video src={preview} className="w-full h-32 object-cover rounded-lg" controls muted />
                                    : <img src={preview} className="w-full h-32 object-cover rounded-lg" alt="preview" />
                            ) : (
                                <>
                                    <div className="text-3xl mb-2">📷</div>
                                    <p className="text-gray-500 text-sm text-center">Click to choose media<br /><span className="text-xs text-gray-400">Image (Max 5MB) or Video (Max 50MB)</span></p>
                                </>
                            )}
                            <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                        </label>
                        <input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} placeholder="Media title *" className="input-field" required />
                        <select value={uploadForm.category} onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <textarea value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" rows={2} className="input-field resize-none" />
                        <button type="submit" disabled={uploading || !file} className="btn-primary w-full justify-center">
                            {uploading ? (
                                <span className="flex items-center gap-2">
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {uploadProgress || 'Uploading…'}
                                </span>
                            ) : '📤 Upload Media'}
                        </button>
                    </form>
                </div>
                <div className="lg:col-span-2">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {['All', ...CATEGORIES].map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[...Array(6)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="card p-10 text-center text-gray-500">No media in this category</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filtered.map(img => (
                                <div key={img._id} className="card overflow-hidden flex flex-col border-2 border-transparent hover:border-primary-100 transition-colors group">
                                    <div className="relative h-44 bg-gray-100 shrink-0 overflow-hidden">
                                        {checkIsVideo(img) ? (
                                            <video src={img.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted loop playsInline onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => e.target.pause()} />
                                        ) : (
                                            <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                        )}
                                        {checkIsVideo(img) && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm shadow-lg text-lg pl-1">▶</div></div>}
                                        {img.isFeatured && <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">⭐ FEATURED</div>}
                                        <span className="absolute bottom-2 left-2 text-[10px] font-medium text-primary-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">{img.category}</span>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">{img.title}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{img.description || 'No description provided.'}</p>
                                        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                                            <button onClick={() => handleToggleFeatured(img)} className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-colors font-medium flex-1 ${img.isFeatured ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                                                {img.isFeatured ? '★ Unfeature' : '⭐ Feature'}
                                            </button>
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(img)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Edit">✏️</button>
                                                <button onClick={() => handleDelete(img._id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)}>
                    <div className="card max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-lg text-gray-900">Edit Image Details</h2>
                            <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-900">✕</button>
                        </div>
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Title</label>
                                <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="input-field" required />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Category</label>
                                <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Description</label>
                                <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Add some context about this event..." />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={savingEdit} className="btn-primary flex-1">{savingEdit ? 'Saving...' : 'Save Changes'}</button>
                                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}