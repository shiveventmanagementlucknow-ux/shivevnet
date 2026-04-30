import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
        },
        excerpt: {
            type: String,
            maxlength: [300, 'Excerpt cannot exceed 300 characters'],
            default: '',
        },
        image: {
            type: String,
            default: '',
        },
        imagePublicId: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            trim: true,
            default: 'General',
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        author: {
            type: String,
            default: 'Shiv Event Management Team',
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        views: {
            type: Number,
            default: 0,
            min: 0,
        },
        metaTitle: {
            type: String,
            default: '',
        },
        metaDescription: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// ── Indexes ────────────────────────────────────────────────────────────────────

blogSchema.index({ isPublished: 1, createdAt: -1 });
blogSchema.index({ category: 1, isPublished: 1 });

export const Blog = mongoose.model('Blog', blogSchema);