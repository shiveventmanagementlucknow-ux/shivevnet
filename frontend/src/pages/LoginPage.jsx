import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useUserAuth } from '../context/UserAuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useUserAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return toast.error('Please fill in all fields');
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
                :root {
                    --gold: #C9A84C; --gold-light: #E8C97A; --gold-dark: #8B6914;
                    --ivory: #FAF7F0; --ink: #0D0A0B; --ink-soft: #1A1612; --cream: #F5EDD8;
                }

                .login-input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid rgba(13,10,11,0.2);
                    padding: 0.75rem 0;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 300;
                    color: var(--ink);
                    outline: none;
                    transition: border-color 0.3s ease;
                    box-sizing: border-box;
                }
                .login-input::placeholder { color: rgba(13,10,11,0.35); }
                .login-input:focus { border-bottom-color: var(--gold); }

                .login-btn {
                    width: 100%;
                    background: var(--ink);
                    color: var(--gold);
                    border: 1px solid var(--ink);
                    padding: 1rem 2rem;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.75rem;
                    font-weight: 500;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                .login-btn:hover:not(:disabled) {
                    background: var(--gold);
                    color: var(--ink);
                    border-color: var(--gold);
                }
                .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .slide-panel {
                    background: var(--ink);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    position: relative;
                    overflow: hidden;
                }
                .slide-panel::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.12) 0%, transparent 60%),
                                radial-gradient(ellipse at 70% 80%, rgba(139,26,43,0.07) 0%, transparent 50%);
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
                .d1 { animation-delay: 0.1s; }
                .d2 { animation-delay: 0.2s; }
                .d3 { animation-delay: 0.3s; }

                @media (max-width: 768px) {
                    .login-grid { grid-template-columns: 1fr !important; }
                    .slide-panel { display: none !important; }
                    .login-form-side { padding: 2.5rem 1.5rem !important; }
                }
            `}</style>

            <Helmet><title>Login – Shiv Event Management</title></Helmet>
            <Navbar />

            <div style={{
                minHeight: '100vh',
                background: 'var(--ivory)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6rem 1.5rem 3rem',
            }}>
                <div className="login-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    maxWidth: '900px',
                    width: '100%',
                    minHeight: '560px',
                    boxShadow: '0 32px 80px rgba(13,10,11,0.12)',
                }}>
                    {/* Left — dark panel (hidden mobile) */}
                    <div className="slide-panel">
                        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                            {/* Decorative dots */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '2.5rem' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{
                                        width: i === 1 ? '20px' : '6px',
                                        height: '6px',
                                        borderRadius: '3px',
                                        background: i === 1 ? 'var(--gold)' : 'rgba(201,168,76,0.3)',
                                        transition: 'all 0.3s',
                                    }} />
                                ))}
                            </div>

                            <div style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--gold)' }}>✦</div>

                            <h2 style={{
                                fontFamily: 'Cormorant Garamond, serif',
                                fontSize: '2.8rem',
                                fontWeight: 300,
                                color: '#fff',
                                lineHeight: 1.1,
                                marginBottom: '1rem',
                            }}>
                                Welcome<br />
                                <em style={{ color: 'var(--gold)' }}>Back</em>
                            </h2>

                            <div style={{ width: '40px', height: '1px', background: 'var(--gold)', margin: '1.5rem auto' }} />

                            <p style={{
                                fontFamily: 'Outfit',
                                fontSize: '0.85rem',
                                fontWeight: 300,
                                color: 'rgba(250,247,240,0.55)',
                                lineHeight: 1.8,
                                maxWidth: '240px',
                            }}>
                                Sign in to continue planning your perfect celebration.
                            </p>
                        </div>
                    </div>

                    {/* Right — form */}
                    <div className="login-form-side" style={{
                        background: 'var(--ivory)',
                        padding: '3.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}>
                        <div className="fade-up">
                            <p style={{
                                fontFamily: 'Outfit',
                                fontSize: '0.65rem',
                                letterSpacing: '0.3em',
                                textTransform: 'uppercase',
                                color: 'var(--gold)',
                                marginBottom: '0.75rem',
                                fontWeight: 500,
                            }}>Your Account</p>

                            <h1 style={{
                                fontFamily: 'Cormorant Garamond, serif',
                                fontSize: '2.4rem',
                                fontWeight: 400,
                                color: 'var(--ink)',
                                lineHeight: 1.1,
                                marginBottom: '2.5rem',
                            }}>
                                Sign In
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="fade-up d1">
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'Outfit',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(13,10,11,0.5)',
                                    marginBottom: '0.5rem',
                                    fontWeight: 500,
                                }}>Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="your@email.com"
                                    className="login-input"
                                    autoComplete="email"
                                />
                            </div>

                            <div className="fade-up d2" style={{ position: 'relative' }}>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'Outfit',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(13,10,11,0.5)',
                                    marginBottom: '0.5rem',
                                    fontWeight: 500,
                                }}>Password *</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="••••••••"
                                    className="login-input"
                                    style={{ paddingRight: '2rem' }}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 0, bottom: '0.75rem',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'rgba(13,10,11,0.4)', fontSize: '0.85rem',
                                        padding: 0,
                                    }}
                                >{showPassword ? '🙈' : '👁'}</button>
                            </div>

                            <div className="fade-up d3" style={{ textAlign: 'right', marginTop: '-1rem' }}>
                                <Link to="/forgot-password" style={{
                                    fontFamily: 'Outfit',
                                    fontSize: '0.75rem',
                                    color: 'var(--gold-dark)',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    borderBottom: '1px solid transparent',
                                    transition: 'border-color 0.3s',
                                }}>
                                    Forgot Password?
                                </Link>
                            </div>

                            <div className="fade-up d3">
                                <button type="submit" disabled={loading} className="login-btn">
                                    {loading ? (
                                        <>
                                            <span style={{
                                                width: '14px', height: '14px',
                                                border: '2px solid rgba(201,168,76,0.3)',
                                                borderTopColor: 'var(--gold)',
                                                borderRadius: '50%',
                                                display: 'inline-block',
                                                animation: 'spin 0.7s linear infinite',
                                            }} />
                                            Signing in…
                                        </>
                                    ) : 'Sign In →'}
                                </button>
                            </div>
                        </form>

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <p style={{
                                fontFamily: 'Outfit',
                                fontSize: '0.8rem',
                                color: 'rgba(13,10,11,0.45)',
                                fontWeight: 300,
                            }}>
                                Don't have an account?{' '}
                                <Link to="/signup" style={{
                                    color: 'var(--gold-dark)',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    borderBottom: '1px solid rgba(139,105,20,0.3)',
                                    paddingBottom: '1px',
                                }}>
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
}