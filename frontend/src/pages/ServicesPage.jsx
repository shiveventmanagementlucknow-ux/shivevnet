import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { serviceAPI } from '../services/api';

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
            <Helmet><title>Our Services – Shiv Event Management</title></Helmet>
            <Navbar />
            <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-purple-50/30 pt-24 pb-16">
                {/* Colorful Background Orbs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-400/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-400/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-4 animate-fadeInUp shadow-sm">What We Offer</span>
                        <h1 className="section-title animate-fadeInUp" style={{ animationDelay: '0.1s' }}>Our <span className="gradient-text">Services</span></h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>Every service is crafted with passion, precision, and a commitment to excellence.</p>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => <div key={i} className="h-64 animate-pulse bg-white rounded-3xl shadow-sm" />)}
                        </div>
                    ) : services.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((s, idx) => (
                                <Link key={s._id} to={`/services/${s.slug}`}
                                    className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-2 animate-fadeInUp flex flex-col overflow-hidden border border-gray-100 hover:border-transparent"
                                    style={{ animationDelay: `${idx * 0.1}s` }}>

                                    {/* Colorful hover border effect using pseudo-element */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-0"></div>

                                    {s.image ? (
                                        <div className="h-52 overflow-hidden relative shrink-0 z-10">
                                            <div className="absolute inset-0 bg-primary-900/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                            <img src={s.image} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { e.target.style.display = 'none'; }} />
                                            <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/50 z-20 group-hover:rotate-12 transition-transform duration-500">{s.icon || '🎉'}</div>
                                        </div>
                                    ) : (
                                        <div className="p-8 pb-0 relative z-10">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-inner border border-primary-100/50">{s.icon || '🎉'}</div>
                                        </div>
                                    )}
                                    <div className="p-8 flex flex-col flex-1 relative z-10">
                                        <h3 className="font-display text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">{s.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-6">{s.shortDescription}</p>
                                        {s.startingPrice && <p className="text-primary-600 text-sm font-bold mb-4">Starting ₹{s.startingPrice.toLocaleString('en-IN')}</p>}
                                        <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between group-hover:border-primary-100 transition-colors">
                                            <span className="text-primary-600 font-semibold text-sm group-hover:text-purple-600 transition-colors">Explore Service</span>
                                            <span className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-500 transform group-hover:translate-x-1 group-hover:shadow-md">→</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">🎯</div>
                            <h3 className="font-display text-xl text-gray-900 mb-2">No services available yet</h3>
                            <p className="text-gray-500">Our services are being set up. Please check back soon!</p>
                        </div>
                    )}
                    <div className="mt-14 text-center bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-10">
                        <h2 className="font-display text-3xl text-white mb-3">Don't see what you need?</h2>
                        <p className="text-primary-100 mb-6">We handle all kinds of events. Let's talk about your unique requirements.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:shadow-xl transition-all">Get in Touch</Link>
                            <a href="https://wa.me/916394352002" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:shadow-xl transition-all border border-[#25D366] hover:border-[#128C7E] hover:bg-[#128C7E]">📱 +91 63943 52002</a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ServicesPage;
