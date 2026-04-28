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
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const { user: clientUser, isLoggedIn, logout } = useUserAuth();
  const companyName = settings?.companyName || 'Shiv Event Management';
  const [profileOpen, setProfileOpen] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
    let ticking = false;
    const updateScroll = () => {
      setScrolled(window.scrollY > 20);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const navBg = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100'
    : 'bg-transparent';
  const textColor = scrolled || !isHome ? 'text-gray-700' : 'text-white';
  const logoColor = scrolled || !isHome ? 'text-gray-900' : 'text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg} animate-slideInDown`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-600/40 transition-all duration-300">
              {companyName[0]}
            </div>
            <span className={`font-display text-xl font-bold ${logoColor}`}>
              {companyName.split(' ')[0]}
              <span className="gradient-text">{companyName.split(' ').slice(1).join(' ')}</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 animate-fadeInDown">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${pathname === link.to
                  ? 'text-primary-600 bg-primary-50'
                  : `${textColor} hover:text-primary-600 hover:bg-gray-50`
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3 animate-fadeInDown">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
                    {clientUser?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={`text-sm font-medium max-w-[100px] truncate ${scrolled || !isHome ? 'text-gray-700' : 'text-white'}`}>
                    {clientUser?.name}
                  </span>
                  <span className="text-gray-400 text-xs">▾</span>
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50">
                        <p className="text-gray-900 text-sm font-medium truncate">{clientUser?.name}</p>
                        <p className="text-gray-500 text-xs truncate">{clientUser?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          👤 My Profile
                        </Link>
                        <Link
                          to="/booking"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          📅 Book Event
                        </Link>
                        <button
                          onClick={() => { logout(); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${textColor} hover:text-primary-600 hover:bg-gray-50 transition-all`}
                >
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm px-5 py-2.5">
                  Sign Up
                </Link>
              </>
            )}
            {/* ❌ Admin link intentionally removed — access /admin/login directly */}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2 ${textColor} rounded-lg hover:bg-gray-100 transition-colors`}
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 shadow-lg">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === link.to
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 mt-2 pt-2">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  👤 {clientUser?.name || 'Profile'}
                </Link>
                <Link to="/booking" className="btn-primary text-sm mt-1 justify-center">
                  Book Event
                </Link>
                <button
                  onClick={logout}
                  className="w-full mt-1 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 text-left"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm mt-1 justify-center">
                  Sign Up
                </Link>
              </>
            )}
            {/* ❌ Admin login link removed from mobile menu too */}
          </div>
        </div>
      )}
    </nav>
  );
}