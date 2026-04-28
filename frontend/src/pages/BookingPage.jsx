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

export default function BookingPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { settings } = useSettings();

  // Availability state
  const [availability, setAvailability] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  const checkDateAvailability = useCallback(async (date) => {
    if (!date || new Date(date) <= new Date()) {
      setAvailability(null);
      return;
    }
    setCheckingAvail(true);
    try {
      const { data } = await bookingAPI.checkAvailability({ date, eventType: form.eventType });
      setAvailability(data.data);
    } catch {
      setAvailability(null);
    } finally {
      setCheckingAvail(false);
    }
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

    if (availability && !availability.available) {
      toast.error('Selected date is fully booked. Please choose another date.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, budget: form.budget ? Number(form.budget) : undefined, message: form.message?.trim() || undefined };
      await bookingAPI.create(payload);
      setSubmitted(true);
      toast.success('Booking submitted! We will contact you soon.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full text-center border border-gray-100">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">Booking Received!</h2>
            <p className="text-gray-500 mb-6">Thank you! Our team will reach out within <strong className="text-gray-900">24 hours</strong> to confirm your booking.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm border border-gray-100">
              <div className="flex justify-between"><span className="text-gray-400">Name:</span><span className="text-gray-900 font-medium">{form.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Event:</span><span className="text-gray-900 font-medium">{form.eventType}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Date:</span><span className="text-gray-900 font-medium">{new Date(form.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></div>
            </div>
            <a href={`https://wa.me/916394352002?text=Hi!%20I%20just%20submitted%20a%20booking%20for%20${encodeURIComponent(form.eventType)}%20on%20${form.date}.%20My%20name%20is%20${encodeURIComponent(form.name)}.`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 bg-green-50 text-green-600 border border-green-200 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">
              💬 Chat on WhatsApp for faster response (+91 63943 52002)
            </a>
            <button onClick={() => { setSubmitted(false); setForm(initialForm); setTouched({}); setAvailability(null); }} className="btn-primary w-full justify-center">
              Make Another Booking
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Book an Event – Shiv Event Management</title>
        <meta name="description" content="Book your dream event with Shiv Event Management. Check date availability and get a response within 24 hours." />
      </Helmet>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Get Started</p>
            <h1 className="section-title">Book Your <span className="gradient-text">Event</span></h1>
            <p className="text-gray-500 text-lg mt-3 max-w-lg mx-auto">Fill in the details below and our coordinator will reach out within 24 hours.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} onBlur={handleBlur}
                placeholder="Rahul Sharma" className={`input-field ${touched.name && errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`} />
              {touched.name && errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                <input name="phone" value={form.phone} onChange={handleChange} onBlur={handleBlur}
                  placeholder="9876543210" maxLength={10} className={`input-field ${touched.phone && errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`} />
                {touched.phone && errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                  placeholder="rahul@example.com" className={`input-field ${touched.email && errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`} />
                {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Type <span className="text-red-500">*</span></label>
              <select name="eventType" value={form.eventType} onChange={handleChange} onBlur={handleBlur}
                className={`input-field ${touched.eventType && errors.eventType ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}>
                <option value="">Select event type…</option>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {touched.eventType && errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
            </div>

            {/* Date + Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Date <span className="text-red-500">*</span></label>
                <input type="date" name="date" value={form.date} min={minDateStr} onChange={handleChange} onBlur={handleBlur}
                  className={`input-field ${touched.date && errors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`} />
                {touched.date && errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}

                {/* Availability Badge */}
                {checkingAvail && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                    Checking availability…
                  </div>
                )}
                {!checkingAvail && availability && (
                  <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${availability.available
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {availability.available ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Available — {availability.remainingSlots} of {availability.totalSlots} slots open
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Fully booked — please choose another date
                      </>
                    )}
                    {availability.existingEvents?.length > 0 && availability.available && (
                      <span className="text-gray-400 ml-1">({availability.existingEvents.map(e => e.eventType).join(', ')} already booked)</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget (₹) <span className="text-gray-400 text-xs font-normal">Optional</span></label>
                <input type="number" name="budget" value={form.budget} onChange={handleChange} onBlur={handleBlur}
                  placeholder="50000" min="0" className={`input-field ${touched.budget && errors.budget ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`} />
                {touched.budget && errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Requirements <span className="text-gray-400 text-xs font-normal">Optional</span></label>
              <textarea name="message" value={form.message} onChange={handleChange} onBlur={handleBlur}
                placeholder="Tell us about your vision, guest count, theme preferences…" rows={4}
                className={`input-field resize-none ${touched.message && errors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`} />
              {touched.message && errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>

            <button type="submit" disabled={loading || !isFormValid() || (availability && !availability.available)}
              className={`btn-primary w-full justify-center text-base py-4 ${(!isFormValid() || loading || (availability && !availability.available)) ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : ''}`}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</>
              ) : '🎉 Submit Booking Request'}
            </button>

            <p className="text-center text-xs text-gray-400">By submitting, you agree to our Terms & Privacy Policy.</p>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
