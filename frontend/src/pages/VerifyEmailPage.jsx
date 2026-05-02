import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useUserAuth } from '../context/UserAuthContext';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const VerifyEmailPage = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { completeRegistration } = useUserAuth();

    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            toast.error('No email found. Please start registration again.');
            navigate('/signup');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // Prevent double submit

        if (!otp || otp.length !== 6) {
            return toast.error('Please enter a valid 6-digit OTP.');
        }
        setLoading(true);

        let verifiedData = null;

        try {
            const res = await api.post('/users/verify', { email, otp });
            verifiedData = res.data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed. Please try again.');
            setLoading(false);
            return; // Stop here if API fails
        }

        // If API succeeded, safely handle context setup to prevent page crash
        try {
            const { token, user } = verifiedData;
            if (typeof completeRegistration === 'function') {
                await completeRegistration(token, user);
            } else {
                // Fallback if context function is missing
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            toast.success(`Welcome, ${user.name}! Your account is verified.`);
            navigate('/profile');
        } catch (contextErr) {
            console.error("Context Error during registration:", contextErr);
            toast.success(`Welcome, ${verifiedData?.user?.name || 'User'}! Account created.`);
            // Harsh fallback: reload page to profile to reset state
            setTimeout(() => window.location.href = '/profile', 1000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
                :root { --gold: #C9A84C; --gold-dark: #8B6914; --ivory: #FAF7F0; --ink: #0D0A0B; }
                .login-input {
                    width: 100%; background: transparent; border: none; border-bottom: 1px solid rgba(13,10,11,0.2);
                    padding: 0.75rem 0; font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 300;
                    color: var(--ink); outline: none; transition: border-color 0.3s ease; box-sizing: border-box;
                }
                .login-input::placeholder { color: rgba(13,10,11,0.35); }
                .login-input:focus { border-bottom-color: var(--gold); }
                .otp-input { text-align: center; font-size: 1.5rem; letter-spacing: 0.5em; }
                .otp-input::placeholder { font-size: 1rem; letter-spacing: normal; }
                .login-btn {
                    width: 100%; background: var(--ink); color: var(--gold); border: 1px solid var(--ink);
                    padding: 1rem 2rem; font-family: 'Outfit', sans-serif; font-size: 0.75rem; font-weight: 500;
                    letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 2rem;
                }
                .login-btn:hover:not(:disabled) { background: var(--gold); color: var(--ink); border-color: var(--gold); }
                .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
            <Helmet><title>Verify Email – Shiv Event Management</title></Helmet>
            <Navbar />

            <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem 3rem' }}>
                <div style={{ maxWidth: '450px', width: '100%', background: 'var(--ivory)', padding: '3.5rem', boxShadow: '0 32px 80px rgba(13,10,11,0.08)' }}>
                    <div className="fade-up" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--gold)' }}>✦</div>
                        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '1rem' }}>
                            Verify Your Email
                        </h1>
                        <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'rgba(13,10,11,0.5)', fontWeight: 300, lineHeight: 1.6 }}>
                            An OTP has been sent to <strong>{email || 'your email'}</strong>. Please enter it below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="fade-up" style={{ animationDelay: '0.1s' }}>
                        <div>
                            <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(13,10,11,0.5)', marginBottom: '0.5rem', fontWeight: 500 }}>Verification Code *</label>
                            <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" className="login-input otp-input" maxLength={6} />
                        </div>

                        <button type="submit" disabled={loading} className="login-btn">
                            {loading ? (<> <span style={{ width: '14px', height: '14px', border: '2px solid rgba(201,168,76,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Verifying... </>) : 'Verify & Create Account →'}
                        </button>
                    </form>

                    <div className="fade-up" style={{ animationDelay: '0.2s', marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'rgba(13,10,11,0.45)', fontWeight: 300 }}>
                            Didn't receive the code?{' '}
                            <Link to="/signup" style={{ color: 'var(--gold-dark)', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid rgba(139,105,20,0.3)' }}>
                                Try registering again
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VerifyEmailPage;