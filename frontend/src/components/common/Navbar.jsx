import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useUserAuth } from '../../context/UserAuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const { user: clientUser, isLoggedIn, logout } = useUserAuth();
  const companyName = settings?.companyName || 'Shiv Event Management';
  const isHome = pathname === '/';

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrolled(window.scrollY > 30); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setProfileOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isTransparent = isHome && !scrolled;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Outfit:wght@300;400;500;600&display=swap');
        html, body { overflow-x: hidden; max-width: 100vw; }
        :root {
          --gold: #C9A84C; --gold-light: #E8C97A; --gold-dark: #8B6914;
          --ivory: #FAF7F0; --ink: #0D0A0B; --ink-soft: #1A1612;
        }

        .nav-root {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .nav-root.scrolled {
          background: rgba(250,247,240,0.97);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(201,168,76,0.2);
          box-shadow: 0 4px 24px rgba(13,10,11,0.06);
        }
        .nav-root.transparent { background: transparent; border-bottom: 1px solid transparent; }

        .nav-link {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none;
          padding: 0.5rem 1rem;
          transition: color 0.3s ease;
          position: relative;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 50%; right: 50%;
          height: 1px; background: var(--gold);
          transition: left 0.3s ease, right 0.3s ease;
        }
        .nav-link:hover::after, .nav-link.active::after { left: 1rem; right: 1rem; }
        .nav-link.light { color: rgba(250,247,240,0.75); }
        .nav-link.light:hover, .nav-link.light.active { color: var(--gold-light); }
        .nav-link.dark { color: rgba(13,10,11,0.55); }
        .nav-link.dark:hover, .nav-link.dark.active { color: var(--gold-dark); }

        .nav-btn-outline {
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          text-decoration: none;
          padding: 0.55rem 1.4rem;
          border: 1px solid; cursor: pointer;
          transition: all 0.3s ease; background: transparent;
        }
        .nav-btn-outline.light {
          color: rgba(250,247,240,0.85);
          border-color: rgba(250,247,240,0.35);
        }
        .nav-btn-outline.light:hover {
          color: var(--gold-light); border-color: var(--gold);
          background: rgba(201,168,76,0.08);
        }
        .nav-btn-outline.dark {
          color: rgba(13,10,11,0.65);
          border-color: rgba(13,10,11,0.25);
        }
        .nav-btn-outline.dark:hover {
          color: var(--gold-dark); border-color: var(--gold);
          background: rgba(201,168,76,0.06);
        }

        .nav-btn-gold {
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          text-decoration: none;
          padding: 0.55rem 1.4rem;
          background: var(--gold); color: var(--ink);
          border: 1px solid var(--gold); cursor: pointer;
          transition: all 0.3s ease;
        }
        .nav-btn-gold:hover {
          background: var(--gold-light);
          box-shadow: 0 6px 20px rgba(201,168,76,0.3);
        }

        /* Hamburger */
        .hamburger { background: none; border: none; cursor: pointer; padding: 0.5rem; display: flex; flex-direction: column; gap: 5px; }
        .hamburger span {
          display: block; width: 22px; height: 1.5px;
          background: currentColor;
          transition: all 0.3s ease; transform-origin: center;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* Mobile drawer */
        .mobile-backdrop {
          position: fixed; inset: 0;
          background: rgba(13,10,11,0.6);
          backdrop-filter: blur(4px);
          z-index: 60;
          transition: opacity 0.35s ease;
        }
        .mobile-drawer {
          position: fixed; top: 0; right: 0;
          height: 100dvh; width: min(300px, 85vw);
          max-width: 100vw;
          background: var(--ink);
          z-index: 70;
          transform: translateX(110%);
          will-change: transform;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .mobile-drawer.open { transform: translateX(0); }
        .drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 1.75rem;
          border-bottom: 1px solid rgba(201,168,76,0.12);
        }
        .drawer-close {
          background: none; border: none; cursor: pointer;
          width: 36px; height: 36px;
          border: 1px solid rgba(201,168,76,0.2);
          color: rgba(250,247,240,0.5);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        .drawer-close:hover { color: var(--gold); border-color: var(--gold); }

        .drawer-links { flex: 1; overflow-y: auto; padding: 2rem 1.75rem; display: flex; flex-direction: column; gap: 0.25rem; }

        .drawer-link {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          text-decoration: none;
          padding: 0.9rem 0;
          color: rgba(250,247,240,0.5);
          border-bottom: 1px solid rgba(201,168,76,0.07);
          display: flex; align-items: center; justify-content: space-between;
          transition: color 0.3s ease;
        }
        .drawer-link:hover, .drawer-link.active { color: var(--gold); }
        .drawer-link .arrow { opacity: 0; transform: translateX(-4px); transition: all 0.3s ease; font-size: 0.6rem; }
        .drawer-link:hover .arrow, .drawer-link.active .arrow { opacity: 1; transform: translateX(0); }

        .drawer-footer {
          padding: 1.5rem 1.75rem 2rem;
          border-top: 1px solid rgba(201,168,76,0.12);
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .drawer-btn-outline {
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase; text-decoration: none; text-align: center;
          padding: 0.85rem; border: 1px solid rgba(201,168,76,0.3);
          color: rgba(250,247,240,0.6); background: transparent;
          transition: all 0.3s ease; cursor: pointer;
        }
        .drawer-btn-outline:hover { color: var(--gold); border-color: var(--gold); background: rgba(201,168,76,0.05); }
        .drawer-btn-gold {
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase; text-decoration: none; text-align: center;
          padding: 0.85rem; background: var(--gold); color: var(--ink);
          border: 1px solid var(--gold); transition: all 0.3s ease; cursor: pointer;
          display: block;
        }
        .drawer-btn-gold:hover { background: var(--gold-light); }
        .drawer-btn-danger {
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 0.85rem; border: none; background: transparent;
          color: rgba(220,80,80,0.6); cursor: pointer;
          transition: color 0.3s ease; text-align: center; width: 100%;
        }
        .drawer-btn-danger:hover { color: #e05555; }

        /* Profile dropdown */
        .profile-dropdown {
          position: absolute; right: 0; top: calc(100% + 0.5rem);
          width: 220px;
          background: var(--ivory);
          border: 1px solid rgba(201,168,76,0.2);
          box-shadow: 0 16px 40px rgba(13,10,11,0.12);
          z-index: 100;
        }
        .profile-dropdown-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(201,168,76,0.12);
          background: rgba(201,168,76,0.04);
        }
        .profile-dropdown a, .profile-dropdown button {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.75rem 1.25rem; width: 100%;
          font-family: 'Outfit', sans-serif; font-size: 0.75rem;
          font-weight: 400; letter-spacing: 0.05em;
          color: rgba(13,10,11,0.65); text-decoration: none;
          background: none; border: none; cursor: pointer; text-align: left;
          transition: all 0.2s ease;
        }
        .profile-dropdown a:hover { color: var(--gold-dark); background: rgba(201,168,76,0.05); }
        .profile-dropdown button:hover { color: #c0392b; background: rgba(192,57,43,0.05); }

        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
          .nav-desktop-auth { display: none !important; }
        }
        @media (min-width: 768px) {
          .nav-mobile-hamburger { display: none !important; }
        }
      `}</style>

      <nav className={`nav-root ${isTransparent ? 'transparent' : 'scrolled'}`}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>

            {/* ── Logo ── */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cormorant Garamond, serif', fontWeight: 600,
                fontSize: '1.1rem', color: 'var(--ink)',
              }}>
                {companyName[0]}
              </div>
              <span style={{
                fontFamily: 'Cormorant Garamond, serif', fontWeight: 600,
                fontSize: '1.15rem', letterSpacing: '0.02em',
                color: isTransparent ? '#fff' : 'var(--ink)',
                transition: 'color 0.4s ease',
              }}>
                {companyName.split(' ')[0]}
                <span style={{ color: isTransparent ? 'var(--gold-light)' : 'var(--gold-dark)' }}>
                  {' '}{companyName.split(' ').slice(1).join(' ')}
                </span>
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${pathname === link.to ? 'active' : ''} ${isTransparent ? 'light' : 'dark'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Desktop Auth ── */}
            <div className="nav-desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {isLoggedIn ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '0.4rem 0.75rem',
                      borderBottom: `1px solid ${isTransparent ? 'rgba(250,247,240,0.2)' : 'rgba(201,168,76,0.2)'}`,
                      transition: 'border-color 0.3s ease',
                    }}
                  >
                    <div style={{
                      width: '28px', height: '28px',
                      background: 'var(--gold)', color: 'var(--ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Outfit', fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {clientUser?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{
                      fontFamily: 'Outfit', fontSize: '0.72rem', fontWeight: 500,
                      letterSpacing: '0.08em', maxWidth: '90px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: isTransparent ? 'rgba(250,247,240,0.8)' : 'rgba(13,10,11,0.65)',
                      transition: 'color 0.4s ease',
                    }}>
                      {clientUser?.name}
                    </span>
                    <span style={{ color: isTransparent ? 'rgba(201,168,76,0.7)' : 'var(--gold)', fontSize: '0.55rem' }}>▾</span>
                  </button>

                  {profileOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setProfileOpen(false)} />
                      <div className="profile-dropdown">
                        <div className="profile-dropdown-header">
                          <p style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.2rem' }}>
                            {clientUser?.name}
                          </p>
                          <p style={{ fontFamily: 'Outfit', fontSize: '0.7rem', fontWeight: 300, color: 'rgba(13,10,11,0.45)' }}>
                            {clientUser?.email}
                          </p>
                        </div>
                        <Link to="/profile" onClick={() => setProfileOpen(false)}>👤 My Profile</Link>
                        <Link to="/booking" onClick={() => setProfileOpen(false)}>📅 Book Event</Link>
                        <button onClick={() => { logout(); setProfileOpen(false); }} style={{ color: '#c0392b !important' }}>
                          🚪 Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className={`nav-btn-outline ${isTransparent ? 'light' : 'dark'}`}>
                    Login
                  </Link>
                  <Link to="/signup" className="nav-btn-gold">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              className={`hamburger nav-mobile-hamburger ${open ? 'open' : ''}`}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              style={{ color: isTransparent ? '#fff' : 'var(--ink)' }}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Backdrop ── */}
      {open && (
        <div
          className="mobile-backdrop"
          style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <div className={`mobile-drawer ${open ? 'open' : ''}`}>

        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '30px', height: '30px',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Cormorant Garamond', fontWeight: 600, fontSize: '1rem', color: 'var(--ink)',
            }}>
              {companyName[0]}
            </div>
            <span style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 600,
              color: 'var(--ivory)', letterSpacing: '0.03em',
            }}>
              {companyName.split(' ')[0]}
              <span style={{ color: 'var(--gold)' }}>{' '}{companyName.split(' ').slice(1).join(' ')}</span>
            </span>
          </div>
          <button className="drawer-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* Links */}
        <div className="drawer-links">
          {/* Eyebrow */}
          <p style={{
            fontFamily: 'Outfit', fontSize: '0.58rem', letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'rgba(201,168,76,0.45)',
            marginBottom: '0.75rem', fontWeight: 500,
          }}>Navigation</p>

          {links.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`drawer-link ${pathname === link.to ? 'active' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {link.label}
              <span className="arrow">✦</span>
            </Link>
          ))}

          {/* Logged in user info */}
          {isLoggedIn && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', background: 'var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)',
                }}>
                  {clientUser?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 500, color: 'var(--ivory)', marginBottom: '0.15rem' }}>
                    {clientUser?.name}
                  </p>
                  <p style={{ fontFamily: 'Outfit', fontSize: '0.65rem', fontWeight: 300, color: 'rgba(250,247,240,0.4)' }}>
                    {clientUser?.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="drawer-footer">
          {isLoggedIn ? (
            <>
              <Link to="/profile" onClick={() => setOpen(false)} className="drawer-btn-outline">
                👤 My Profile
              </Link>
              <Link to="/booking" onClick={() => setOpen(false)} className="drawer-btn-gold">
                📅 Book Your Event
              </Link>
              <button onClick={() => { logout(); setOpen(false); }} className="drawer-btn-danger">
                🚪 Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="drawer-btn-outline">
                Login
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="drawer-btn-gold">
                Sign Up
              </Link>
            </>
          )}

          {/* Bottom tagline */}
          <p style={{
            fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
            fontSize: '0.8rem', fontWeight: 300,
            color: 'rgba(201,168,76,0.3)', textAlign: 'center',
            marginTop: '0.5rem',
          }}>
            Where Every Moment Becomes Legacy
          </p>
        </div>
      </div>
    </>
  );
}