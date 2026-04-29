// ─────────────────────────────────────────────────────────────────────────────
// ServicesPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { serviceAPI } from '../services/api';

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
  :root { --gold:#C9A84C;--gold-light:#E8C97A;--gold-dark:#8B6914;--ivory:#FAF7F0;--ink:#0D0A0B;--ink-soft:#1A1612;--cream:#F5EDD8; }
  .eyebrow { font-family:'Outfit',sans-serif;font-size:0.65rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--gold);font-weight:500; }
  .ornament { display:flex;align-items:center;gap:1rem;justify-content:center;margin:0.75rem 0; }
  .ornament::before,.ornament::after { content:'';flex:1;max-width:60px;height:1px; }
  .ornament::before { background:linear-gradient(90deg,transparent,var(--gold)); }
  .ornament::after { background:linear-gradient(90deg,var(--gold),transparent); }
  .gold-btn {
    font-family:'Outfit',sans-serif;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;
    font-weight:500;padding:1rem 2.5rem;background:var(--gold);color:var(--ink);border:none;cursor:pointer;
    display:inline-flex;align-items:center;gap:0.75rem;text-decoration:none;transition:all 0.3s ease;position:relative;overflow:hidden;
  }
  .gold-btn:hover { background:var(--gold-light);transform:translateY(-1px);box-shadow:0 8px 25px rgba(201,168,76,0.35); }
  .outline-btn {
    font-family:'Outfit',sans-serif;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;
    font-weight:500;padding:1rem 2.5rem;background:transparent;color:var(--gold);border:1px solid rgba(201,168,76,0.4);
    cursor:pointer;display:inline-flex;align-items:center;gap:0.75rem;text-decoration:none;transition:all 0.3s ease;
  }
  .outline-btn:hover { border-color:var(--gold);background:rgba(201,168,76,0.06); }
  .svc-card {
    background:white;border:1px solid rgba(201,168,76,0.1);overflow:hidden;
    transition:all 0.5s cubic-bezier(0.16,1,0.3,1);position:relative;display:block;text-decoration:none;
  }
  .svc-card:hover { transform:translateY(-8px);box-shadow:0 30px 60px rgba(0,0,0,0.1),0 0 0 1px rgba(201,168,76,0.25); }
  .svc-card .reveal { opacity:0;transition:opacity 0.4s ease; }
  .svc-card:hover .reveal { opacity:1; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
  .d1{animation-delay:0.1s}.d2{animation-delay:0.2s}.d3{animation-delay:0.3s}.d4{animation-delay:0.4s}
  .skeleton{background:linear-gradient(90deg,#f0ebe0 25%,#e8e0d0 50%,#f0ebe0 75%);background-size:200% auto;animation:shimmer 1.5s linear infinite;}
  @keyframes shimmer{0%{background-position:200%}100%{background-position:-200%}}
`;

export function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        serviceAPI.getAll()
            .then(r => setServices(Array.isArray(r.data?.data) ? r.data.data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <style>{SHARED_STYLES}</style>
            <Helmet><title>Our Services – Shiv Event Management</title></Helmet>
            <Navbar />
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', paddingTop: '7rem', paddingBottom: '5rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <p className="eyebrow fade-up mb-4">What We Offer</p>
                        <h1 className="fade-up d1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, color: 'var(--ink)', marginBottom: '0.5rem' }}>
                            Crafted With <em style={{ color: 'var(--gold-dark)' }}>Passion</em>
                        </h1>
                        <div className="ornament fade-up d1"><span style={{ color: 'var(--gold)' }}>✦</span></div>
                        <p className="fade-up d2" style={{ fontFamily: 'Outfit', fontWeight: 300, color: '#888', marginTop: '0.75rem', maxWidth: '500px', margin: '0.75rem auto 0', lineHeight: 1.7 }}>
                            Every service is crafted with passion, precision, and a commitment to excellence.
                        </p>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '360px' }} />)}
                        </div>
                    ) : services.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                            {services.map((s, idx) => (
                                <Link key={s._id} to={`/services/${s.slug}`} className="svc-card fade-up" style={{ animationDelay: `${(idx % 3) * 0.1}s` }}>
                                    {s.image ? (
                                        <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                                            <img src={s.image} alt={s.title} loading="lazy"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease', display: 'block' }}
                                                onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                                onError={e => { e.target.style.display = 'none'; }} />
                                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', width: '44px', height: '44px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                                {s.icon || '✦'}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '2rem 2rem 0' }}>
                                            <div style={{ width: '52px', height: '52px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', transition: 'all 0.4s ease' }}>
                                                {s.icon || '✦'}
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ padding: '2rem' }}>
                                        <p className="eyebrow mb-2">{s.category || 'Service'}</p>
                                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '0.75rem', transition: 'color 0.3s' }}>
                                            {s.title}
                                        </h3>
                                        <p style={{ fontFamily: 'Outfit', fontSize: '0.875rem', color: '#777', lineHeight: 1.7, fontWeight: 300, marginBottom: '1.25rem' }}>
                                            {s.shortDescription}
                                        </p>
                                        {s.startingPrice && (
                                            <p style={{ fontFamily: 'Outfit', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 500, marginBottom: '1.25rem' }}>
                                                From ₹{s.startingPrice.toLocaleString('en-IN')}
                                            </p>
                                        )}
                                        <div className="reveal" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Outfit', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 500 }}>
                                            Discover More →
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--gold)' }}>✦</div>
                            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: 'var(--ink)' }}>No services available yet</h3>
                        </div>
                    )}

                    {/* Bottom CTA */}
                    <div style={{ marginTop: '5rem', background: 'var(--ink)', padding: '4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 60%)' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <p className="eyebrow mb-4" style={{ color: 'rgba(201,168,76,0.7)' }}>Custom Request</p>
                            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 300, color: 'white', marginBottom: '1rem' }}>
                                Don't see what you need?
                            </h2>
                            <p style={{ fontFamily: 'Outfit', color: 'rgba(250,247,240,0.5)', fontWeight: 300, marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                                We handle all kinds of events. Let's talk about your unique requirements.
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                                <Link to="/contact" className="gold-btn">Get in Touch</Link>
                                <a href="https://wa.me/916394352002" target="_blank" rel="noopener noreferrer" className="outline-btn">📱 +91 63943 52002</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ServicesPage;