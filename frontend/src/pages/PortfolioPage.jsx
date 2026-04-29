import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { galleryAPI } from '../services/api';

const CATEGORIES = ['All', 'Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Conference', 'Concert', 'Other'];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
  :root {
    --gold: #C9A84C; --gold-light: #E8C97A; --gold-dark: #8B6914;
    --ivory: #FAF7F0; --ink: #0D0A0B; --cream: #F5EDD8;
  }
  .section-eyebrow { font-family: 'Outfit', sans-serif; font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); font-weight: 500; }
  .ornament { display: flex; align-items: center; gap: 1rem; justify-content: center; margin: 0.75rem 0; }
  .ornament::before, .ornament::after { content: ''; flex: 1; max-width: 60px; height: 1px; }
  .ornament::before { background: linear-gradient(90deg, transparent, var(--gold)); }
  .ornament::after { background: linear-gradient(90deg, var(--gold), transparent); }
  .cat-pill {
    font-family: 'Outfit', sans-serif; font-size: 0.65rem; letter-spacing: 0.15em;
    text-transform: uppercase; padding: 0.6rem 1.5rem; cursor: pointer;
    border: 1px solid rgba(201,168,76,0.25); background: transparent; color: #888;
    transition: all 0.3s ease; white-space: nowrap;
  }
  .cat-pill:hover { border-color: var(--gold); color: var(--gold-dark); }
  .cat-pill.active { background: var(--ink); color: var(--gold); border-color: var(--ink); }
  .gallery-item {
    position: relative; overflow: hidden; cursor: pointer; break-inside: avoid;
    margin-bottom: 1.25rem;
    transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  .gallery-item:hover { transform: scale(1.02); }
  .gallery-item-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(13,10,11,0.9) 0%, rgba(13,10,11,0.3) 50%, transparent 100%);
    opacity: 0; transition: opacity 0.4s ease;
    display: flex; flex-direction: column; justify-content: flex-end; padding: 1.25rem;
  }
  .gallery-item:hover .gallery-item-overlay { opacity: 1; }
  .lightbox-backdrop {
    position: fixed; inset: 0; z-index: 1000; background: rgba(13,10,11,0.95);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  .lightbox-content { animation: scaleIn 0.3s cubic-bezier(0.16,1,0.3,1); }
  .nav-btn {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 48px; height: 48px; background: rgba(201,168,76,0.15);
    border: 1px solid rgba(201,168,76,0.3); color: var(--gold);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 1.2rem; transition: all 0.3s ease;
  }
  .nav-btn:hover:not(:disabled) { background: var(--gold); color: var(--ink); }
  .nav-btn:disabled { opacity: 0.2; cursor: not-allowed; }
  .nav-btn.prev { left: -64px; }
  .nav-btn.next { right: -64px; }
  @media (max-width: 768px) {
    .nav-btn.prev { left: 8px; }
    .nav-btn.next { right: 8px; }
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .skeleton { background: linear-gradient(90deg, #f0ebe0 25%, #e8e0d0 50%, #f0ebe0 75%); background-size: 200% auto; animation: shimmer 1.5s linear infinite; }
  @keyframes shimmer { 0%{background-position:200%} 100%{background-position:-200%} }
`;

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
    const checkIsVideo = useCallback((img) => img?.mediaType === 'video' || img?.imageUrl?.match(/\.(mp4|webm|mov|ogg)$/i) || img?.imageUrl?.includes('/video/upload/'), []);

    const openLightbox = useCallback((img) => setLightbox(img), []);
    const closeLightbox = useCallback(() => setLightbox(null), []);

    const goToPrevious = useCallback(() => {
        const i = filtered.findIndex(img => img._id === lightbox._id);
        if (i > 0) setLightbox(filtered[i - 1]);
    }, [filtered, lightbox]);

    const goToNext = useCallback(() => {
        const i = filtered.findIndex(img => img._id === lightbox._id);
        if (i < filtered.length - 1) setLightbox(filtered[i + 1]);
    }, [filtered, lightbox]);

    useEffect(() => {
        if (!lightbox) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightbox, goToPrevious, goToNext, closeLightbox]);

    return (
        <>
            <style>{STYLES}</style>
            <Helmet><title>Portfolio – Shiv Event Management</title></Helmet>
            <Navbar />
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', paddingTop: '7rem', paddingBottom: '5rem' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <p className="section-eyebrow mb-4">Our Portfolio</p>
                        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, color: 'var(--ink)', marginBottom: '0.5rem' }}>
                            A Gallery of <em style={{ color: 'var(--gold-dark)' }}>Memories</em>
                        </h1>
                        <div className="ornament"><span style={{ color: 'var(--gold)' }}>✦</span></div>
                        <p style={{ fontFamily: 'Outfit', fontWeight: 300, color: '#888', marginTop: '0.5rem', maxWidth: '480px', margin: '0.5rem auto 0' }}>
                            Each event is a unique story of celebration and excellence.
                        </p>
                    </div>

                    {/* Category Filter */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '3.5rem' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat} className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Gallery */}
                    {loading ? (
                        <div style={{ columns: '1', columnGap: '1.25rem' }}
                            className="sm:columns-2 lg:columns-3 xl:columns-4">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: `${180 + (i % 3) * 80}px`, marginBottom: '1.25rem', borderRadius: '2px' }} />
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div style={{ columns: '1', columnGap: '1.25rem' }}
                            className="sm:columns-2 lg:columns-3 xl:columns-4">
                            {filtered.map((img) => (
                                <div key={img._id} className="gallery-item" onClick={() => openLightbox(img)}>
                                    {checkIsVideo(img) ? (
                                        <video src={img.imageUrl} className="w-full h-auto block bg-gray-100"
                                            muted loop playsInline
                                            onMouseEnter={e => e.target.play()}
                                            onMouseLeave={e => e.target.pause()} />
                                    ) : (
                                        <img src={img.imageUrl} alt={img.title} loading="lazy"
                                            className="w-full h-auto block"
                                            style={{ background: '#f0ebe0' }}
                                            onError={e => { e.target.src = 'https://placehold.co/600x600/f5edd8/c9a84c?text=✦'; }} />
                                    )}
                                    <div className="gallery-item-overlay">
                                        <div>
                                            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: 'white', fontWeight: 400, marginBottom: '0.4rem' }}>{img.title}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <span style={{ fontFamily: 'Outfit', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.4)', padding: '0.25rem 0.6rem' }}>
                                                    {img.category}
                                                </span>
                                                {checkIsVideo(img) && <span style={{ fontFamily: 'Outfit', fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>▶ Video</span>}
                                                {img.isFeatured && <span style={{ fontFamily: 'Outfit', fontSize: '0.6rem', color: 'var(--gold-light)', letterSpacing: '0.1em' }}>★ Featured</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gold)' }}>✦</div>
                            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '0.5rem' }}>No media found</h3>
                            <p style={{ fontFamily: 'Outfit', color: '#999', fontWeight: 300 }}>Portfolio being updated. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className="lightbox-backdrop" onClick={closeLightbox}>
                    <div className="lightbox-content" style={{ position: 'relative', maxWidth: '900px', width: '100%', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                        {checkIsVideo(lightbox) ? (
                            <video src={lightbox.imageUrl} controls autoPlay style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', background: 'black', display: 'block' }} />
                        ) : (
                            <img src={lightbox.imageUrl} alt={lightbox.title}
                                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block', background: '#111' }}
                                onError={e => { e.target.src = 'https://placehold.co/800x600/111/444?text=Image+Unavailable'; }} />
                        )}

                        {/* Details bar */}
                        <div style={{ background: 'var(--ink-soft)', padding: '1.5rem 2rem', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: 'white', fontWeight: 400, marginBottom: '0.5rem' }}>{lightbox.title}</h2>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontFamily: 'Outfit', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)', padding: '0.3rem 0.75rem' }}>
                                            {lightbox.category}
                                        </span>
                                        {lightbox.isFeatured && <span style={{ fontFamily: 'Outfit', fontSize: '0.6rem', color: 'var(--gold-light)', letterSpacing: '0.1em' }}>★ Featured Event</span>}
                                    </div>
                                    {lightbox.description && <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.75rem', fontWeight: 300, lineHeight: 1.6 }}>{lightbox.description}</p>}
                                </div>
                                <button onClick={closeLightbox} style={{ background: 'none', border: '1px solid rgba(201,168,76,0.3)', color: 'rgba(255,255,255,0.5)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '1rem', transition: 'all 0.3s' }}
                                    onMouseEnter={e => { e.target.style.color = 'var(--gold)'; e.target.style.borderColor = 'var(--gold)'; }}
                                    onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.5)'; e.target.style.borderColor = 'rgba(201,168,76,0.3)'; }}>
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Navigation */}
                        {filtered.length > 1 && (() => {
                            const idx = filtered.findIndex(img => img._id === lightbox._id);
                            return (
                                <>
                                    <button className="nav-btn prev" onClick={e => { e.stopPropagation(); goToPrevious(); }} disabled={idx === 0}>←</button>
                                    <button className="nav-btn next" onClick={e => { e.stopPropagation(); goToNext(); }} disabled={idx === filtered.length - 1}>→</button>
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(13,10,11,0.7)', color: 'var(--gold)', fontFamily: 'Outfit', fontSize: '0.7rem', letterSpacing: '0.1em', padding: '0.4rem 0.75rem', backdropFilter: 'blur(4px)' }}>
                                        {idx + 1} / {filtered.length}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

export default PortfolioPage;