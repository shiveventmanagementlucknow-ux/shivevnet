import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { galleryAPI } from '../services/api';

const CATEGORIES = ['All', 'Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Conference', 'Concert', 'Other'];

export function PortfolioPage() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        galleryAPI.getAll()
            .then(r => setImages(Array.isArray(r.data?.data) ? r.data.data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = activeCategory === 'All' ? images : images.filter(img => img.category === activeCategory);

    const openLightbox = (img) => setLightbox(img);
    const closeLightbox = () => setLightbox(null);
    const goToPrevious = () => {
        const currentIndex = filtered.findIndex(img => img._id === lightbox._id);
        if (currentIndex > 0) setLightbox(filtered[currentIndex - 1]);
    };
    const goToNext = () => {
        const currentIndex = filtered.findIndex(img => img._id === lightbox._id);
        if (currentIndex < filtered.length - 1) setLightbox(filtered[currentIndex + 1]);
    };

    const checkIsVideo = (img) => img?.mediaType === 'video' || img?.imageUrl?.match(/\.(mp4|webm|mov|ogg)$/i) || img?.imageUrl?.includes('/video/upload/');

    useEffect(() => {
        if (!lightbox) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setLightbox(null);
            if (e.key === 'ArrowLeft') {
                const currentIndex = filtered.findIndex(img => img._id === lightbox._id);
                if (currentIndex > 0) setLightbox(filtered[currentIndex - 1]);
            }
            if (e.key === 'ArrowRight') {
                const currentIndex = filtered.findIndex(img => img._id === lightbox._id);
                if (currentIndex < filtered.length - 1) setLightbox(filtered[currentIndex + 1]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightbox, filtered]);

    return (
        <>
            <Helmet><title>Portfolio – Shiv Event Management</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-14 animate-fadeInUp">
                        <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Our Work</p>
                        <h1 className="section-title">Event <span className="gradient-text">Portfolio</span></h1>
                        <p className="section-subtitle mx-auto">Explore the magic we've created for our clients. Each event is a unique story of celebration and excellence.</p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 justify-center mb-12 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeCategory === cat ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-primary-300 hover:bg-primary-50 shadow-sm'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Gallery Grid */}
                    {loading ? (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="h-64 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse break-inside-avoid mb-5" />
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
                            {filtered.map((img, idx) => (
                                <div key={img._id}
                                    className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer animate-fadeInUp break-inside-avoid mb-5"
                                    style={{ animationDelay: `${(idx % 4) * 0.1}s` }}
                                    onClick={() => openLightbox(img)}>
                                    {/* Media */}
                                    {checkIsVideo(img) ? (
                                        <video src={img.imageUrl} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-100" muted loop playsInline onMouseEnter={e => e.target.play()} onMouseLeave={e => e.target.pause()} />
                                    ) : (
                                        <img src={img.imageUrl} alt={img.title} loading="lazy"
                                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-100" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x600/f3f4f6/a1a1aa?text=Image+Unavailable'; }} />
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end justify-end p-4">
                                        <div className="w-full">
                                            <p className="text-white font-semibold text-sm mb-1">{img.title}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-primary-300 text-xs font-medium bg-primary-600/30 px-2.5 py-1 rounded-full">{img.category}</span>
                                                {checkIsVideo(img) && <span className="text-xs font-medium text-white px-2 py-0.5 border border-white/30 rounded-md backdrop-blur-sm">🎥 Video</span>}
                                                {img.isFeatured && <span className="text-xs text-yellow-300 bg-yellow-600/30 px-2.5 py-1 rounded-full">⭐ Featured</span>}
                                            </div>
                                            {img.description && <p className="text-white/70 text-xs mt-2 line-clamp-2">{img.description}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4 animate-bounce">🖼️</div>
                            <h3 className="font-display text-2xl text-gray-900 mb-2">No media found</h3>
                            <p className="text-gray-500">Our portfolio is being updated. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightbox && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeInDown" onClick={closeLightbox}>
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl animate-scaleIn" onClick={e => e.stopPropagation()}>
                        {/* Media */}
                        {checkIsVideo(lightbox) ? (
                            <video src={lightbox.imageUrl} controls autoPlay className="w-full h-full object-contain max-h-[90vh]" />
                        ) : (
                            <img src={lightbox.imageUrl} alt={lightbox.title}
                                className="w-full h-full object-contain max-h-[90vh]" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600/111111/444444?text=Image+Unavailable'; }} />
                        )}

                        {/* Details */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 text-white">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">{lightbox.title}</h2>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="text-xs text-white bg-primary-600 px-3 py-1.5 rounded-full font-medium">{lightbox.category}</span>
                                        {lightbox.isFeatured && <span className="text-xs text-yellow-300 bg-yellow-600/50 px-3 py-1.5 rounded-full font-medium">⭐ Featured Event</span>}
                                    </div>
                                </div>
                                <button onClick={closeLightbox} className="text-white/70 hover:text-white text-2xl transition-colors">✕</button>
                            </div>
                            {lightbox.description && <p className="text-white/80 text-sm leading-relaxed">{lightbox.description}</p>}
                            <p className="text-white/60 text-xs mt-3">Added {new Date(lightbox.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>

                        {/* Navigation */}
                        {filtered.length > 1 && (
                            <>
                                <button onClick={e => { e.stopPropagation(); goToPrevious(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={filtered.findIndex(img => img._id === lightbox._id) === 0}>
                                    ←
                                </button>
                                <button onClick={e => { e.stopPropagation(); goToNext(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={filtered.findIndex(img => img._id === lightbox._id) === filtered.length - 1}>
                                    →
                                </button>
                            </>
                        )}

                        {/* Counter */}
                        {filtered.length > 1 && (
                            <div className="absolute top-4 right-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                                {filtered.findIndex(img => img._id === lightbox._id) + 1} / {filtered.length}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

export default PortfolioPage;
