import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { bookingAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const EVENT_TYPES = ['Wedding', 'Corporate Event', 'Birthday Party', 'Anniversary', 'Engagement', 'Baby Shower', 'Conference', 'Product Launch', 'Concert', 'Other'];

const initialForm = { name: '', phone: '', email: '', eventType: '', date: '', budget: '', message: '' };
const initialErrors = { name: '', phone: '', email: '', eventType: '', date: '', budget: '', message: '' };

const validate = (field, value) => {
  switch (field) {
    case 'name': return value.trim().length < 3 ? 'Name must be at least 3 characters' : '';
    case 'phone': return !/^[6-9]\d{9}$/.test(value) ? 'Enter a valid 10-digit Indian phone number' : '';
    case 'email': return !/^\S+@\S+\.\S+$/.test(value) ? 'Enter a valid email address' : '';
    case 'eventType': return !value ? 'Please select an event type' : '';
    case 'date': {
      if (!value) return 'Event date is required';
      if (new Date(value) <= new Date()) return 'Event date must be in the future';
      return '';
    }
    case 'budget': return value && isNaN(Number(value)) ? 'Budget must be a number' : '';
    case 'message': return value && value.trim().length < 10 ? 'Message must be at least 10 characters' : '';
    default: return '';
  }
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
  :root {
    --gold: #C9A84C;
    --gold-light: #E8C97A;
    --gold-dark: #8B6914;
    --ivory: #FAF7F0;
    --ink: #0D0A0B;
    --ink-soft: #1A1612;
    --cream: #F5EDD8;
  }
  .booking-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(201,168,76,0.25);
    padding: 0.75rem 0;
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    font-weight: 300;
    color: var(--ink);
    outline: none;
    transition: border-color 0.3s ease;
    appearance: none;
    -webkit-appearance: none;
  }
  .booking-input:focus { border-color: var(--gold); }
  .booking-input::placeholder { color: rgba(13,10,11,0.3); }
  .booking-input.error { border-color: #c0392b; }
  .booking-label {
    display: block;
    font-family: 'Outfit', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 500;
    color: rgba(13,10,11,0.5);
    margin-bottom: 0.25rem;
    transition: color 0.3s;
  }
  .booking-field:focus-within .booking-label { color: var(--gold-dark); }
  .gold-btn {
    font-family: 'Outfit', sans-serif;
    font-size: 0.8rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 500;
    padding: 1rem 2.5rem;
    background: var(--gold);
    color: var(--ink);
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .gold-btn:hover:not(:disabled) { background: var(--gold-light); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(201,168,76,0.35); }
  .gold-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .section-eyebrow { font-family: 'Outfit', sans-serif; font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); font-weight: 500; }
  .ornament { display: flex; align-items: center; gap: 1rem; justify-content: center; margin: 0.75rem 0; }
  .ornament::before, .ornament::after { content: ''; flex: 1; max-width: 60px; height: 1px; }
  .ornament::before { background: linear-gradient(90deg, transparent, var(--gold)); }
  .ornament::after { background: linear-gradient(90deg, var(--gold), transparent); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
`;

export default function BookingPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { settings } = useSettings();
  const [availability, setAvailability] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  const checkDateAvailability = useCallback(async (date) => {
    if (!date || new Date(date) <= new Date()) { setAvailability(null); return; }
    setCheckingAvail(true);
    try {
      const { data } = await bookingAPI.checkAvailability({ date, eventType: form.eventType });
      setAvailability(data.data);
    } catch { setAvailability(null); }
    finally { setCheckingAvail(false); }
  }, [form.eventType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) setErrors(er => ({ ...er, [name]: validate(name, value) }));
    if (name === 'date') checkDateAvailability(value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(er => ({ ...er, [name]: validate(name, value) }));
  };

  const isFormValid = () => {
    const required = ['name', 'phone', 'email', 'eventType', 'date'];
    return required.every(f => !validate(f, form[f])) && !validate('message', form.message) && !validate('budget', form.budget);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const allErrors = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: validate(k, form[k]) }), {});
    setErrors(allErrors);
    if (Object.values(allErrors).some(Boolean)) return;
    if (availability && !availability.available) { toast.error('Selected date is fully booked. Please choose another date.'); return; }
    setLoading(true);
    try {
      const payload = { ...form, budget: form.budget ? Number(form.budget) : undefined, message: form.message?.trim() || undefined };
      await bookingAPI.create(payload);
      setSubmitted(true);
      toast.success('Booking submitted! We will contact you soon.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setLoading(false); }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  if (submitted) {
    return (
      <>
        <style>{STYLES}</style>
        <Navbar />
        <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem' }}>
          <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: 'fadeUp 0.6s ease both' }}>🎉</div>
            <p className="section-eyebrow fade-up delay-1 mb-3">Booking Confirmed</p>
            <h2 className="fade-up delay-1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: 'var(--ink)', marginBottom: '1rem' }}>
              We've Received Your Request
            </h2>
            <div className="ornament fade-up delay-1"><span style={{ color: 'var(--gold)' }}>✦</span></div>
            <p className="fade-up delay-2" style={{ fontFamily: 'Outfit', fontWeight: 300, color: '#666', lineHeight: 1.8, margin: '1.5rem 0' }}>
              Our team will reach out within <strong style={{ fontWeight: 500, color: 'var(--ink)' }}>24 hours</strong> to confirm your booking and discuss the details.
            </p>

            <div className="fade-up delay-2" style={{ background: 'white', border: '1px solid rgba(201,168,76,0.15)', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
              {[
                { label: 'Name', val: form.name },
                { label: 'Event', val: form.eventType },
                { label: 'Date', val: new Date(form.date).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                  <span style={{ fontFamily: 'Outfit', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999' }}>{row.label}</span>
                  <span style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)' }}>{row.val}</span>
                </div>
              ))}
            </div>

            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href={`https://wa.me/916394352002?text=Hi!%20I%20just%20submitted%20a%20booking%20for%20${encodeURIComponent(form.eventType)}%20on%20${form.date}.%20My%20name%20is%20${encodeURIComponent(form.name)}.`}
                target="_blank" rel="noreferrer"
                style={{ padding: '1rem', background: '#25D366', color: 'white', fontFamily: 'Outfit', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'background 0.3s' }}>
                💬 Chat on WhatsApp
              </a>
              <button className="gold-btn" style={{ width: '100%' }}
                onClick={() => { setSubmitted(false); setForm(initialForm); setTouched({}); setAvailability(null); }}>
                Make Another Booking
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <Helmet>
        <title>Book an Event – Shiv Event Management</title>
        <meta name="description" content="Book your dream event with Shiv Event Management. Check availability and get a response within 24 hours." />
      </Helmet>
      <Navbar />

      <div style={{ minHeight: '100vh', background: 'var(--ivory)', paddingTop: '7rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p className="section-eyebrow fade-up mb-4">Reserve Your Date</p>
            <h1 className="fade-up delay-1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '1rem' }}>
              Book Your <em style={{ color: 'var(--gold-dark)' }}>Event</em>
            </h1>
            <div className="ornament fade-up delay-1"><span style={{ color: 'var(--gold)' }}>✦</span></div>
            <p className="fade-up delay-2" style={{ fontFamily: 'Outfit', fontWeight: 300, color: '#888', marginTop: '1rem', lineHeight: 1.7 }}>
              Fill in the details below and our coordinator will reach out within 24 hours.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="fade-up delay-2">
            <div style={{ background: 'white', border: '1px solid rgba(201,168,76,0.12)', padding: '3rem', marginBottom: '1.5rem' }}>
              {/* Name */}
              <div className="booking-field" style={{ marginBottom: '2.5rem' }}>
                <label className="booking-label">Full Name <span style={{ color: '#c0392b' }}>*</span></label>
                <input name="name" value={form.name} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Rahul Sharma" className={`booking-input ${touched.name && errors.name ? 'error' : ''}`} />
                {touched.name && errors.name && <p style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: '#c0392b', marginTop: '0.4rem' }}>{errors.name}</p>}
              </div>

              {/* Phone + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="booking-field">
                  <label className="booking-label">Phone <span style={{ color: '#c0392b' }}>*</span></label>
                  <input name="phone" value={form.phone} onChange={handleChange} onBlur={handleBlur}
                    placeholder="9876543210" maxLength={10} className={`booking-input ${touched.phone && errors.phone ? 'error' : ''}`} />
                  {touched.phone && errors.phone && <p style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: '#c0392b', marginTop: '0.4rem' }}>{errors.phone}</p>}
                </div>
                <div className="booking-field">
                  <label className="booking-label">Email <span style={{ color: '#c0392b' }}>*</span></label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                    placeholder="rahul@example.com" className={`booking-input ${touched.email && errors.email ? 'error' : ''}`} />
                  {touched.email && errors.email && <p style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: '#c0392b', marginTop: '0.4rem' }}>{errors.email}</p>}
                </div>
              </div>

              {/* Event Type */}
              <div className="booking-field" style={{ marginBottom: '2.5rem' }}>
                <label className="booking-label">Event Type <span style={{ color: '#c0392b' }}>*</span></label>
                <select name="eventType" value={form.eventType} onChange={handleChange} onBlur={handleBlur}
                  className={`booking-input ${touched.eventType && errors.eventType ? 'error' : ''}`}
                  style={{ cursor: 'pointer', background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23C9A84C' d='M1 1l5 5 5-5'/%3E%3C/svg%3E") no-repeat right center`, backgroundSize: '12px', paddingRight: '1.5rem' }}>
                  <option value="">Select event type…</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {touched.eventType && errors.eventType && <p style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: '#c0392b', marginTop: '0.4rem' }}>{errors.eventType}</p>}
              </div>

              {/* Date + Budget */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="booking-field">
                  <label className="booking-label">Event Date <span style={{ color: '#c0392b' }}>*</span></label>
                  <input type="date" name="date" value={form.date} min={minDateStr} onChange={handleChange} onBlur={handleBlur}
                    className={`booking-input ${touched.date && errors.date ? 'error' : ''}`} />
                  {touched.date && errors.date && <p style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: '#c0392b', marginTop: '0.4rem' }}>{errors.date}</p>}
                  {checkingAvail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontFamily: 'Outfit', fontSize: '0.7rem', color: '#999' }}>
                      <span style={{ width: '10px', height: '10px', border: '1.5px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Checking availability…
                    </div>
                  )}
                  {!checkingAvail && availability && (
                    <div style={{
                      marginTop: '0.5rem', padding: '0.5rem 0.75rem',
                      background: availability.available ? 'rgba(39,174,96,0.05)' : 'rgba(192,57,43,0.05)',
                      borderLeft: `2px solid ${availability.available ? '#27ae60' : '#c0392b'}`,
                      fontFamily: 'Outfit', fontSize: '0.7rem',
                      color: availability.available ? '#27ae60' : '#c0392b',
                    }}>
                      {availability.available
                        ? `✓ Available — ${availability.remainingSlots} slot(s) open`
                        : '✗ Fully booked — choose another date'}
                    </div>
                  )}
                </div>
                <div className="booking-field">
                  <label className="booking-label">Budget (₹) <span style={{ fontWeight: 300, opacity: 0.5 }}>Optional</span></label>
                  <input type="number" name="budget" value={form.budget} onChange={handleChange} onBlur={handleBlur}
                    placeholder="50000" min="0" className={`booking-input ${touched.budget && errors.budget ? 'error' : ''}`} />
                  {touched.budget && errors.budget && <p style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: '#c0392b', marginTop: '0.4rem' }}>{errors.budget}</p>}
                </div>
              </div>

              {/* Message */}
              <div className="booking-field">
                <label className="booking-label">Additional Requirements <span style={{ fontWeight: 300, opacity: 0.5 }}>Optional</span></label>
                <textarea name="message" value={form.message} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Tell us about your vision, guest count, theme preferences…" rows={4}
                  className={`booking-input ${touched.message && errors.message ? 'error' : ''}`}
                  style={{ resize: 'none', lineHeight: 1.7 }} />
                {touched.message && errors.message && <p style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: '#c0392b', marginTop: '0.4rem' }}>{errors.message}</p>}
              </div>
            </div>

            <button type="submit" className="gold-btn" style={{ width: '100%', padding: '1.25rem' }}
              disabled={loading || !isFormValid() || (availability && !availability.available)}>
              {loading ? (
                <>
                  <span style={{ width: '14px', height: '14px', border: '1.5px solid rgba(13,10,11,0.3)', borderTopColor: 'var(--ink)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Submitting…
                </>
              ) : '✦ Submit Booking Request'}
            </button>

            <p style={{ textAlign: 'center', fontFamily: 'Outfit', fontSize: '0.7rem', color: '#bbb', marginTop: '1rem' }}>
              By submitting, you agree to our Terms &amp; Privacy Policy.
            </p>
          </form>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @media (max-width: 640px) {
              .booking-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </div>
      <Footer />
    </>
  );
}