import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';

export default function ProfilePage() {
    const { user, logout } = useUserAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                setBookings(Array.isArray(res.data?.data) ? res.data.data : []);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchMyBookings();
        }
    }, [user]);

    if (!user) return null;

    const STATUS_COLORS = {
        pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        confirmed: 'text-green-600 bg-green-50 border-green-200',
        cancelled: 'text-red-600 bg-red-50 border-red-200',
        completed: 'text-blue-600 bg-blue-50 border-blue-200',
    };

    return (
        <>
            <Helmet><title>My Profile – Shiv Event Management</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4">
                    {/* User Info Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-2 border-white/50 shadow-inner shrink-0">
                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h1 className="font-display text-3xl font-bold mb-1">{user.name}</h1>
                                    <p className="text-primary-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm mt-2">
                                        <span className="flex items-center gap-1.5">✉️ {user.email}</span>
                                        {user.phone && <span className="flex items-center gap-1.5"><span className="hidden sm:inline">•</span> 📞 {user.phone}</span>}
                                    </p>
                                </div>
                            </div>
                            <button onClick={logout} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl transition-all text-sm font-medium backdrop-blur-sm whitespace-nowrap">
                                Logout
                            </button>
                        </div>
                    </div>

                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>

                    {/* Bookings List */}
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="space-y-4">
                            {bookings.map(booking => (
                                <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:shadow-md hover:border-primary-100 transition-all">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-900 text-lg">{booking.eventType}</h3>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[booking.status] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm flex items-center gap-4">
                                            <span className="flex items-center gap-1.5">📅 {new Date(booking.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                                            {booking.budget && <span className="flex items-center gap-1.5">💰 ₹{booking.budget.toLocaleString('en-IN')}</span>}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                        <p className="text-xs text-gray-400 mb-1">Booked on</p>
                                        <p className="text-sm font-medium text-gray-700">{new Date(booking.createdAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="text-6xl mb-4 animate-bounce">📅</div>
                            <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                            <p className="text-gray-500 mb-6">You haven't booked any events with us yet.</p>
                            <Link to="/booking" className="btn-primary inline-flex">
                                Book an Event
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}