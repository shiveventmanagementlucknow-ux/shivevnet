// scripts/seedAdmin.js
// ─────────────────────────────────────────────────────────────────────────────
// ONE-TIME admin seed — run once from your backend root:
//   node scripts/seedAdmin.js
//
// What it does:
//   1. Connects to MongoDB using MONGO_URI from .env
//   2. Drops any existing user with this email from the `users` collection
//   3. Creates a fresh admin with bcrypt-hashed password + all required fields
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/index.js';

dotenv.config();

// ── Config ───────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const EMAIL = 'shiveventmanagementlucknow@gmail.com';
const PASSWORD = 'password123'; // Use a simpler password for local testing
const NAME = 'Shiv Event Management';

if (!MONGO_URI) {
    console.error('\n❌  MONGO_URI not found in .env\n');
    process.exit(1);
}

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('\n✅  MongoDB connected →', MONGO_URI.split('@').pop()); // hide credentials in log
        console.log('⚠️  Make sure this is your PRODUCTION database URI if testing on live site!');

        // Remove stale record
        const del = await User.deleteOne({ email: EMAIL.toLowerCase() });
        if (del.deletedCount) console.log('🗑   Removed old admin record');

        // Create admin using the REAL model (so pre-save hooks hash the password correctly)
        const admin = await User.create({
            name: NAME,
            email: EMAIL.toLowerCase(),
            password: PASSWORD, // DO NOT pre-hash. The User model's pre-save hook will hash it.
            role: 'superadmin',
            isActive: true,
            tokenVersion: 0,
        });

        console.log('\n🎉  Admin seeded successfully!');
        console.log('─────────────────────────────────────────────');
        console.log(`   _id   : ${admin._id}`);
        console.log(`   Email : ${EMAIL}`);
        console.log(`   Pass  : ${PASSWORD}  (This is for local testing only!)`);
        console.log(`   Role  : superadmin`);
        console.log('─────────────────────────────────────────────\n');

    } catch (err) {
        console.error('\n❌  Seed failed:', err.message);
        if (err.code === 11000) {
            console.error('   → Duplicate key. Run again — deleteOne should have cleared it.\n');
        }
    } finally {
        await mongoose.disconnect();
        console.log('🔌  Disconnected.\n');
        process.exit(0);
    }
}

seed();