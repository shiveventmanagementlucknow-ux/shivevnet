import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { contactAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { settings } = useSettings();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await contactAPI.create(form);
            setSubmitted(true);
            toast.success('Message sent! We\'ll reply within 24 hours.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send message.');
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        settings?.address && { icon: '📍', title: 'Address', value: settings.address },
        settings?.phone && { icon: '📞', title: 'Phone', value: settings.phone },
        settings?.email && { icon: '✉️', title: 'Email', value: settings.email },
        settings?.workingHours && { icon: '🕒', title: 'Working Hours', value: settings.workingHours },
    ].filter(Boolean);

    return (
        <>
            <Helmet><title>Contact Us – Shiv Event Management</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Reach Out</p>
                        <h1 className="section-title">Get in <span className="gradient-text">Touch</span></h1>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Info */}
                        <div className="space-y-6">
                            {contactInfo.map((item, i) => (
                                <div key={i} className="card p-5 flex items-start gap-4">
                                    <div className="text-2xl">{item.icon}</div>
                                    <div>
                                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{item.title}</div>
                                        <div className="text-gray-900 text-sm font-medium">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                            {contactInfo.length === 0 && (
                                <div className="card p-8 text-center text-gray-400">
                                    <p>Contact information will be available soon.</p>
                                </div>
                            )}
                            <a href="https://wa.me/916394352002?text=Hi!%20I'm%20interested%20in%20booking%20an%20event."
                                target="_blank" rel="noreferrer"
                                className="flex items-center gap-3 p-5 bg-green-50 border border-green-200 hover:bg-green-100 rounded-2xl text-green-600 font-medium transition-all">
                                💬 Chat on WhatsApp (+91 6394352002)
                            </a>
                        </div>

                        {/* Form */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            {submitted ? (
                                <div className="text-center py-8">
                                    <div className="text-5xl mb-4">✉️</div>
                                    <h3 className="font-display text-2xl text-gray-900 mb-2">Message Sent!</h3>
                                    <p className="text-gray-500 mb-6">We'll get back to you within 24 hours.</p>
                                    <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} className="btn-primary">Send Another Message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-700 font-medium mb-1.5">Name *</label>
                                            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="input-field" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 font-medium mb-1.5">Email *</label>
                                            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="input-field" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 font-medium mb-1.5">Phone</label>
                                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 font-medium mb-1.5">Subject</label>
                                        <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="How can we help?" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 font-medium mb-1.5">Message *</label>
                                        <textarea required minLength={10} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us about your event…" rows={4} className="input-field resize-none" />
                                    </div>
                                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                                        {loading ? 'Sending…' : '📤 Send Message'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ContactPage;
