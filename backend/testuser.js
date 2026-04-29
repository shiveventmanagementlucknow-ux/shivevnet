// testuser.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/index.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

const u = await User.findOne({ email: 'pandeydhananjay1444@gmail.com' }).select('+password +tokenVersion');
console.log('Found:', u ? 'YES' : 'NO');
console.log('isActive:', u?.isActive);
console.log('role:', u?.role);
console.log('tokenVersion:', u?.tokenVersion);
console.log('hash exists:', !!u?.password);

// Test password match
if (u) {
    const bcrypt = await import('bcryptjs');
    const match = await bcrypt.default.compare('password123', u.password);
    console.log('Password match:', match);
}

await mongoose.disconnect();
process.exit(0);