import { Resend } from 'resend';

let resend;

const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const FROM_EMAIL = () => process.env.RESEND_FROM || 'Shiv Event Management <onboarding@resend.dev>';
const COMPANY = () => process.env.COMPANY_NAME || 'Shiv Event Management';
const FRONTEND = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const WHATSAPP = () => process.env.WHATSAPP_NUMBER || '';

const layout = (title, body) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#16213e 100%);padding:40px 30px;text-align:center;">
        <h1 style="margin:0;font-size:28px;color:#ffffff;letter-spacing:1px;">🎉 ${COMPANY()}</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">${title}</p>
      </td></tr>
      <tr><td style="padding:36px 32px;">${body}</td></tr>
      <tr><td style="padding:24px 32px;background:#fafafa;border-top:1px solid #eef0f3;text-align:center;">
        ${WHATSAPP() ? `<p style="margin:0 0 8px;"><a href="https://wa.me/${WHATSAPP()}" style="color:#25D366;text-decoration:none;font-weight:600;">💬 WhatsApp: +${WHATSAPP()}</a></p>` : ''}
        <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} ${COMPANY()}. All rights reserved.</p>
        <p style="margin:4px 0 0;"><a href="${FRONTEND()}" style="color:#6366f1;font-size:12px;text-decoration:none;">Visit Website</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

// ==================== BOOKING EMAILS ====================

