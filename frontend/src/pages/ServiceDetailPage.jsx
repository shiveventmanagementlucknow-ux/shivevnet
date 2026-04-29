import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { serviceAPI } from '../services/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
  :root { --gold:#C9A84C;--gold-light:#E8C97A;--gold-dark:#8B6914;--ivory:#FAF7F0;--ink:#0D0A0B;--cream:#F5EDD8; }
  .eyebrow { font-family:'Outfit',sans-serif;font-size:0.65rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--gold);font-weight:500; }
  .gold-btn {
    font-family:'Outfit',sans-serif;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;
    font-weight:500;padding:1rem 2.5rem;background:var(--gold);color:var(--ink);border:none;cursor:pointer;
    display:inline-flex;align-items:center;justify-content:center;gap:0.75rem;text-decoration:none;transition:all 0.3s ease;
  }
  .gold-btn:hover { background:var(--gold-light);transform:translateY(-1px);box-shadow:0 8px 25px rgba(201,168,76,0.35); }
  .outline-btn {
    font-family:'Outfit',sans-serif;font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;
    font-weight:500;padding:1rem 2.5rem;background:transparent;color:var(--gold);border:1px solid rgba(201,168,76,0.4);
    cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:0.75rem;text-decoration:none;transition:all 0.3s ease;
  }
  .outline-btn:hover { border-color:var(--gold);background:rgba(201,168,76,0.06); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
  .d1{animation-delay:0.1s}.d2{animation-delay:0.2s}.d3{animation-delay:0.3s}
`;

export function ServiceDetailPage() {
    const { slug } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        serviceAPI.getOne(slug)
            .then(r => setService(r.data.data))
            .catch(() => setService(null))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return (
        <>
            <style>{STYLES}</style>
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '1.5px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        </>
    );

    if (!service) return (
        <>
            <style>{STYLES}</style>
            <Navbar />
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', color: 'var(--gold)', marginBottom: '1rem' }}>✦</div>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '0.75rem' }}>Service Not Found</h2>
                    <p style={{ fontFamily: 'Outfit', color: '#888', fontWeight: 300, marginBottom: '2rem' }}>The service you're looking for doesn't exist.</p>
                    <Link to="/services" className="gold-btn">View All Services</Link>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <style>{STYLES}</style>
            <Helmet><title>{service.title} – Shiv Event Management</title></Helmet>
            <Navbar />
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', paddingTop: '7rem', paddingBottom: '5rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <Link to="/services" style={{ fontFamily: 'Outfit', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', fontWeight: 500 }}>
                        ← Back to Services
                    </Link>

                    <div style={{ background: 'white', border: '1px solid rgba(201,168,76,0.1)' }}>
                        {service.image && (
                            <div style={{ overflow: 'hidden', height: '420px' }}>
                                <img src={service.image} alt={service.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.8s ease' }}
                                    onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                    onError={e => { e.target.style.display = 'none'; }} />
                            </div>
                        )}

                        <div style={{ padding: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '3rem', width: '72px', height: '72px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {service.icon || '✦'}
                                </div>
                                <div>
                                    <p className="eyebrow fade-up mb-1">{service.category || 'Premium Service'}</p>
                                    <h1 className="fade-up d1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.1 }}>
                                        {service.title}
                                    </h1>
                                </div>
                            </div>

                            <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, var(--gold), transparent)', marginBottom: '2rem' }} />

                            <p className="fade-up d2" style={{ fontFamily: 'Outfit', fontWeight: 300, color: '#666', lineHeight: 1.9, fontSize: '1rem', marginBottom: '2.5rem' }}>
                                {service.description}
                            </p>

                            {service.features?.length > 0 && (
                                <div className="fade-up d2" style={{ marginBottom: '2.5rem' }}>
                                    <p className="eyebrow mb-4">What's Included</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                        {service.features.map((f, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}>
                                                <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✦</span>
                                                <span style={{ fontFamily: 'Outfit', fontSize: '0.875rem', color: '#555', fontWeight: 300 }}>{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {service.startingPrice && (
                                <div className="fade-up d3" style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(201,168,76,0.04)', borderLeft: '3px solid var(--gold)' }}>
                                    <p className="eyebrow mb-1">Starting Price</p>
                                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 400, color: 'var(--gold-dark)' }}>
                                        ₹{service.startingPrice.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            )}

                            <div className="fade-up d3" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                <Link to="/booking" className="gold-btn" style={{ flex: '1', minWidth: '160px' }}>Book This Service</Link>
                                <a href={`https://wa.me/916394352002?text=Hi,%20I'm%20interested%20in%20your%20${encodeURIComponent(service.title)}%20service.`}
                                    target="_blank" rel="noopener noreferrer" className="outline-btn" style={{ flex: '1', minWidth: '160px' }}>
                                    📱 WhatsApp Us
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ServiceDetailPage;