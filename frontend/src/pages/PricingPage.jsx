import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { pricingAPI } from '../services/api';

export function PricingPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pricingAPI.getAll()
            .then(r => setPlans(Array.isArray(r.data?.data) ? r.data.data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Helmet><title>Pricing – Shiv Event Management</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Transparent Pricing</p>
                        <h1 className="section-title">Choose Your <span className="gradient-text">Package</span></h1>
                        <p className="section-subtitle mx-auto">No hidden charges. Every rupee goes towards making your event unforgettable.</p>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-80 animate-pulse bg-gray-100 rounded-2xl" />)}
                        </div>
                    ) : plans.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                {plans.map((plan, i) => (
                                    <div key={plan._id} className={`bg-white rounded-2xl shadow-sm border p-8 relative transition-all ${plan.isPopular ? 'border-primary-300 shadow-lg shadow-primary-100 -mt-4 ring-1 ring-primary-200' : 'border-gray-100'}`}>
                                        {plan.tag && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs px-4 py-1 rounded-full font-medium">{plan.tag}</span>}
                                        <h3 className="font-display text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                                        {plan.description && <p className="text-gray-500 text-sm mb-4">{plan.description}</p>}
                                        <div className="text-4xl font-bold text-gray-900 mb-6">{plan.price}</div>
                                        {plan.features?.length > 0 && (
                                            <ul className="space-y-2.5 mb-8">
                                                {plan.features.map((f, j) => (
                                                    <li key={j} className="flex items-center gap-2.5 text-sm text-gray-600">
                                                        <span className="text-primary-600 text-base">✓</span>{f}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <Link to={plan.ctaLink || '/booking'} className={`w-full py-3 rounded-xl font-medium text-sm text-center block transition-all ${plan.isPopular ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'border border-primary-200 text-primary-600 hover:bg-primary-600 hover:text-white hover:border-primary-600'}`}>
                                            {plan.ctaText || 'Get Started'}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-gray-400 text-sm mt-10">All packages can be customized. <Link to="/contact" className="text-primary-600 hover:underline">Contact us</Link> for a custom quote.</p>
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">💰</div>
                            <h3 className="font-display text-xl text-gray-900 mb-2">Pricing plans coming soon</h3>
                            <p className="text-gray-500 mb-6">We're setting up our pricing. Contact us for a custom quote!</p>
                            <Link to="/contact" className="btn-primary">Get a Quote</Link>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default PricingPage;
