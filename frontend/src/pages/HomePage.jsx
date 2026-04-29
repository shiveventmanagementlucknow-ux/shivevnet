import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { testimonialAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

/* ─── Parallax ──────────────────────────────────────────────────────── */
function useParallax(factor = 0.15) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * factor);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [factor]);
  return offset;
}

/* ─── Counter ───────────────────────────────────────────────────────── */
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

/* ─── Cursor Glow ───────────────────────────────────────────────────── */
function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div
      style={{
        pointerEvents: 'none', position: 'fixed',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        left: pos.x, top: pos.y,
        zIndex: 9999,
        transition: 'left 0.12s ease, top 0.12s ease',
      }}
      aria-hidden="true"
    />
  );
}

/* ─── Shared Button Styles ──────────────────────────────────────────── */
const btnBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: '0.5rem', minWidth: '180px', padding: '1rem 2.5rem',
  fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: '0.8rem',
  letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none',
  whiteSpace: 'nowrap', boxSizing: 'border-box', cursor: 'pointer',
  transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
};
const goldBtnStyle = { ...btnBase, background: 'var(--gold)', color: 'var(--ink)', border: '1px solid var(--gold)' };
const outlineBtnStyle = { ...btnBase, background: 'transparent', color: 'var(--ivory)', border: '1px solid rgba(201,168,76,0.6)' };

const hoverGold = (e) => { e.currentTarget.style.background = 'var(--gold-light)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,168,76,0.35)'; };
const leaveGold = (e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.boxShadow = 'none'; };
const hoverOutline = (e) => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold-light)'; };
const leaveOutline = (e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)'; e.currentTarget.style.color = 'var(--ivory)'; };

