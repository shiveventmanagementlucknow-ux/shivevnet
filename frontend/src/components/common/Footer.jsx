import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

const SocialIcon = ({ platform }) => {
  const icons = {
    instagram: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
    facebook: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    ),
    twitter: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
      </svg>
    ),
    youtube: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 11.75a29 29 0 0 0-.46-5.33z"></path>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
      </svg>
    ),
  };
  return icons[platform] || null;
};

export default function Footer() {
  const { settings } = useSettings();
  const s = settings || {};
  const social = s.socialLinks || {};

  const socialItems = [
    { key: 'instagram', url: social.instagram },
    { key: 'facebook', url: social.facebook },
    { key: 'twitter', url: social.twitter },
    { key: 'youtube', url: social.youtube },
  ].filter(item => item.url);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2 animate-fadeInUp">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md hover:scale-110 transition-transform duration-300">S</div>
              <span className="font-display text-xl font-bold text-white">{s.companyName ? <>{s.companyName.split(' ')[0]}<span className="text-primary-400">{' '}{s.companyName.split(' ').slice(1).join(' ')}</span></> : <>Shiv <span className="text-primary-400">Event Management</span></>}</span>
            </div>
            {s.tagline && <p className="text-gray-400 text-sm leading-relaxed max-w-xs">{s.tagline}</p>}
            {s.ownerName && <p className="text-gray-400 text-sm mt-2">Owner: <span className="font-semibold text-primary-400">{s.ownerName}</span></p>}
            {socialItems.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socialItems.map((item, idx) => (
                  <a key={item.key} href={item.url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-primary-600 hover:text-white flex items-center justify-center text-gray-400 text-xs transition-all duration-200 animate-fadeInUp hover:scale-105" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <SocialIcon platform={item.key} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="animate-fadeInUp">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/services', 'Services'], ['/portfolio', 'Portfolio'], ['/pricing', 'Pricing'], ['/blog', 'Blog']].map(([to, label], idx) => (
                <li key={to}><Link to={to} className="text-gray-400 hover:text-primary-400 text-sm transition-colors hover:translate-x-1 inline-block" style={{ animationDelay: `${idx * 0.05}s` }}>{label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="animate-fadeInUp">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {s.address && <li className="flex items-start gap-2 hover:text-primary-400 transition-colors"><span className="text-primary-400 mt-0.5">📍</span><span>{s.address}</span></li>}
              {s.phone && <li className="flex items-center gap-2 hover:text-primary-400 transition-colors"><span className="text-primary-400">📞</span><a href={`tel:${s.phone.replace(/\s/g, '')}`} className="hover:text-primary-400 transition-colors">{s.phone}</a></li>}
              {s.ownerPhone && <li className="flex items-center gap-2 hover:text-primary-400 transition-colors"><span className="text-primary-400">📱</span><a href={`tel:${s.ownerPhone.replace(/\s/g, '')}`} className="hover:text-primary-400 transition-colors">{s.ownerPhone}</a></li>}
              {s.email && <li className="flex items-center gap-2 hover:text-primary-400 transition-colors"><span className="text-primary-400">✉️</span><a href={`mailto:${s.email}`} className="hover:text-primary-400 transition-colors">{s.email}</a></li>}
            </ul>
            <a href="https://wa.me/916394352002?text=Hi!%20I%20would%20like%20to%20know%20more%20about%20your%20event%20management%20services." target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-xl text-sm transition-all duration-300 hover:scale-105">
              💬 WhatsApp Us
            </a>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 animate-fadeInUp">
          <p>© {new Date().getFullYear()} {s.companyName || 'Shiv Event Management'}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
