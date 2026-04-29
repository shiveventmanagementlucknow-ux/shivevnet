// scripts/seedAdmin.js
// ─────────────────────────────────────────────────────────────────────────────
// ONE-TIME admin seed — run once from your backend root:
//   node scripts/seedAdmin.js
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/index.js';

dotenv.config();

// ── Config ───────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const EMAIL = 'pandeydhananjay1444@gmail.com';
const PASSWORD = 'password123';
const NAME = 'Shiv Event Management';

if (!MONGO_URI) {
    console.error('\n❌  MONGO_URI not found in .env\n');
    process.exit(1);
}

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('\n✅  MongoDB connected →', MONGO_URI.split('@').pop());

        // Remove stale record (both old and new email — clean slate)
        const del1 = await User.deleteOne({ email: EMAIL.toLowerCase() });
        const del2 = await User.deleteOne({ email: 'shiveventmanagementlucknow@gmail.com' });
        if (del1.deletedCount) console.log('🗑   Removed old admin record (new email)');
        if (del2.deletedCount) console.log('🗑   Removed old admin record (old email)');

        // Create fresh admin — pre-save hook will bcrypt hash the password
        const admin = await User.create({
            name: NAME,
            email: EMAIL.toLowerCase(),
            password: PASSWORD,
            role: 'superadmin',
            isActive: true,
            tokenVersion: 0,
        });

        console.log('\n🎉  Admin seeded successfully!');
        console.log('─────────────────────────────────────────────');
        console.log(`   _id   : ${admin._id}`);
        console.log(`   Email : ${EMAIL}`);
        console.log(`   Pass  : ${PASSWORD}`);
        console.log(`   Role  : superadmin`);
        console.log('─────────────────────────────────────────────\n');

    } catch (err) {
        console.error('\n❌  Seed failed:', err.message);
        if (err.code === 11000) {
            console.error('   → Duplicate key error. Run again.\n');
        }
    } finally {
        await mongoose.disconnect();
        console.log('🔌  Disconnected.\n');
        process.exit(0);
    }
}

seed();