/* ─── Feature Cards Data ────────────────────────────────────────────── */
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
  const { settings } = useSettings();
  const heroOffset = useParallax(0.2);

  const slides = settings?.heroSlides?.length > 0 ? settings.heroSlides : [];
  const stats = settings?.stats || {};
  const hasStats = stats.eventsCompleted || stats.clientSatisfaction || stats.yearsExperience || stats.teamMembers;

  /* Slide auto-advance */
  useEffect(() => {
    if (slides.length > 1) {
      intervalRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 6000);
      return () => clearInterval(intervalRef.current);
    }
  }, [slides.length]);

  /* Testimonials fetch */
  useEffect(() => {
    testimonialAPI.getAll()
      .then(r => setTestimonials(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => { })
      .finally(() => setLoadingT(false));
  }, []);

  /* Testimonials auto-rotate */
  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => setActiveT(c => (c + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
        :root {
          --gold: #C9A84C; --gold-light: #E8C97A; --gold-dark: #8B6914;
          --ivory: #FAF7F0; --ink: #0D0A0B; --ink-soft: #1A1612; --cream: #F5EDD8;
        }
        * { box-sizing: border-box; }
        body { background: var(--ivory); }

        .section-eyebrow {
          font-family: 'Outfit', sans-serif; font-size: 0.68rem;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--gold); font-weight: 500;
        }
        .ornament {
          display: flex; align-items: center; gap: 1rem;
          justify-content: center; margin: 1rem 0;
        }
        .ornament::before, .ornament::after {
          content: ''; flex: 1; max-width: 80px; height: 1px;
        }
        .ornament::before { background: linear-gradient(90deg, transparent, var(--gold)); }
        .ornament::after  { background: linear-gradient(90deg, var(--gold), transparent); }
        .gold-shimmer {
          background: linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .gold-line {
          display: inline-block; width: 60px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          vertical-align: middle;
        }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .d1{animation-delay:.1s} .d2{animation-delay:.2s} .d3{animation-delay:.3s} .d4{animation-delay:.4s}
      `}</style>

      <CursorGlow />
      <Helmet>
        <title>{settings?.metaTitle || 'Shiv Event Management – Luxury Events'}</title>
        <meta name="description" content={settings?.metaDescription || "India's most trusted luxury event management company."} />
      </Helmet>
      <Navbar />

      {/* ════════════════════════ HERO ════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: 'var(--ink)' }}>
        {/* Slides */}
        {slides.map((slide, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            opacity: i === current ? 1 : 0,
            transform: i === current ? 'scale(1)' : 'scale(1.05)',
            transition: 'opacity 1.2s ease, transform 1.2s ease',
            zIndex: i === current ? 10 : 0,
          }}>
            <img src={slide.image} alt={slide.title} loading={i === 0 ? 'eager' : 'lazy'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${heroOffset}px)` }}
              onError={e => { e.target.src = 'https://placehold.co/1920x1080/0D0A0B/C9A84C?text=Shiv+Events'; }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.82) 100%)' }} />
          </div>
        ))}

        {/* Fallback */}
        {slides.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0D0A0B, #1A0F0A, #0A0D0F)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.09) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(139,26,43,0.06) 0%, transparent 60%)' }} />
          </div>
        )}

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 20, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
          <p className="section-eyebrow animate-fade-up" style={{ marginBottom: '1.5rem' }}>
            <span className="gold-line" style={{ marginRight: '0.75rem' }} />
            Est. 2015 · Varanasi, India
            <span className="gold-line" style={{ marginLeft: '0.75rem' }} />
          </p>

          <h1 className="animate-fade-up d1" style={{
            fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#fff',
            fontSize: 'clamp(3rem, 10vw, 7.5rem)', lineHeight: 1,
            letterSpacing: '-0.01em', marginBottom: '1.5rem',
            textShadow: '0 4px 40px rgba(0,0,0,0.5)',
          }}>
            {slides[current]?.title || settings?.companyName || 'Shiv Events'}
          </h1>

          <div className="ornament animate-fade-up d2">
            <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>✦</span>
          </div>

          <p className="animate-fade-up d3" style={{
            fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300,
            color: 'rgba(255,255,255,0.78)', lineHeight: 1.6,
            fontSize: 'clamp(1.1rem, 3vw, 1.8rem)', maxWidth: '640px', marginBottom: '3rem',
          }}>
            {slides[current]?.subtitle || settings?.tagline || 'Where Every Moment Becomes Legacy'}
          </p>

          <div className="animate-fade-up d4" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/booking" style={goldBtnStyle} onMouseEnter={hoverGold} onMouseLeave={leaveGold}>
              Book Your Event →
            </Link>
            <Link to="/portfolio" style={outlineBtnStyle} onMouseEnter={hoverOutline} onMouseLeave={leaveOutline}>
              View Portfolio
            </Link>
            <a href="https://wa.me/916394352002" target="_blank" rel="noopener noreferrer"
              style={{ ...outlineBtnStyle, borderColor: 'rgba(37,211,102,0.5)', color: '#25D366' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.1)'; e.currentTarget.style.borderColor = '#25D366'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.5)'; }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Slide dots */}
        {slides.length > 1 && (
          <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: '0.5rem' }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: i === current ? '32px' : '6px', height: '6px', borderRadius: '3px',
                background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        )}

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.55 }}>
          <span style={{ fontFamily: 'Outfit', fontSize: '0.58rem', letterSpacing: '0.22em', color: 'var(--gold)', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--gold), transparent)' }} />
        </div>
      </section>

      {/* ════════════════════════ STATS ═══════════════════════════════ */}
      {hasStats && (
        <section style={{ background: 'var(--ink-soft)', borderTop: '1px solid rgba(201,168,76,0.15)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
          <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {[
              { val: stats.eventsCompleted, label: 'Events Completed' },
              { val: stats.clientSatisfaction, label: 'Client Satisfaction' },
              { val: stats.yearsExperience, label: 'Years of Mastery' },
              { val: stats.teamMembers, label: 'Expert Artisans' },
            ].filter(s => s.val).map((s, i, arr) => (
              <div key={i} style={{ padding: '3rem 2rem', textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid rgba(201,168,76,0.12)' : 'none' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 4vw, 3rem)', color: 'var(--gold)', fontWeight: 600, marginBottom: '0.4rem' }}>
                  <AnimatedCounter target={s.val} />
                </div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.45)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════ WHY US — Feature Grid ═══════════════ */}
      <section style={{ background: 'var(--ivory)', padding: '7rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <p className="section-eyebrow" style={{ marginBottom: '1rem' }}>Why Choose Us</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '1rem' }}>
              The Art of Flawless <em style={{ color: 'var(--gold-dark)' }}>Celebrations</em>
            </h2>
            <div className="ornament"><span style={{ color: 'var(--gold)' }}>✦</span></div>
            {settings?.aboutText && (
              <p style={{ fontFamily: 'Outfit', color: '#666', lineHeight: 1.9, fontWeight: 300, maxWidth: '580px', margin: '1.5rem auto 0', fontSize: '0.95rem' }}>
                {settings.aboutText}
              </p>
            )}
          </div>

          {/* 6-card grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            {features.map((f, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  padding: '2.5rem 2rem',
                  background: hoveredFeature === i ? 'var(--ink)' : '#fff',
                  border: `1px solid ${hoveredFeature === i ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.12)'}`,
                  borderRadius: '2px',
                  transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                  transform: hoveredFeature === i ? 'translateY(-6px)' : 'none',
                  boxShadow: hoveredFeature === i ? '0 24px 48px rgba(0,0,0,0.09)' : 'none',
                  cursor: 'default',
                }}>
                <div style={{ fontSize: '2rem', marginBottom: '1.25rem' }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600,
                  color: hoveredFeature === i ? 'var(--gold)' : 'var(--ink)',
                  marginBottom: '0.75rem', transition: 'color 0.3s ease',
                }}>{f.title}</h3>
                <p style={{
                  fontFamily: 'Outfit', fontSize: '0.875rem', lineHeight: 1.75, fontWeight: 300,
                  color: hoveredFeature === i ? 'rgba(250,247,240,0.65)' : '#777',
                  transition: 'color 0.3s ease',
                }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/booking" style={goldBtnStyle} onMouseEnter={hoverGold} onMouseLeave={leaveGold}>
              ✨ Get a Free Quote
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════ TESTIMONIALS ════════════════════════ */}
      <section style={{ background: 'var(--ink)', padding: '7rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: '64rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p className="section-eyebrow" style={{ marginBottom: '1rem' }}>Client Stories</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#fff', lineHeight: 1.2 }}>
              Voices of Our <em className="gold-shimmer">Happy Patrons</em>
            </h2>
            <div className="ornament"><span style={{ color: 'var(--gold)' }}>✦</span></div>
          </div>

          {loadingT ? (
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3].map(i => <div key={i} style={{ width: '300px', height: '180px', background: 'rgba(201,168,76,0.05)', borderRadius: '2px' }} />)}
            </div>
          ) : testimonials.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'rgba(250,247,240,0.4)', fontFamily: 'Outfit' }}>No testimonials yet.</p>
          ) : (
            <>
              {/* Active quote card */}
              <div style={{ position: 'relative', minHeight: '280px', marginBottom: '2.5rem' }}>
                {testimonials.map((t, i) => (
                  <div key={t._id} style={{
                    position: 'absolute', width: '100%',
                    opacity: i === activeT ? 1 : 0,
                    transform: i === activeT ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.7s ease, transform 0.7s ease',
                    pointerEvents: i === activeT ? 'auto' : 'none',
                  }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.15)',
                      borderRadius: '2px', padding: 'clamp(1.5rem, 4vw, 3rem)',
                      maxWidth: '720px', margin: '0 auto', textAlign: 'center',
                    }}>
                      {/* Decorative quote mark */}
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '5rem', lineHeight: 0.6, color: 'rgba(201,168,76,0.15)', marginBottom: '1.5rem', userSelect: 'none' }}>"</div>

                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.1rem, 2.5vw, 1.45rem)', fontStyle: 'italic', color: 'rgba(250,247,240,0.88)', lineHeight: 1.85, fontWeight: 300, marginBottom: '2rem' }}>
                        {t.text}
                      </p>

                      {/* Stars */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', marginBottom: '1.25rem' }}>
                        {[...Array(t.rating || 5)].map((_, j) => <span key={j} style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>★</span>)}
                      </div>

                      <div style={{ width: '40px', height: '1px', background: 'var(--gold)', margin: '0 auto 1rem' }} />

                      <div style={{ fontFamily: 'Outfit', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>
                        {t.name}
                      </div>
                      {t.role && (
                        <div style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: 'rgba(250,247,240,0.4)', marginTop: '0.25rem', letterSpacing: '0.1em' }}>
                          {t.role}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Name thumbnail strip */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                {testimonials.map((t, i) => (
                  <button key={i} onClick={() => setActiveT(i)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.55rem',
                    padding: '0.45rem 0.9rem',
                    background: i === activeT ? 'rgba(201,168,76,0.12)' : 'transparent',
                    border: `1px solid ${i === activeT ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.12)'}`,
                    borderRadius: '2px', cursor: 'pointer', transition: 'all 0.3s ease',
                  }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: i === activeT ? 'var(--gold)' : 'rgba(201,168,76,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Outfit', fontSize: '0.68rem', fontWeight: 700,
                      color: i === activeT ? 'var(--ink)' : 'var(--gold)',
                      transition: 'all 0.3s ease',
                    }}>
                      {t.name[0].toUpperCase()}
                    </div>
                    <span style={{
                      fontFamily: 'Outfit', fontSize: '0.68rem', letterSpacing: '0.1em',
                      color: i === activeT ? 'var(--gold)' : 'rgba(250,247,240,0.4)',
                      transition: 'color 0.3s ease',
                    }}>
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ════════════════════════ CTA ═════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', padding: '7rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p className="section-eyebrow" style={{ marginBottom: '1.5rem' }}>Begin Your Story</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Your Dream Event<br />
            <em className="gold-shimmer">Awaits You</em>
          </h2>
          <div className="ornament" style={{ marginBottom: '2rem' }}><span style={{ color: 'var(--gold)' }}>✦</span></div>
          <p style={{ fontFamily: 'Outfit', color: 'rgba(13,10,11,0.55)', fontWeight: 300, lineHeight: 1.85, marginBottom: '3rem', fontSize: '0.95rem' }}>
            Let's create something extraordinary together. Every celebration deserves the touch of perfection.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/booking" style={goldBtnStyle} onMouseEnter={hoverGold} onMouseLeave={leaveGold}>
              🎉 Book Your Event
            </Link>
            <a href="https://wa.me/916394352002" target="_blank" rel="noopener noreferrer"
              style={{ ...outlineBtnStyle, color: 'var(--ink)', borderColor: 'rgba(13,10,11,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--ink)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'rgba(13,10,11,0.3)'; }}>
              📱 +91 63943 52002
            </a>
            <Link to="/contact"
              style={{ ...outlineBtnStyle, color: 'var(--ink)', borderColor: 'rgba(13,10,11,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--ink)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'rgba(13,10,11,0.3)'; }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}