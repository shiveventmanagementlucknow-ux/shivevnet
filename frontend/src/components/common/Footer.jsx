import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();
  const s = settings || {};
  const social = s.socialLinks || {};

  const socialItems = [
    { key: 'instagram', label: 'I', url: social.instagram },
    { key: 'facebook', label: 'F', url: social.facebook },
    { key: 'twitter', label: 'X', url: social.twitter },
    { key: 'youtube', label: 'Y', url: social.youtube },
  ].filter(item => item.url);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2 animate-fadeInUp">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md hover:scale-110 transition-transform duration-300">E</div>
              <span className="font-display text-xl font-bold text-white">{s.companyName ? <>{s.companyName.split(' ')[0]}<span className="text-primary-400">{' '}{s.companyName.split(' ').slice(1).join(' ')}</span></> : <>Event<span className="text-primary-400">Pro</span></>}</span>
            </div>
            {s.tagline && <p className="text-gray-400 text-sm leading-relaxed max-w-xs">{s.tagline}</p>}
            {s.ownerName && <p className="text-gray-400 text-sm mt-2">Owner: <span className="font-semibold text-primary-400">{s.ownerName}</span></p>}
            {socialItems.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socialItems.map((item, idx) => (
                  <a key={item.key} href={item.url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-primary-600 hover:text-white flex items-center justify-center text-gray-400 text-xs transition-all duration-200 animate-fadeInUp hover:scale-105" style={{ animationDelay: `${idx * 0.1}s` }}>{item.label}</a>
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
            {s.whatsapp && (
              <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-xl text-sm transition-all duration-300 hover:scale-105">
                💬 WhatsApp Us
              </a>
            )}
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 animate-fadeInUp">
          <p>© {new Date().getFullYear()} {s.companyName || 'Shiv Event Management'}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
