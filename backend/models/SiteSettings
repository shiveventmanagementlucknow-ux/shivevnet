import mongoose from 'mongoose';

const socialLinksSchema = new mongoose.Schema(
    {
        instagram: { type: String, trim: true, default: '' },
        facebook: { type: String, trim: true, default: '' },
        twitter: { type: String, trim: true, default: '' },
        youtube: { type: String, trim: true, default: '' },
    },
    { _id: false }
);

const statsSchema = new mongoose.Schema(
    {
        eventsCompleted: { type: String, default: '' },
        clientSatisfaction: { type: String, default: '' },
        yearsExperience: { type: String, default: '' },
        teamMembers: { type: String, default: '' },
    },
    { _id: false }
);

const heroSlideSchema = new mongoose.Schema(
    {
        title: { type: String, trim: true, default: '' },
        subtitle: { type: String, trim: true, default: '' },
        image: { type: String, default: '' },
        tag: { type: String, trim: true, default: '' },
    },
    { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
    {
        companyName: { type: String, trim: true, default: 'Shiv Event Management' },
        tagline: { type: String, trim: true, default: '' },
        ownerName: { type: String, trim: true, default: '' },
        ownerPhone: { type: String, trim: true, default: '' },
        phone: { type: String, trim: true, default: '' },
        email: { type: String, trim: true, lowercase: true, default: '' },
        whatsapp: { type: String, trim: true, default: '' },
        address: { type: String, trim: true, default: '' },
        workingHours: { type: String, trim: true, default: '' },
        socialLinks: { type: socialLinksSchema, default: () => ({}) },
        stats: { type: statsSchema, default: () => ({}) },
        heroSlides: { type: [heroSlideSchema], default: [] },
        aboutText: { type: String, default: '' },
        metaTitle: { type: String, default: '' },
        metaDescription: { type: String, default: '' },
    },
    {
        timestamps: true,
    }
);

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
