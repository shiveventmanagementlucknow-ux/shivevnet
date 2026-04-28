import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { serviceAPI, testimonialAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function HomePage() {
  const [current, setCurrent] = useState(0);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const intervalRef = useRef(null);
  const { settings } = useSettings();

  const slides = settings?.heroSlides?.length > 0 ? settings.heroSlides : [];
  const stats = settings?.stats || {};
  const hasStats = stats.eventsCompleted || stats.clientSatisfaction || stats.yearsExperience || stats.teamMembers;

  useEffect(() => {
    if (slides.length > 1) {
      intervalRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
      return () => clearInterval(intervalRef.current);
    }
  }, [slides.length]);

  useEffect(() => {
    serviceAPI.getAll()
      .then(r => setServices(Array.isArray(r.data?.data) ? r.data.data.slice(0, 6) : []))
      .catch(() => { })
      .finally(() => setLoadingServices(false));
    testimonialAPI.getAll()
      .then(r => setTestimonials(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => { })
      .finally(() => setLoadingTestimonials(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>{settings?.metaTitle || 'Shiv Event Management – Premium Event Management'}</title>
        <meta name="description" content={settings?.metaDescription || 'India\'s trusted event management company. Book your dream event today.'} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-gray-900">
        {/* Falling Stars Effect */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animation: `fallingStar ${Math.random() * 5 + 5}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.7 + 0.3,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px #fff, 0 0 ${Math.random() * 20 + 10}px #e0e7ff`
              }}
            />
          ))}
          <style>{`@keyframes fallingStar { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 10% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(100vh) scale(1.5); opacity: 0; } }`}</style>
        </div>

        {slides.length > 0 ? (
          <>
            {slides.map((slide, i) => (
              <div key={i} className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ease-in-out ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <img src={slide.image} alt={slide.title} className={`w-full h-full object-cover transform-gpu will-change-transform transition-transform duration-[8000ms] ease-in-out ${i === current ? 'scale-110' : 'scale-100'}`} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/1920x1080/1a1a2e/4338ca?text=Shiv+Events'; }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none" />
              </div>
            ))}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 animate-fadeInUp">
              {/* <span className="inline-block px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6 animate-slideInDown">
                ✨ {slides[current]?.tag}
              </span> */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl animate-fadeInUp tracking-wide" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>
                {slides[current]?.title}
              </h1>
              <p className="text-white/90 text-xl md:text-3xl mb-12 max-w-3xl animate-fadeInUp font-light" style={{ fontFamily: "'Playfair Display', serif", animationDelay: '0.1s' }}>{slides[current]?.subtitle}</p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <Link to="/booking" className="btn-primary text-base px-8 py-4 shadow-xl">🎉 Book Your Event</Link>
                <a href="https://wa.me/916394352002" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#128C7E] transition-all shadow-xl">📱 +91 63943 52002</a>
                <Link to="/portfolio" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-xl hover:bg-white/30 transition-all hidden md:inline-flex">View Our Work</Link>
              </div>
            </div>
            {slides.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="relative h-full bg-gradient-to-br from-gray-900 via-primary-900 to-purple-900 flex flex-col items-center justify-center text-center px-4 animate-blur-in overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            <h1 className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-wide animate-fadeInDown drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-200 to-white" style={{ fontFamily: "'Cinzel', serif" }}>
              {settings?.companyName || 'Shiv Event Management'}
            </h1>
            <p className="relative z-10 text-white/90 text-xl md:text-3xl mb-12 font-light tracking-wide animate-fadeInUp" style={{ fontFamily: "'Playfair Display', serif" }}>{settings?.tagline || 'Premium Event Management'}</p>
            <div className="relative z-10 flex flex-col sm:flex-row flex-wrap justify-center gap-5 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <Link to="/booking" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:shadow-xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300">🎉 Book Your Event</Link>
              <a href="https://wa.me/916394352002" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white font-bold rounded-xl shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:-translate-y-1 transition-all duration-300">📱 +91 63943 52002</a>
              <Link to="/portfolio" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 hidden md:inline-flex">View Our Work</Link>
            </div>
          </div>
        )}
      </section>

      {/* Stats */}
      {hasStats && (
        <section className="relative py-20 overflow-hidden animate-blur-in">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gray-900" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-purple-900/90 to-pink-900/90" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/40 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative z-10">
            {stats.eventsCompleted && (
              <div className="card p-6 md:p-8 bg-white/10 backdrop-blur-xl border border-white/20 text-center hover:-translate-y-3 hover:bg-white/20 transition-all duration-500 group shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] animate-fadeInUp">
                <div className="font-display text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">{stats.eventsCompleted}</div>
                <div className="text-white/80 text-xs md:text-sm font-bold mt-4 tracking-widest uppercase group-hover:text-white transition-colors">Events Completed</div>
              </div>
            )}
            {stats.clientSatisfaction && (
              <div className="card p-6 md:p-8 bg-white/10 backdrop-blur-xl border border-white/20 text-center hover:-translate-y-3 hover:bg-white/20 transition-all duration-500 group shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <div className="font-display text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-300 to-rose-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(251,113,133,0.5)]">{stats.clientSatisfaction}</div>
                <div className="text-white/80 text-xs md:text-sm font-bold mt-4 tracking-widest uppercase group-hover:text-white transition-colors">Client Satisfaction</div>
              </div>
            )}
            {stats.yearsExperience && (
              <div className="card p-6 md:p-8 bg-white/10 backdrop-blur-xl border border-white/20 text-center hover:-translate-y-3 hover:bg-white/20 transition-all duration-500 group shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="font-display text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-orange-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]">{stats.yearsExperience}</div>
                <div className="text-white/80 text-xs md:text-sm font-bold mt-4 tracking-widest uppercase group-hover:text-white transition-colors">Years Experience</div>
              </div>
            )}
            {stats.teamMembers && (
              <div className="card p-6 md:p-8 bg-white/10 backdrop-blur-xl border border-white/20 text-center hover:-translate-y-3 hover:bg-white/20 transition-all duration-500 group shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <div className="font-display text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-teal-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">{stats.teamMembers}</div>
                <div className="text-white/80 text-xs md:text-sm font-bold mt-4 tracking-widest uppercase group-hover:text-white transition-colors">Expert Team Members</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 animate-fadeInUp">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[150px] pointer-events-none -translate-y-1/3 translate-x-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px] pointer-events-none translate-y-1/3 -translate-x-1/3 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block py-1.5 px-5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-black uppercase tracking-widest mb-4 animate-fadeInUp shadow-lg drop-shadow-md">What We Do</span>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fadeInUp drop-shadow-2xl" style={{ fontFamily: "'Cinzel', serif", animationDelay: '0.1s' }}>Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-yellow-300">Services</span></h2>
            <p className="text-indigo-100 text-xl md:text-2xl max-w-3xl mx-auto animate-fadeInUp font-light drop-shadow-md" style={{ fontFamily: "'Playfair Display', serif", animationDelay: '0.2s' }}>From intimate gatherings to grand spectacles, we handle every detail with precision, creativity, and a splash of magic.</p>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <div key={i} className="h-64 animate-pulse bg-white/10 rounded-3xl backdrop-blur-md border border-white/20" />)}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((s, idx) => (
                <Link key={s._id} to={`/services/${s.slug}`}
                  className="group relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-500 hover:-translate-y-3 animate-fadeInUp flex flex-col overflow-hidden border border-white/20 hover:border-pink-300/50"
                  style={{ animationDelay: `${idx * 0.1}s` }}>

                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

                  {s.image ? (
                    <div className="h-52 overflow-hidden relative shrink-0 z-10">
                      <div className="absolute inset-0 bg-indigo-900/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
                      <img src={s.image} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { e.target.style.display = 'none'; }} />
                      <div className="absolute top-4 left-4 w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-3xl shadow-2xl border border-white/40 z-20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">{s.icon || '🎉'}</div>
                    </div>
                  ) : (
                    <div className="p-8 pb-0 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl border border-white/30 text-white">{s.icon || '🎉'}</div>
                    </div>
                  )}

                  <div className="p-8 flex flex-col flex-1 relative z-10">
                    <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors drop-shadow-md" style={{ fontFamily: "'Cinzel', serif" }}>{s.title}</h3>
                    <p className="text-indigo-100/90 text-lg leading-relaxed flex-1" style={{ fontFamily: "'Playfair Display', serif" }}>{s.shortDescription || s.description?.slice(0, 100)}</p>

                    <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between group-hover:border-pink-300/30 transition-colors">
                      <span className="text-pink-300 font-bold text-sm tracking-wider uppercase transition-colors">Explore Service</span>
                      <span className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-500 transform group-hover:translate-x-2 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] border border-white/20 text-xl">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-indigo-200 text-xl py-12 animate-fadeInUp" style={{ fontFamily: "'Playfair Display', serif" }}>No magical services available yet. Check back soon!</div>
          )}
          {services.length > 0 && (
            <div className="text-center mt-16">
              <Link to="/services" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_50px_rgba(236,72,153,0.7)] border border-pink-400/50 hover:-translate-y-2 transition-all duration-300 animate-fadeInUp group text-lg tracking-wide" style={{ fontFamily: "'Cinzel', serif", animationDelay: '0.3s' }}>
                Explore All Services
                <span className="group-hover:translate-x-2 transition-transform text-2xl leading-none">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Us */}
      {settings?.aboutText && (
        <section className="py-24 bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 animate-blur-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
          <div className="absolute top-10 left-10 w-96 h-96 bg-white/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300/30 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fadeInLeft">
                <p className="text-rose-100 text-sm font-black uppercase tracking-widest mb-3 animate-fadeInUp drop-shadow-md">Why Choose Us</p>
                <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>Events That <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">Exceed</span> Expectations</h2>
                <p className="text-white/90 leading-relaxed mb-10 text-xl md:text-2xl animate-fadeInUp drop-shadow-md font-light" style={{ fontFamily: "'Playfair Display', serif" }}>{settings.aboutText}</p>
                <Link to="/booking" className="bg-white text-rose-600 font-bold px-10 py-5 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] hover:-translate-y-2 transition-all duration-300 mt-2 inline-flex animate-fadeInUp text-lg tracking-wide" style={{ fontFamily: "'Cinzel', serif", animationDelay: '0.2s' }}>✨ Get a Free Quote</Link>
              </div>
              <div className="grid grid-cols-2 gap-4 animate-fadeInRight">
                <div className="rounded-3xl h-48 w-full bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] flex items-center justify-center hover:scale-110 hover:bg-white/30 transition-all duration-500 group">
                  <span className="text-7xl animate-float drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500">🎉</span>
                </div>
                <div className="rounded-3xl h-48 w-full bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] flex items-center justify-center mt-8 hover:scale-110 hover:bg-white/30 transition-all duration-500 group">
                  <span className="text-7xl animate-float drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500" style={{ animationDelay: '0.5s' }}>💍</span>
                </div>
                <div className="rounded-3xl h-48 w-full bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] flex items-center justify-center -mt-8 hover:scale-110 hover:bg-white/30 transition-all duration-500 group">
                  <span className="text-7xl animate-float drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500" style={{ animationDelay: '1s' }}>🏢</span>
                </div>
                <div className="rounded-3xl h-48 w-full bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] flex items-center justify-center hover:scale-110 hover:bg-white/30 transition-all duration-500 group">
                  <span className="text-7xl animate-float drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500" style={{ animationDelay: '1.5s' }}>🎂</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-24 px-4 bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 animate-fadeInUp relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute -left-40 top-40 w-96 h-96 bg-yellow-300/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -right-40 bottom-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-[100px] pointer-events-none" style={{ animationDelay: '3s' }} />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <p className="text-teal-100 text-sm font-black uppercase tracking-widest mb-3 animate-fadeInUp drop-shadow-md">Real Experiences</p>
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl" style={{ fontFamily: "'Cinzel', serif" }}>What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-200">Clients</span> Say</h2>
              <p className="text-teal-50 text-xl md:text-2xl max-w-3xl mx-auto animate-fadeInUp drop-shadow-md font-light" style={{ fontFamily: "'Playfair Display', serif", animationDelay: '0.1s' }}>Don't just take our word for it. Read the stories of unforgettable moments we've created for people just like you.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <div key={t._id} className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:border-white/50 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] hover:-translate-y-3 transition-all duration-500 animate-fadeInUp flex flex-col relative group" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {/* Big Quote Icon in Background */}
                  <div className="absolute top-6 right-6 text-8xl text-white/10 font-serif leading-none group-hover:text-white/30 transition-colors duration-500">"</div>

                  <div className="flex gap-1 mb-6 relative z-10">
                    {[...Array(t.rating || 5)].map((_, j) => <span key={j} className="text-yellow-300 text-2xl drop-shadow-lg animate-float" style={{ animationDelay: `${j * 0.1}s` }}>★</span>)}
                  </div>
                  <p className="text-white/90 leading-relaxed mb-8 text-xl italic flex-1 relative z-10 font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-4 relative z-10 pt-6 border-t border-white/20">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0 ring-2 ring-white/50">
                      {t.name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl drop-shadow-md group-hover:text-yellow-200 transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>{t.name}</div>
                      {t.role && <div className="text-teal-100 text-xs font-bold uppercase tracking-wider mt-1">{t.role}</div>}
                    </div>
                    {/* Verified Badge */}
                    <div className="ml-auto flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-sm shadow-lg border border-white/30 group-hover:bg-green-400 transition-colors" title="Verified Client">✓</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-4 animate-fadeInUp bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/50 to-gray-900"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-[3rem] p-12 md:p-24 shadow-[0_0_50px_rgba(217,70,239,0.4)] hover:shadow-[0_0_80px_rgba(217,70,239,0.6)] transition-all duration-500 overflow-hidden group border border-white/20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          <h2 className="relative z-10 text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 animate-fadeInDown drop-shadow-2xl leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>Ready to Plan Your Dream Event?</h2>
          <p className="relative z-10 text-pink-100 text-xl md:text-3xl mb-12 max-w-3xl mx-auto animate-fadeInUp font-light drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Let's create something unforgettable together. Get a free consultation today and bring your vision to life.</p>
          <div className="relative z-10 flex flex-col sm:flex-row flex-wrap gap-6 justify-center">
            <Link to="/booking" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-fuchsia-700 font-black rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.8)] transition-all text-lg hover:-translate-y-2 duration-300 animate-slideInUp tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>🎉 Book Now</Link>
            <a href="https://wa.me/916394352002" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#25D366] text-white font-black rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(37,211,102,0.8)] transition-all text-lg hover:-translate-y-2 duration-300 animate-slideInUp tracking-wide" style={{ fontFamily: "'Cinzel', serif", animationDelay: '0.05s' }}>📱 +91 63943 52002</a>
            <Link to="/contact" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/20 backdrop-blur-xl border border-white/40 text-white font-black rounded-2xl hover:bg-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-2 transition-all text-lg duration-300 animate-slideInUp tracking-wide" style={{ fontFamily: "'Cinzel', serif", animationDelay: '0.1s' }}>💬 Contact Us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
