// ─────────────────────────────────────────────────────────────────────────────
// ProfilePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { bookingAPI } from '../services/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
  :root { --gold:#C9A84C;--gold-light:#E8C97A;--gold-dark:#8B6914;--ivory:#FAF7F0;--ink:#0D0A0B;--ink-soft:#1A1612;--cream:#F5EDD8; }
  .eyebrow { font-family:'Outfit',sans-serif;font-size:0.65rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--gold);font-weight:500; }
  .gold-btn {
    font-family:'Outfit',sans-serif;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;
    font-weight:500;padding:0.75rem 1.75rem;background:var(--gold);color:var(--ink);border:none;cursor:pointer;
    display:inline-flex;align-items:center;gap:0.5rem;text-decoration:none;transition:all 0.3s ease;
  }
  .gold-btn:hover { background:var(--gold-light);transform:translateY(-1px); }
  .ghost-btn {
    font-family:'Outfit',sans-serif;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;
    font-weight:500;padding:0.75rem 1.75rem;background:transparent;color:rgba(250,247,240,0.6);
    border:1px solid rgba(201,168,76,0.25);cursor:pointer;display:inline-flex;align-items:center;gap:0.5rem;
    text-decoration:none;transition:all 0.3s ease;
  }
  .ghost-btn:hover { color:var(--gold);border-color:rgba(201,168,76,0.5); }
  .booking-row {
    background:white;border:1px solid rgba(201,168,76,0.1);padding:1.75rem 2rem;
    display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.5rem;
    transition:all 0.4s cubic-bezier(0.16,1,0.3,1);
  }
  .booking-row:hover { box-shadow:0 12px 32px rgba(0,0,0,0.07),0 0 0 1px rgba(201,168,76,0.15);transform:translateX(4px); }
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;}
  .d1{animation-delay:0.1s}.d2{animation-delay:0.2s}
  .skeleton{background:linear-gradient(90deg,#f0ebe0 25%,#e8e0d0 50%,#f0ebe0 75%);background-size:200% auto;animation:shimmer 1.5s linear infinite;}
  @keyframes shimmer{0%{background-position:200%}100%{background-position:-200%}}
  @keyframes spin{to{transform:rotate(360deg)}}
`;

const STATUS_MAP = {
    pending: { color: '#b8860b', bg: 'rgba(184,134,11,0.08)', border: 'rgba(184,134,11,0.2)', label: 'Pending' },
    confirmed: { color: '#2e7d32', bg: 'rgba(46,125,50,0.06)', border: 'rgba(46,125,50,0.2)', label: 'Confirmed' },
    cancelled: { color: '#c0392b', bg: 'rgba(192,57,43,0.06)', border: 'rgba(192,57,43,0.2)', label: 'Cancelled' },
    completed: { color: '#1565c0', bg: 'rgba(21,101,192,0.06)', border: 'rgba(21,101,192,0.2)', label: 'Completed' },
};

export default function ProfilePage() {
    const { user, logout } = useUserAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyBookings = async () => {
            try {
                const res = await bookingAPI.getMy();
                setBookings(Array.isArray(res.data?.data) ? res.data.data : []);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally { setLoading(false); }
        };
        if (user) fetchMyBookings();
    }, [user]);

    if (!user) return null;

    return (
        <>
            <style>{STYLES}</style>
            <Helmet><title>My Profile – Shiv Event Management</title></Helmet>
            <Navbar />
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', paddingTop: '7rem', paddingBottom: '5rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>

                    {/* Profile Header */}
                    <div className="fade-up" style={{ background: 'var(--ink-soft)', border: '1px solid rgba(201,168,76,0.12)', marginBottom: '3rem', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--ink) 0%, #1a0f0a 100%)', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(201,168,76,0.06) 0%, transparent 60%)' }} />
                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        width: '72px', height: '72px', background: 'rgba(201,168,76,0.1)',
                                        border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--gold)', flexShrink: 0,
                                    }}>
                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: 'white', marginBottom: '0.5rem' }}>
                                            {user.name}
                                        </h1>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                            <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'rgba(250,247,240,0.5)', fontWeight: 300 }}>
                                                ✉ {user.email}
                                            </span>
                                            {user.phone && (
                                                <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'rgba(250,247,240,0.5)', fontWeight: 300 }}>
                                                    📞 {user.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={logout} className="ghost-btn">Logout</button>
                            </div>
                        </div>
                    </div>

                    {/* Bookings */}
                    <div className="fade-up d1">
                        <p className="eyebrow mb-6">My Bookings</p>

                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '96px' }} />)}
                            </div>
                        ) : bookings.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {bookings.map((booking, i) => {
                                    const st = STATUS_MAP[booking.status] || { color: '#888', bg: '#f5f5f5', border: '#ddd', label: booking.status };
                                    return (
                                        <div key={booking._id} className="booking-row fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 400, color: 'var(--ink)' }}>
                                                        {booking.eventType}
                                                    </h3>
                                                    <span style={{
                                                        fontFamily: 'Outfit', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                                                        fontWeight: 500, padding: '0.3rem 0.75rem',
                                                        color: st.color, background: st.bg, border: `1px solid ${st.border}`,
                                                    }}>
                                                        {st.label}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                                                    <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: '#999', fontWeight: 300 }}>
                                                        📅 {new Date(booking.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                    </span>
                                                    {booking.budget && (
                                                        <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: '#999', fontWeight: 300 }}>
                                                            ₹{booking.budget.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontFamily: 'Outfit', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ccc', marginBottom: '0.25rem' }}>Booked on</p>
                                                <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: '#666', fontWeight: 400 }}>
                                                    {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', border: '1px solid rgba(201,168,76,0.1)' }}>
                                <div style={{ fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>✦</div>
                                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '0.5rem' }}>
                                    No bookings yet
                                </h3>
                                <p style={{ fontFamily: 'Outfit', color: '#aaa', fontWeight: 300, marginBottom: '2rem' }}>
                                    You haven't booked any events with us yet.
                                </p>
                                <Link to="/booking" className="gold-btn">Book an Event</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}