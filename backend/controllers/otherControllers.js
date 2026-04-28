// ==================== CONTACT CONTROLLER ====================
import { Contact, Blog, Gallery, Service, Testimonial, SiteSettings, PricingPlan } from '../models/index.js';
import { sendContactNotification } from '../services/emailService.js';
import { cloudinary } from '../config/cloudinary.js';
import slugify from 'slugify';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Booking } from '../models/index.js';

// POST /api/contact
export const createContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);
    sendContactNotification(contact).catch(e => console.error('Email error:', e.message));
    res.status(201).json({ success: true, message: "Thank you! We'll be in touch soon.", data: contact });
  } catch (error) { next(error); }
};

// GET /api/contact (admin)
export const getAllContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const query = isRead !== undefined ? { isRead: isRead === 'true' } : {};
    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, data: contacts, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// PATCH /api/contact/:id/read
export const markContactRead = async (req, res, next) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) { next(error); }
};

// DELETE /api/contact/:id
export const deleteContact = async (req, res, next) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};

// ==================== BLOG CONTROLLER ====================

// GET /api/blogs
export const getBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, category, search } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { excerpt: { $regex: search, $options: 'i' } }];
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query).select('-content').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, data: blogs, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// GET /api/blogs/admin (all, including unpublished)
export const getBlogsAdmin = async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) { next(error); }
};

// GET /api/blogs/:slug
export const getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (error) { next(error); }
};

// POST /api/blogs (admin)
export const createBlog = async (req, res, next) => {
  try {
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const blog = await Blog.create({ ...req.body, slug });
    res.status(201).json({ success: true, message: 'Blog created', data: blog });
  } catch (error) { next(error); }
};

// PUT /api/blogs/:id (admin)
export const updateBlog = async (req, res, next) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog updated', data: blog });
  } catch (error) { next(error); }
};

// DELETE /api/blogs/:id (admin)
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.imagePublicId) await cloudinary.uploader.destroy(blog.imagePublicId);
    await blog.deleteOne();
    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) { next(error); }
};

// ==================== GALLERY CONTROLLER ====================

// GET /api/gallery
export const getGallery = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category && category !== 'All' ? { category } : {};
    const images = await Gallery.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: images, count: images.length });
  } catch (error) { next(error); }
};

// POST /api/gallery (admin)
export const uploadGalleryImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const { title, category, description, mediaType } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required and must be a string' });
    }
    if (!category || !['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Conference', 'Concert', 'Other'].includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category selected' });
    }

    // Save to database
    const image = await Gallery.create({
      title: title.trim(),
      imageUrl: req.file.path,
      publicId: req.file.filename,
      category,
      description: description ? String(description).trim() : '',
      mediaType: mediaType || 'image',
    });

    console.log('✅ Gallery image uploaded:', image._id);
    res.status(201).json({ success: true, message: 'Image uploaded successfully', data: image });
  } catch (error) {
    console.error('Gallery upload error:', error.message);
    next(error);
  }
};

// DELETE /api/gallery/:id (admin)
export const deleteGalleryImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    // Delete from Cloudinary if publicId exists
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
        console.log('✅ Deleted from Cloudinary:', image.publicId);
      } catch (cloudinaryError) {
        console.error('⚠️  Cloudinary delete error:', cloudinaryError.message);
        // Continue deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await Gallery.findByIdAndDelete(req.params.id);
    console.log('✅ Deleted from database:', req.params.id);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Gallery delete error:', error.message);
    next(error);
  }
};

// PATCH /api/gallery/:id (admin) — Update gallery image metadata
export const updateGalleryImage = async (req, res, next) => {
  try {
    const { isFeatured, description, order, title, category } = req.body;
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    if (typeof isFeatured === 'boolean') image.isFeatured = isFeatured;
    if (typeof description === 'string') image.description = description.trim();
    if (typeof order === 'number') image.order = order;
    if (title && typeof title === 'string') image.title = title.trim();
    if (category) image.category = category;

    await image.save();
    console.log('✅ Gallery image updated:', image._id);
    res.json({ success: true, message: 'Image updated successfully', data: image });
  } catch (error) {
    console.error('Gallery update error:', error.message);
    next(error);
  }
};

// ==================== SERVICE CONTROLLER ====================

// GET /api/services
export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (error) { next(error); }
};

// GET /api/services/:slug
export const getService = async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (error) { next(error); }
};

// POST /api/services (admin)
export const createService = async (req, res, next) => {
  try {
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const service = await Service.create({ ...req.body, slug });
    res.status(201).json({ success: true, message: 'Service created', data: service });
  } catch (error) { next(error); }
};

// PUT /api/services/:id (admin)
export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: service });
  } catch (error) { next(error); }
};

// DELETE /api/services/:id (admin)
export const deleteService = async (req, res, next) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) { next(error); }
};

// ==================== PAYMENT CONTROLLER ====================

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: { bookingId, customerName: booking.name, eventType: booking.eventType }
    });

    await Booking.findByIdAndUpdate(bookingId, { razorpayOrderId: order.id });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        customerName: booking.name,
        customerEmail: booking.email,
        customerPhone: booking.phone,
      }
    });
  } catch (error) { next(error); }
};

// POST /api/payments/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentId: razorpay_payment_id, paymentStatus: 'paid', status: 'confirmed' },
      { new: true }
    );

    res.json({ success: true, message: 'Payment verified. Booking confirmed!', data: booking });
  } catch (error) { next(error); }
};

// ==================== SERVICES ADMIN CONTROLLER ====================

// GET /api/services/admin (all services including inactive)
export const getServicesAdmin = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) { next(error); }
};

// ==================== TESTIMONIAL CONTROLLER ====================

// GET /api/testimonials (public - active only)
export const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) { next(error); }
};

// GET /api/testimonials/admin (all)
export const getTestimonialsAdmin = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) { next(error); }
};

// POST /api/testimonials (admin)
export const createTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, message: 'Testimonial created', data: testimonial });
  } catch (error) { next(error); }
};

// PUT /api/testimonials/:id (admin)
export const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, message: 'Testimonial updated', data: testimonial });
  } catch (error) { next(error); }
};

// DELETE /api/testimonials/:id (admin)
export const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) { next(error); }
};

// ==================== SITE SETTINGS CONTROLLER ====================

// GET /api/settings (public)
export const getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

// PUT /api/settings (admin)
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    settings = await SiteSettings.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Settings updated', data: settings });
  } catch (error) { next(error); }
};

// ==================== PRICING CONTROLLER ====================

// GET /api/pricing (public - active only)
export const getPricingPlans = async (req, res, next) => {
  try {
    const plans = await PricingPlan.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data: plans });
  } catch (error) { next(error); }
};

// GET /api/pricing/admin (all)
export const getPricingPlansAdmin = async (req, res, next) => {
  try {
    const plans = await PricingPlan.find().sort({ order: 1 });
    res.json({ success: true, data: plans });
  } catch (error) { next(error); }
};

// POST /api/pricing (admin)
export const createPricingPlan = async (req, res, next) => {
  try {
    const plan = await PricingPlan.create(req.body);
    res.status(201).json({ success: true, message: 'Plan created', data: plan });
  } catch (error) { next(error); }
};

// PUT /api/pricing/:id (admin)
export const updatePricingPlan = async (req, res, next) => {
  try {
    const plan = await PricingPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Plan updated', data: plan });
  } catch (error) { next(error); }
};

// DELETE /api/pricing/:id (admin)
export const deletePricingPlan = async (req, res, next) => {
  try {
    const plan = await PricingPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Plan deleted' });
  } catch (error) { next(error); }
};
