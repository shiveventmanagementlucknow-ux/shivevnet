import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useUserAuth } from '../context/UserAuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
  :root { --gold:#C9A84C;--gold-light:#E8C97A;--gold-dark:#8B6914;--ivory:#FAF7F0;--ink:#0D0A0B;--ink-soft:#1A1612;--cream:#F5EDD8; }
  .eyebrow { font-family:'Outfit',sans-serif;font-size:0.65rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--gold);font-weight:500; }
  .field-input {
    width:100%;background:transparent;border:none;border-bottom:1px solid rgba(201,168,76,0.2);
    padding:0.75rem 0;font-family:'Outfit',sans-serif;font-size:0.95rem;font-weight:300;
    color:var(--ink);outline:none;transition:border-color 0.3s ease;
  }
  .field-input:focus { border-color:var(--gold); }
  .field-input::placeholder { color:rgba(13,10,11,0.3); }
  .field-label {
    display:block;font-family:'Outfit',sans-serif;font-size:0.6rem;letter-spacing:0.2em;
    text-transform:uppercase;font-weight:500;color:rgba(13,10,11,0.4);margin-bottom:0.25rem;transition:color 0.3s;
  }
  .field-wrap:focus-within .field-label { color:var(--gold-dark); }
  .gold-btn {
    font-family:'Outfit',sans-serif;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;
    font-weight:500;padding:1rem 2.5rem;background:var(--gold);color:var(--ink);border:none;cursor:pointer;
    display:inline-flex;align-items:center;justify-content:center;gap:0.75rem;transition:all 0.3s ease;width:100%;
  }
  .gold-btn:hover:not(:disabled) { background:var(--gold-light);transform:translateY(-1px);box-shadow:0 8px 25px rgba(201,168,76,0.35); }
  .gold-btn:disabled { opacity:0.45;cursor:not-allowed; }
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;}
  .d1{animation-delay:0.1s}.d2{animation-delay:0.2s}
  @keyframes spin{to{transform:rotate(360deg)}}
`;

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', city: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useUserAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
        setLoading(true);
        try {
            const user = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, city: form.city });
            toast.success(`Welcome, ${user.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally { setLoading(false); }
    };

    const field = (id, label, type = 'text', extra = {}) => (
        <div className="field-wrap" style={{ marginBottom: '2rem' }}>
            <label className="field-label" htmlFor={id}>{label}</label>
            <input
                id={id} type={type} value={form[id]} autoComplete={extra.autoComplete}
                onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                placeholder={extra.placeholder || ''} maxLength={extra.maxLength}
                className="field-input" required={extra.required} />
        </div>
    );

    return (
        <>
            <style>{STYLES}</style>
            <Helmet><title>Create Account – Shiv Event Management</title></Helmet>
            <Navbar />
            <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', paddingTop: '6rem', paddingBottom: '4rem' }}>
                {/* Decorative left panel – hidden on mobile */}
                <div className="hidden md:flex" style={{
                    flex: 1, maxWidth: '420px', background: 'var(--ink-soft)', position: 'relative', overflow: 'hidden',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem',
                }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.07) 0%, transparent 60%)' }} />
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '2rem', color: 'var(--gold)' }}>✦</div>
                        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: 'white', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                            Begin Your<br /><em style={{ color: 'var(--gold-light)' }}>Journey</em>
                        </h2>
                        <div style={{ width: '40px', height: '1px', background: 'var(--gold)', margin: '0 auto 1.5rem' }} />
                        <p style={{ fontFamily: 'Outfit', fontWeight: 300, color: 'rgba(250,247,240,0.4)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                            Join us and start planning the event of your dreams.
                        </p>
                    </div>
                    {/* Diamond pattern */}
                    <div style={{
                        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: '0.5rem', opacity: 0.3,
                    }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{ width: '6px', height: '6px', background: 'var(--gold)', transform: 'rotate(45deg)' }} />
                        ))}
                    </div>
                </div>

                {/* Form panel */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ width: '100%', maxWidth: '440px' }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <p className="eyebrow fade-up mb-3">New Account</p>
                            <h1 className="fade-up d1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.1 }}>
                                Create Your Profile
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit} className="fade-up d2">
                            {field('name', 'Full Name *', 'text', { placeholder: 'John Doe', required: true, autoComplete: 'name' })}
                            {field('email', 'Email Address *', 'email', { placeholder: 'your@email.com', required: true, autoComplete: 'email' })}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '0' }}>
                                <div className="field-wrap" style={{ marginBottom: '2rem' }}>
                                    <label className="field-label">Phone</label>
                                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="9876543210" className="field-input" autoComplete="tel" />
                                </div>
                                <div className="field-wrap" style={{ marginBottom: '2rem' }}>
                                    <label className="field-label">City</label>
                                    <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                        placeholder="Mumbai" className="field-input" autoComplete="address-level2" />
                                </div>
                            </div>

                            <div className="field-wrap" style={{ marginBottom: '2rem', position: 'relative' }}>
                                <label className="field-label">Password * <span style={{ fontWeight: 300, opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(min 6 chars)</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? 'text' : 'password'} value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="Minimum 6 characters" className="field-input" autoComplete="new-password" required
                                        style={{ paddingRight: '2.5rem' }} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '0.85rem', padding: '0.25rem' }}>
                                        {showPassword ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>

                            {field('confirmPassword', 'Confirm Password *', 'password', { placeholder: 'Re-enter password', required: true, autoComplete: 'new-password' })}

                            <button type="submit" className="gold-btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
                                {loading ? (
                                    <>
                                        <span style={{ width: '14px', height: '14px', border: '1.5px solid rgba(13,10,11,0.3)', borderTopColor: 'var(--ink)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                                        Creating Account…
                                    </>
                                ) : 'Create Account →'}
                            </button>

                            <p style={{ textAlign: 'center', fontFamily: 'Outfit', fontSize: '0.85rem', color: '#aaa', marginTop: '1.5rem', fontWeight: 300 }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: 'var(--gold-dark)', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid rgba(139,105,20,0.3)', transition: 'border-color 0.2s' }}>
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}