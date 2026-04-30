import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { testimonialAPI, serviceAPI, galleryAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

/* ─── Parallax (desktop only) ──────────────────────────────────────── */
function useParallax(factor = 0.15) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    if (!mq.matches) return;
    const onScroll = () => setOffset(window.scrollY * factor);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [factor]);
  return offset;
}

/* ─── Animated Counter ──────────────────────────────────────────────── */
function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const num = parseInt(String(target).replace(/\D/g, '')) || 0;
    const suffix = String(target).replace(/[\d]/g, '');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const step = num / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, num);
          setCount(Math.floor(current) + suffix);
          if (current >= num) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count || target}</span>;
}

/* ─── Cursor Glow (desktop only) ────────────────────────────────────── */
function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div aria-hidden="true" style={{
      pointerEvents: 'none', position: 'fixed',
      width: '400px', height: '400px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
      transform: 'translate(-50%, -50%)',
      left: pos.x, top: pos.y, zIndex: 9999,
      transition: 'left 0.12s ease, top 0.12s ease',
    }} />
  );
}

/* ─── Feature Cards ─────────────────────────────────────────────────── */
const features = [
  { icon: '🎯', title: 'Precision Planning', desc: 'Every timeline, vendor, and detail choreographed to perfection — months before your event.' },
  { icon: '💎', title: 'Luxury Sourcing', desc: 'Exclusive access to premium décor, florals, and venue partners across North India.' },
  { icon: '🤝', title: 'Dedicated Team', desc: 'A personal event director and on-ground crew with you from first call to final bow.' },
  { icon: '📸', title: 'Captured Moments', desc: 'Curated photography and cinematic coverage to relive every emotion, forever.' },
  { icon: '🌿', title: 'Sustainable Events', desc: 'Eco-conscious sourcing and zero-waste setups without compromising on elegance.' },
  { icon: '🔒', title: 'Stress-Free Promise', desc: 'One point of contact, complete transparency, and a satisfaction guarantee.' },
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingT, setLoadingT] = useState(true);
  const [activeT, setActiveT] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const intervalRef = useRef(null);
  const [services, setServices] = useState([]);
  const [loadingS, setLoadingS] = useState(true);
  const [portfolio, setPortfolio] = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const heroOffset = useParallax(0.2);

  const slides = settings?.heroSlides?.length > 0 ? settings.heroSlides : [];
  const stats = settings?.stats || {};
  const hasStats = stats.eventsCompleted || stats.clientSatisfaction || stats.yearsExperience || stats.teamMembers;

  useEffect(() => {
    if (slides.length > 1) {
      intervalRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 6000);
      return () => clearInterval(intervalRef.current);
    }
  }, [slides.length]);

  useEffect(() => {
    testimonialAPI.getAll()
      .then(r => setTestimonials(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => { })
      .finally(() => setLoadingT(false));
  }, []);

  useEffect(() => {
    serviceAPI.getAll()
      .then(r => setServices(Array.isArray(r.data?.data) ? r.data.data.slice(0, 4) : []))
      .catch(() => { })
      .finally(() => setLoadingS(false));

    galleryAPI.getAll({ limit: 5 })
      .then(r => setPortfolio(Array.isArray(r.data?.data) ? r.data.data.slice(0, 5) : []))
      .catch(() => { })
      .finally(() => setLoadingP(false));
  }, []);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => setActiveT(c => (c + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const siteUrl = 'https://shiveventlucknow.in';
  const pageUrl = `${siteUrl}${pathname}`;
  const companyName = settings?.companyName || 'Shiv Event Management';
  const metaTitle = settings?.metaTitle || `${companyName} – Luxury Events`;
  const metaDescription = settings?.metaDescription || "India's most trusted luxury event management company.";
  const ogImage = slides[0]?.image || `${siteUrl}/og-image.jpg`;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': companyName,
    'url': siteUrl,
    'logo': `${siteUrl}/logo.png`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': settings?.phone,
      'contactType': 'customer service',
    },
    'sameAs': [
      settings?.socialLinks?.instagram,
      settings?.socialLinks?.facebook,
      settings?.socialLinks?.twitter,
      settings?.socialLinks?.youtube,
    ].filter(Boolean),
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': siteUrl,
    'name': companyName,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string',
    },
  };


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
        :root {
          --gold: #C9A84C; --gold-light: #E8C97A; --gold-dark: #8B6914;
          --ivory: #FAF7F0; --ink: #0D0A0B; --ink-soft: #1A1612; --cream: #F5EDD8;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--ivory); }

        .eyebrow {
          font-family: 'Outfit', sans-serif; font-size: 0.65rem;
          letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); font-weight: 500;
        }
        .ornament {
          display: flex; align-items: center; gap: 1rem; justify-content: center; margin: 1rem 0;
        }
        .ornament::before, .ornament::after { content: ''; flex: 1; max-width: 80px; height: 1px; }
        .ornament::before { background: linear-gradient(90deg, transparent, var(--gold)); }
        .ornament::after  { background: linear-gradient(90deg, var(--gold), transparent); }
        .shimmer {
          background: linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .gold-line {
          display: inline-block; width: 40px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent); vertical-align: middle;
        }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .fu { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .d1{animation-delay:.15s} .d2{animation-delay:.3s} .d3{animation-delay:.45s} .d4{animation-delay:.6s}

        /* ── Hero Buttons ── */
        .hero-btns {
          display: flex; flex-wrap: wrap; gap: 0.85rem;
          justify-content: center; align-items: center;
        }
        .btn-gold {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.9rem 2.2rem;
          font-family: 'Outfit', sans-serif; font-weight: 500; font-size: 0.75rem;
          letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none;
          background: var(--gold); color: var(--ink); border: 1px solid var(--gold);
          cursor: pointer; white-space: nowrap;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .btn-gold:hover { background: var(--gold-light); box-shadow: 0 8px 28px rgba(201,168,76,0.35); }
        .btn-outline-light {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.9rem 2.2rem;
          font-family: 'Outfit', sans-serif; font-weight: 500; font-size: 0.75rem;
          letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none;
          background: transparent; color: var(--ivory); border: 1px solid rgba(201,168,76,0.5);
          cursor: pointer; white-space: nowrap;
          transition: all 0.3s ease;
        }
        .btn-outline-light:hover { background: rgba(201,168,76,0.1); border-color: var(--gold); color: var(--gold-light); }
        .btn-outline-dark {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.9rem 2.2rem;
          font-family: 'Outfit', sans-serif; font-weight: 500; font-size: 0.75rem;
          letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none;
          background: transparent; color: var(--ink); border: 1px solid rgba(13,10,11,0.3);
          cursor: pointer; white-space: nowrap;
          transition: all 0.3s ease;
        }
        .btn-outline-dark:hover { background: var(--ink); color: var(--gold); border-color: var(--ink); }

        /* ── Stats ── */
        .stats-grid {
          max-width: 72rem; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4, 1fr);
        }
        .stat-cell {
          padding: 2.5rem 1.5rem; text-align: center;
          border-right: 1px solid rgba(201,168,76,0.12);
        }
        .stat-cell:last-child { border-right: none; }

        /* ── Features ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem; margin-bottom: 3.5rem;
        }
        .feature-card {
          padding: 2.25rem 1.75rem;
          border: 1px solid rgba(201,168,76,0.12);
          background: #fff;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          cursor: default;
        }
        .feature-card:hover {
          background: var(--ink);
          border-color: rgba(201,168,76,0.25);
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.1);
        }
        .feature-card:hover .fc-title { color: var(--gold); }
        .feature-card:hover .fc-desc  { color: rgba(250,247,240,0.6); }

        /* ── Testimonial thumbs ── */
        .t-thumb {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 0.85rem;
          background: transparent; border: 1px solid rgba(201,168,76,0.12);
          cursor: pointer; transition: all 0.3s ease;
        }
        .t-thumb.active, .t-thumb:hover {
          background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.4);
        }

        /* ── Services Grid ── */
        .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .service-card { background: #fff; border: 1px solid rgba(201,168,76,0.15); overflow: hidden; transition: all 0.4s ease; text-decoration: none; display: flex; flex-direction: column; }
        .service-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); border-color: var(--gold); }
        .sc-img-wrap { width: 100%; height: 220px; overflow: hidden; }
        .sc-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
        .service-card:hover .sc-img { transform: scale(1.05); }

        /* ── Portfolio Grid (5 Items) ── */
        .portfolio-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
        .portfolio-item { position: relative; overflow: hidden; background: #111; cursor: pointer; border-radius: 4px; }
        .portfolio-item:nth-child(1), .portfolio-item:nth-child(2) { grid-column: span 3; height: 320px; }
        .portfolio-item:nth-child(3), .portfolio-item:nth-child(4), .portfolio-item:nth-child(5) { grid-column: span 2; height: 260px; }
        .p-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease, opacity 0.3s ease; opacity: 0.85; }
        .portfolio-item:hover .p-img { transform: scale(1.05); opacity: 1; }
        .p-overlay {
          position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.4s ease; display: flex; align-items: flex-end; padding: 1.5rem;
        }
        .portfolio-item:hover .p-overlay { opacity: 1; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .portfolio-item:nth-child(1), .portfolio-item:nth-child(2) { grid-column: span 3; height: 280px; }
          .portfolio-item:nth-child(3), .portfolio-item:nth-child(4), .portfolio-item:nth-child(5) { grid-column: span 2; height: 220px; }
        }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-cell { border-right: none; border-bottom: 1px solid rgba(201,168,76,0.1); }
          .stat-cell:nth-child(odd) { border-right: 1px solid rgba(201,168,76,0.1); }
          .stat-cell:last-child, .stat-cell:nth-last-child(2):nth-child(odd) { border-bottom: none; }
          .features-grid { grid-template-columns: 1fr; }
          .services-grid { grid-template-columns: 1fr; }
          .portfolio-grid { grid-template-columns: 1fr; }
          .portfolio-item:nth-child(n) { grid-column: span 1; height: 260px; }
        }

        @media (max-width: 480px) {
          .hero-btns { flex-direction: column; align-items: stretch; }
          .hero-btns a, .hero-btns button { width: 100%; min-width: unset; }
          .cta-btns { flex-direction: column; align-items: stretch; }
          .cta-btns a, .cta-btns button { width: 100%; min-width: unset; }
          .stat-cell { padding: 1.75rem 1rem; }
        }
      `}</style>

      <CursorGlow />
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={pageUrl} />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={companyName} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
        {/* JSON-LD Schema */}
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      </Helmet>
      <Navbar />

      {/* ══════════════════════════ HERO ════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100svh', minHeight: '560px', overflow: 'hidden', background: 'var(--ink)' }}>

        {/* Slides */}
        {slides.map((slide, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            opacity: i === current ? 1 : 0,
            transform: i === current ? 'scale(1)' : 'scale(1.05)',
            transition: 'opacity 1.2s ease, transform 1.2s ease',
            zIndex: i === current ? 10 : 0,
          }}>
            <img
              src={slide.image} alt={slide.title}
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${heroOffset}px)` }}
              onError={e => { e.target.src = 'https://placehold.co/1920x1080/0D0A0B/C9A84C?text=Shiv+Events'; }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.85) 100%)' }} />
          </div>
        ))}

        {/* Fallback bg */}
        {slides.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0D0A0B, #1A0F0A, #0A0D0F)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.09) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(139,26,43,0.06) 0%, transparent 60%)' }} />
          </div>
        )}

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 20, height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 1.25rem',
        }}>
          <p className="eyebrow fu" style={{ marginBottom: '1.25rem' }}>
            <span className="gold-line" style={{ marginRight: '0.65rem' }} />
            Est. 2015 · Varanasi, India
            <span className="gold-line" style={{ marginLeft: '0.65rem' }} />
          </p>

          <h1 className="fu d1" style={{
            fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#fff',
            fontSize: 'clamp(2.8rem, 9vw, 7rem)', lineHeight: 1.02,
            letterSpacing: '-0.01em', marginBottom: '1.25rem',
            textShadow: '0 4px 40px rgba(0,0,0,0.5)',
          }}>
            {slides[current]?.title || settings?.companyName || 'Shiv Events'}
          </h1>

          <div className="ornament fu d2">
            <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>✦</span>
          </div>

          <p className="fu d3" style={{
            fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300,
            color: 'rgba(255,255,255,0.75)', lineHeight: 1.6,
            fontSize: 'clamp(1rem, 2.8vw, 1.65rem)', maxWidth: '600px', marginBottom: '2.5rem',
          }}>
            {slides[current]?.subtitle || settings?.tagline || 'Where Every Moment Becomes Legacy'}
          </p>

          <div className="hero-btns fu d4">
            <Link to="/booking" className="btn-gold">Book Your Event →</Link>
            <Link to="/portfolio" className="btn-outline-light">View Portfolio</Link>
            <a
              href="https://wa.me/916394352002?text=Hi!%20I%20would%20like%20to%20know%20more%20about%20your%20event%20management%20services." target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2.2rem',
                fontFamily: 'Outfit', fontWeight: 500, fontSize: '0.75rem',
                letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none',
                background: 'transparent', color: '#25D366',
                border: '1px solid rgba(37,211,102,0.45)',
                transition: 'all 0.3s ease', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.1)'; e.currentTarget.style.borderColor = '#25D366'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.45)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Slide dots */}
        {slides.length > 1 && (
          <div style={{ position: 'absolute', bottom: '1.75rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: '0.4rem' }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: i === current ? '28px' : '6px', height: '6px',
                borderRadius: '3px', border: 'none', cursor: 'pointer',
                background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.28)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        )}

        {/* Scroll indicator — hidden on mobile */}
        <div style={{ position: 'absolute', bottom: '1.75rem', right: '1.75rem', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', opacity: 0.5 }}>
          <span style={{ fontFamily: 'Outfit', fontSize: '0.55rem', letterSpacing: '0.22em', color: 'var(--gold)', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: '1px', height: '36px', background: 'linear-gradient(to bottom, var(--gold), transparent)' }} />
        </div>
      </section>

      {/* ══════════════════════════ STATS ═══════════════════════════════ */}
      {hasStats && (
        <section style={{ background: 'var(--ink-soft)', borderTop: '1px solid rgba(201,168,76,0.15)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
          <div className="stats-grid">
            {[
              { val: stats.eventsCompleted, label: 'Events Completed' },
              { val: stats.clientSatisfaction, label: 'Client Satisfaction' },
              { val: stats.yearsExperience, label: 'Years of Mastery' },
              { val: stats.teamMembers, label: 'Expert Artisans' },
            ].filter(s => s.val).map((s, i) => (
              <div key={i} className="stat-cell">
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--gold)', fontWeight: 600, marginBottom: '0.3rem' }}>
                  <AnimatedCounter target={s.val} />
                </div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.4)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════ SERVICES ══════════════════════════════ */}
      <section style={{ background: 'var(--cream)', padding: 'clamp(4rem, 8vw, 7rem) 1.25rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
            <p className="eyebrow" style={{ marginBottom: '1rem' }}>Our Expertise</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '1rem' }}>
              Bespoke <em style={{ color: 'var(--gold-dark)' }}>Services</em>
            </h2>
            <div className="ornament"><span style={{ color: 'var(--gold)' }}>✦</span></div>
          </div>

          {!loadingS && services.length > 0 && (
            <div className="services-grid">
              {services.map(s => (
                <Link key={s._id} to={`/services/${s.slug}`} className="service-card">
                  <div className="sc-img-wrap">
                    <img src={typeof s.image === 'string' ? s.image : (s.image?.url || 'https://placehold.co/600x400/f5edd8/c9a84c?text=Service')} alt={s.title || 'Service'} className="sc-img" loading="lazy" onError={(e) => { e.target.src = 'https://placehold.co/600x400/f5edd8/c9a84c?text=Service'; }} />
                  </div>
                  <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.5rem' }}>{s.title}</h3>
                    <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', lineHeight: 1.6, color: '#666', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flexGrow: 1 }}>{s.description}</p>
                    <div style={{ marginTop: '1.25rem', fontFamily: 'Outfit', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Explore →</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link to="/services" className="btn-outline-dark">View All Services</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ PORTFOLIO ═════════════════════════════ */}
      <section style={{ background: 'var(--ink)', padding: 'clamp(4rem, 8vw, 7rem) 1.25rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
            <p className="eyebrow" style={{ marginBottom: '1rem' }}>Our Masterpieces</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 300, color: '#fff', lineHeight: 1.15, marginBottom: '1rem' }}>
              Featured <em className="shimmer">Portfolio</em>
            </h2>
            <div className="ornament"><span style={{ color: 'var(--gold)' }}>✦</span></div>
          </div>

          {!loadingP && portfolio.length > 0 && (
            <div className="portfolio-grid">
              {portfolio.slice(0, 5).map((p, i) => (
                <Link key={p._id || i} to="/portfolio" className="portfolio-item">
                  {p.mediaType === 'video' || (typeof p.imageUrl === 'string' && p.imageUrl.match(/\.(mp4|webm|mov|ogg)$/i)) ? (
                    <video src={typeof p.imageUrl === 'string' ? p.imageUrl : (p.image?.url || '')} className="p-img" autoPlay muted loop playsInline style={{ objectFit: 'cover' }} />
                  ) : (
                    <img src={typeof p.imageUrl === 'string' ? p.imageUrl : (p.image?.url || p.image || 'https://placehold.co/600x600/111/C9A84C?text=Portfolio')} alt={p.title || 'Event'} className="p-img" loading="lazy" onError={(e) => { e.target.src = 'https://placehold.co/600x600/111/C9A84C?text=Portfolio'; }} />
                  )}
                  <div className="p-overlay">
                    <div>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#fff', margin: 0, fontWeight: 400 }}>{p.title || 'Event Highlights'}</h3>
                      {p.category && <p style={{ fontFamily: 'Outfit', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', marginTop: '0.25rem' }}>{p.category}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link to="/portfolio" className="btn-outline-light">Discover Full Gallery</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ WHY US ══════════════════════════════ */}
      <section style={{ background: 'var(--ivory)', padding: 'clamp(4rem, 8vw, 7rem) 1.25rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
            <p className="eyebrow" style={{ marginBottom: '1rem' }}>Why Choose Us</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '1rem' }}>
              The Art of Flawless <em style={{ color: 'var(--gold-dark)' }}>Celebrations</em>
            </h2>
            <div className="ornament"><span style={{ color: 'var(--gold)' }}>✦</span></div>
            {settings?.aboutText && (
              <p style={{ fontFamily: 'Outfit', color: '#666', lineHeight: 1.9, fontWeight: 300, maxWidth: '560px', margin: '1.5rem auto 0', fontSize: '0.92rem' }}>
                {settings.aboutText}
              </p>
            )}
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '1.1rem' }}>{f.icon}</div>
                <h3 className="fc-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.65rem', transition: 'color 0.3s ease' }}>
                  {f.title}
                </h3>
                <p className="fc-desc" style={{ fontFamily: 'Outfit', fontSize: '0.85rem', lineHeight: 1.75, fontWeight: 300, color: '#777', transition: 'color 0.3s ease' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/booking" className="btn-gold">✨ Get a Free Quote</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ TESTIMONIALS ════════════════════════ */}
      <section style={{ background: 'var(--ink)', padding: 'clamp(4rem, 8vw, 7rem) 1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: '64rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
            <p className="eyebrow" style={{ marginBottom: '1rem' }}>Client Stories</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#fff', lineHeight: 1.2 }}>
              Voices of Our <em className="shimmer">Happy Patrons</em>
            </h2>
            <div className="ornament"><span style={{ color: 'var(--gold)' }}>✦</span></div>
          </div>

          {loadingT ? (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3].map(i => <div key={i} style={{ width: 'min(280px, 80vw)', height: '160px', background: 'rgba(201,168,76,0.05)' }} />)}
            </div>
          ) : testimonials.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'rgba(250,247,240,0.35)', fontFamily: 'Outfit', fontSize: '0.85rem' }}>No testimonials yet.</p>
          ) : (
            <>
              <div style={{ position: 'relative', minHeight: 'clamp(240px, 40vw, 300px)', marginBottom: '2rem' }}>
                {testimonials.map((t, i) => (
                  <div key={t._id} style={{
                    position: 'absolute', width: '100%',
                    opacity: i === activeT ? 1 : 0,
                    transform: i === activeT ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'opacity 0.7s ease, transform 0.7s ease',
                    pointerEvents: i === activeT ? 'auto' : 'none',
                  }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)',
                      padding: 'clamp(1.5rem, 5vw, 3rem)', maxWidth: '680px', margin: '0 auto', textAlign: 'center',
                    }}>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 0.6, color: 'rgba(201,168,76,0.12)', marginBottom: '1.25rem', userSelect: 'none' }}>"</div>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', fontStyle: 'italic', color: 'rgba(250,247,240,0.85)', lineHeight: 1.85, fontWeight: 300, marginBottom: '1.75rem' }}>
                        {t.text || 'No testimonial text provided.'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', marginBottom: '1rem' }}>
                        {[...Array(t.rating || 5)].map((_, j) => <span key={j} style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>★</span>)}
                      </div>
                      <div style={{ width: '36px', height: '1px', background: 'var(--gold)', margin: '0 auto 0.85rem' }} />
                      <div style={{ fontFamily: 'Outfit', fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>{t.name || 'Anonymous'}</div>
                      {t.role && <div style={{ fontFamily: 'Outfit', fontSize: '0.66rem', color: 'rgba(250,247,240,0.35)', marginTop: '0.2rem', letterSpacing: '0.1em' }}>{t.role}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {testimonials.map((t, i) => (
                  <button key={i} onClick={() => setActiveT(i)} className={`t-thumb ${i === activeT ? 'active' : ''}`}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: i === activeT ? 'var(--gold)' : 'rgba(201,168,76,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Outfit', fontSize: '0.65rem', fontWeight: 700,
                      color: i === activeT ? 'var(--ink)' : 'var(--gold)', transition: 'all 0.3s ease',
                    }}>{(t.name?.charAt(0) || 'A').toUpperCase()}</div>
                    <span style={{ fontFamily: 'Outfit', fontSize: '0.65rem', letterSpacing: '0.1em', color: i === activeT ? 'var(--gold)' : 'rgba(250,247,240,0.35)', transition: 'color 0.3s ease' }}>
                      {t.name || 'Anonymous'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════ CTA ═════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', padding: 'clamp(4rem, 8vw, 7rem) 1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div style={{ maxWidth: '46rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p className="eyebrow" style={{ marginBottom: '1.25rem' }}>Begin Your Story</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 7vw, 4.5rem)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '1.25rem' }}>
            Your Dream Event<br />
            <em className="shimmer">Awaits You</em>
          </h2>
          <div className="ornament" style={{ marginBottom: '1.75rem' }}><span style={{ color: 'var(--gold)' }}>✦</span></div>
          <p style={{ fontFamily: 'Outfit', color: 'rgba(13,10,11,0.5)', fontWeight: 300, lineHeight: 1.85, marginBottom: '2.5rem', fontSize: '0.92rem' }}>
            Let's create something extraordinary together. Every celebration deserves the touch of perfection.
          </p>

          <div className="cta-btns" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/booking" className="btn-gold">🎉 Book Your Event</Link>
            <a href="https://wa.me/916394352002?text=Hi!%20I%20would%20like%20to%20know%20more%20about%20your%20event%20management%20services." target="_blank" rel="noopener noreferrer" className="btn-outline-dark">
              📱 +91 63943 52002
            </a>
            <Link to="/contact" className="btn-outline-dark">Contact Us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}