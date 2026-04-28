import mongoose from 'mongoose';

const pricingPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Plan name is required'],
            trim: true,
        },
        price: {
            type: String,
            required: [true, 'Price is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        features: [
            {
                type: String,
                trim: true,
            },
        ],
        tag: {
            type: String,
            trim: true,
            default: '',
        },
        ctaText: {
            type: String,
            trim: true,
            default: 'Get Started',
        },
        ctaLink: {
            type: String,
            trim: true,
            default: '/booking',
        },
        isPopular: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
pricingPlanSchema.index({ isActive: 1, order: 1 });

export const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);
