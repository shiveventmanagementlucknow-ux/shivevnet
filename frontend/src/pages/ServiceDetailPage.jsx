import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { serviceAPI } from '../services/api';

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

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!service) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h2 className="font-display text-3xl text-gray-900 mb-3">Service Not Found</h2>
                    <p className="text-gray-500 mb-6">The service you're looking for doesn't exist.</p>
                    <Link to="/services" className="btn-primary">View All Services</Link>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <Helmet><title>{service.title} – Shiv Event Management</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4">
                    <Link to="/services" className="text-primary-600 text-sm hover:text-primary-700 flex items-center gap-1 mb-8">← Back to Services</Link>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
                        {service.image && (
                            <div className="overflow-hidden rounded-2xl mb-8 bg-gray-50">
                                <img src={service.image} alt={service.title} className="w-full h-64 md:h-96 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                            <div className="text-5xl">{service.icon || '🎉'}</div>
                            <h1 className="font-display text-4xl font-bold text-gray-900">{service.title}</h1>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg mb-6">{service.description}</p>
                        {service.features?.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
                                <ul className="space-y-2">
                                    {service.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-600"><span className="text-primary-600">✓</span>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {service.startingPrice && <p className="text-2xl font-bold text-primary-600 mb-6">Starting at ₹{service.startingPrice.toLocaleString('en-IN')}</p>}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/booking" className="btn-primary text-base px-8 py-4 flex-1 text-center justify-center">Book This Service</Link>
                            <a href={`https://wa.me/916394352002?text=Hi,%20I'm%20interested%20in%20your%20${encodeURIComponent(service.title)}%20service.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-all flex-1 text-center">
                                📱 WhatsApp Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ServiceDetailPage;