export const sendBookingConfirmation = async (booking) => {
  const r = getResend();
  if (!r) return;

  const eventDate = new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const body = `
    <h2 style="color:#1a1a2e;margin:0 0 16px;">Booking Received! ✅</h2>
    <p style="color:#4b5563;line-height:1.6;">Dear <strong>${booking.name}</strong>,</p>
    <p style="color:#4b5563;line-height:1.6;">Thank you for choosing ${COMPANY()}! We've received your booking and our team will contact you within <strong>24 hours</strong>.</p>
    <div style="background:#f8f9ff;border-left:4px solid #6366f1;padding:20px;border-radius:0 12px 12px 0;margin:24px 0;">
      <h3 style="margin:0 0 12px;color:#1a1a2e;font-size:16px;">📋 Booking Details</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6b7280;width:120px;">Event Type</td><td style="color:#1a1a2e;font-weight:600;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Date</td><td style="color:#1a1a2e;font-weight:600;">${eventDate}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Budget</td><td style="color:#1a1a2e;font-weight:600;">${booking.budget ? '₹' + booking.budget.toLocaleString('en-IN') : 'To be discussed'}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Status</td><td><span style="background:#fef3c7;color:#d97706;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600;">⏳ Pending</span></td></tr>
      </table>
    </div>
    <p style="color:#4b5563;line-height:1.6;">Our coordinator will reach out at <strong>${booking.phone}</strong> or <strong>${booking.email}</strong>.</p>
    ${WHATSAPP() ? `<p style="color:#4b5563;">You can also reach us on WhatsApp: <a href="https://wa.me/${WHATSAPP()}" style="color:#25D366;font-weight:600;">+${WHATSAPP()}</a></p>` : ''}
    <div style="text-align:center;margin:32px 0 8px;">
      <a href="${FRONTEND()}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:600;">Visit Our Website</a>
    </div>`;

  try {
    await r.emails.send({ from: FROM_EMAIL(), to: [booking.email], subject: `Booking Confirmed – ${booking.eventType} | ${COMPANY()}`, html: layout('Your event is in expert hands', body) });
  } catch (err) { console.error('Resend booking email failed:', err.message); }

  if (process.env.ADMIN_NOTIFICATION_EMAIL) {
    try {
      await r.emails.send({
        from: FROM_EMAIL(), to: [process.env.ADMIN_NOTIFICATION_EMAIL],
        subject: `New Booking: ${booking.eventType} – ${booking.name}`,
        html: layout('New Booking Received', `
          <h2 style="color:#1a1a2e;margin:0 0 16px;">New Booking Alert 🔔</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;">Name</td><td style="color:#1a1a2e;font-weight:600;">${booking.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Event</td><td style="color:#1a1a2e;font-weight:600;">${booking.eventType}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Date</td><td style="color:#1a1a2e;font-weight:600;">${eventDate}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Phone</td><td style="color:#1a1a2e;font-weight:600;">${booking.phone}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="color:#1a1a2e;font-weight:600;">${booking.email}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Budget</td><td style="color:#1a1a2e;font-weight:600;">${booking.budget ? '₹' + booking.budget.toLocaleString('en-IN') : 'N/A'}</td></tr>
          </table>
          ${booking.message ? `<p style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:8px;color:#4b5563;">"${booking.message}"</p>` : ''}`),
      });
    } catch (err) { console.error('Resend admin notification failed:', err.message); }
  }
};

// ==================== CONTACT EMAILS ====================

export const sendContactNotification = async (contact) => {
  const r = getResend();
  if (!r) return;

  try {
    await r.emails.send({
      from: FROM_EMAIL(), to: [contact.email],
      subject: `We received your message – ${COMPANY()}`,
      html: layout("We'll be in touch soon", `
        <h2 style="color:#1a1a2e;margin:0 0 16px;">Thanks for reaching out! 💬</h2>
        <p style="color:#4b5563;line-height:1.6;">Hi <strong>${contact.name}</strong>,</p>
        <p style="color:#4b5563;line-height:1.6;">We've received your message and will respond within <strong>24-48 hours</strong>.</p>
        <div style="background:#f8f9ff;border-left:4px solid #6366f1;padding:16px 20px;border-radius:0 12px 12px 0;margin:20px 0;">
          <p style="margin:0;color:#4b5563;font-style:italic;">"${contact.message}"</p>
        </div>
        ${WHATSAPP() ? `<p style="color:#4b5563;">Need quick help? Chat on <a href="https://wa.me/${WHATSAPP()}" style="color:#25D366;font-weight:600;">WhatsApp</a>.</p>` : ''}`),
    });
  } catch (err) { console.error('Resend contact email failed:', err.message); }

  if (process.env.ADMIN_NOTIFICATION_EMAIL) {
    try {
      await r.emails.send({
        from: FROM_EMAIL(), to: [process.env.ADMIN_NOTIFICATION_EMAIL],
        subject: `New Contact: ${contact.name} – ${contact.subject || 'General Inquiry'}`,
        html: layout('New Contact Message', `
          <h2 style="color:#1a1a2e;margin:0 0 16px;">New Message 📩</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;">Name</td><td style="color:#1a1a2e;font-weight:600;">${contact.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="color:#1a1a2e;font-weight:600;">${contact.email}</td></tr>
            ${contact.phone ? `<tr><td style="padding:8px 0;color:#6b7280;">Phone</td><td style="color:#1a1a2e;font-weight:600;">${contact.phone}</td></tr>` : ''}
            ${contact.subject ? `<tr><td style="padding:8px 0;color:#6b7280;">Subject</td><td style="color:#1a1a2e;font-weight:600;">${contact.subject}</td></tr>` : ''}
          </table>
          <p style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:8px;color:#4b5563;">"${contact.message}"</p>`),
      });
    } catch (err) { console.error('Resend admin contact notification failed:', err.message); }
  }
};

// ==================== USER WELCOME EMAIL ====================

export const sendWelcomeEmail = async (user) => {
  const r = getResend();
  if (!r) return;

  try {
    await r.emails.send({
      from: FROM_EMAIL(), to: [user.email],
      subject: `Welcome to ${COMPANY()}! 🎉`,
      html: layout('Welcome aboard!', `
        <h2 style="color:#1a1a2e;margin:0 0 16px;">Welcome to ${COMPANY()}! 🎊</h2>
        <p style="color:#4b5563;line-height:1.6;">Hi <strong>${user.name}</strong>,</p>
        <p style="color:#4b5563;line-height:1.6;">Your account has been created successfully. You can now browse our services, book events, and track your bookings.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${FRONTEND()}/services" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:600;">Browse Services</a>
        </div>
        ${WHATSAPP() ? `<p style="color:#4b5563;text-align:center;">Questions? Chat on <a href="https://wa.me/${WHATSAPP()}" style="color:#25D366;font-weight:600;">WhatsApp</a></p>` : ''}`),
    });
  } catch (err) { console.error('Resend welcome email failed:', err.message); }
};

// ==================== ACCOUNT VERIFICATION EMAIL ====================

export const sendAccountVerificationEmail = async (email, otp, name) => {
  // MOCK LOG FOR CONSOLE DEBUGGING
  console.log('\n=============================================');
  console.log(`📩 EMAIL INTERCEPTED FOR DEBUGGING (Account Verification)`);
  console.log(`👤 To: ${email} (${name})`);
  console.log(`🔑 OTP CODE: ${otp}`);
  console.log('=============================================\n');

  const r = getResend();
  if (!r) {
    console.log('⚠️ RESEND_API_KEY not found. Skipping actual email delivery.');
    return;
  }

  try {
    await r.emails.send({
      from: FROM_EMAIL(),
      to: [email],
      subject: `Verify Your Email for ${COMPANY()}`,
      html: layout('Verify Your Email', `
        <h2 style="color:#1a1a2e;margin:0 0 16px;">Welcome to ${COMPANY()}! 🎊</h2>
        <p style="color:#4b5563;line-height:1.6;">Hi <strong>${name}</strong>,</p>
        <p style="color:#4b5563;line-height:1.6;">Thanks for signing up. Please use the code below to verify your email address and complete your registration.</p>
        <div style="text-align:center;margin:32px 0;">
          <div style="display:inline-block;background:#f3f4f6;color:#111827;padding:16px 40px;border-radius:12px;font-weight:700;font-size:32px;letter-spacing:10px;border:2px dashed #d1d5db;">${otp}</div>
        </div>
        <p style="color:#4b5563;font-size:13px;margin-top:16px;">This OTP will expire in <strong>15 minutes</strong>.</p>
        <p style="color:#4b5563;font-size:13px;">If you did not sign up for an account, you can safely ignore this email.</p>`),
    });
  } catch (err) { console.error('Resend account verification email failed:', err.message); }
};

// ==================== BOOKING STATUS UPDATE EMAIL ====================

export const sendBookingStatusUpdate = async (booking) => {
  const r = getResend();
  if (!r) return;

  const statusMap = {
    confirmed: { emoji: '✅', color: '#10b981', label: 'Confirmed', text: 'Great news! Your booking has been confirmed. Our team will start preparations.' },
    cancelled: { emoji: '❌', color: '#ef4444', label: 'Cancelled', text: 'Your booking has been cancelled. If this was a mistake, please contact us.' },
    completed: { emoji: '🎉', color: '#3b82f6', label: 'Completed', text: 'Your event has been marked as completed. We hope you had an amazing experience!' },
  };

  const info = statusMap[booking.status];
  if (!info) return;

  const eventDate = new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  try {
    await r.emails.send({
      from: FROM_EMAIL(), to: [booking.email],
      subject: `Booking ${info.label} – ${booking.eventType} | ${COMPANY()}`,
      html: layout(`Booking ${info.label}`, `
        <h2 style="color:#1a1a2e;margin:0 0 16px;">Booking Update ${info.emoji}</h2>
        <p style="color:#4b5563;line-height:1.6;">Dear <strong>${booking.name}</strong>,</p>
        <p style="color:#4b5563;line-height:1.6;">${info.text}</p>
        <div style="background:#f8f9ff;border-left:4px solid ${info.color};padding:20px;border-radius:0 12px 12px 0;margin:24px 0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;">Event</td><td style="color:#1a1a2e;font-weight:600;">${booking.eventType}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Date</td><td style="color:#1a1a2e;font-weight:600;">${eventDate}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Status</td><td><span style="background:${info.color}20;color:${info.color};padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600;">${info.emoji} ${info.label}</span></td></tr>
          </table>
        </div>
        ${WHATSAPP() ? `<p style="color:#4b5563;">Questions? Reach us on <a href="https://wa.me/${WHATSAPP()}" style="color:#25D366;font-weight:600;">WhatsApp</a>.</p>` : ''}`),
    });
  } catch (err) { console.error('Resend status update email failed:', err.message); }
};

// ==================== PASSWORD RESET EMAIL ====================

export const sendPasswordResetEmail = async (email, otp, name, type = 'admin') => {
  // MOCK LOG FOR CONSOLE DEBUGGING
  console.log('\n=============================================');
  console.log(`📩 EMAIL INTERCEPTED FOR DEBUGGING`);
  console.log(`👤 To: ${email} (${name})`);
  console.log(`🔑 OTP CODE: ${otp}`);
  console.log('=============================================\n');

  const r = getResend();
  if (!r) {
    console.log('⚠️ RESEND_API_KEY not found. Skipping actual email delivery.');
    return;
  }

  const resetLink = type === 'admin'
    ? `${FRONTEND()}/admin/reset-password/${otp}`
    : `${FRONTEND()}/reset-password/${otp}`;

  const subjectTitle = type === 'admin' ? `Admin` : `Account`;

  try {
    await r.emails.send({
      from: FROM_EMAIL(),
      to: [email],
      subject: `Password Reset Request – ${COMPANY()} ${subjectTitle}`,
      html: layout('Reset Your Password', `
        <h2 style="color:#1a1a2e;margin:0 0 16px;">Password Reset Request 🔐</h2>
        <p style="color:#4b5563;line-height:1.6;">Hi <strong>${name}</strong>,</p>
        <p style="color:#4b5563;line-height:1.6;">We received a request to reset your password. You can click the link below to reset it, or use the OTP code manually.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
        </div>
        <div style="text-align:center;margin:32px 0;">
          <p style="color:#4b5563;font-size:14px;margin-bottom:12px;">Or enter this OTP manually:</p>
          <div style="display:inline-block;background:#f3f4f6;color:#111827;padding:16px 40px;border-radius:12px;font-weight:700;font-size:32px;letter-spacing:10px;border:2px dashed #d1d5db;">${otp}</div>
        </div>
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;border-radius:0 8px 8px 0;margin:24px 0;">
          <p style="margin:0;color:#92400e;font-size:13px;font-weight:600;">⚠️ If you didn't request this, ignore this email. Your password won't change unless you verify this OTP.</p>
        </div>
        <p style="color:#4b5563;font-size:13px;margin-top:16px;">For security reasons, this OTP will expire in <strong>15 minutes</strong>.</p>`),
    });
  } catch (err) { console.error('Resend password reset email failed:', err.message); }
};
