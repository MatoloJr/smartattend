import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

import mongoose from 'mongoose';
import User from '../models/User.ts';
import Institution from '../models/Institution.ts';
import Course from '../models/Course.ts';
import { connectToDatabase } from '../lib/db.ts';

const seedDatabase = async () => {
  try {
    await connectToDatabase();
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Institution.deleteMany({}),
      Course.deleteMany({}),
    ]);

    // Create institution
    const institution = await Institution.create({
      name: 'Sample University',
      domain: 'sample.edu',
      address: {
        street: '123 University Ave',
        city: 'City',
        state: 'State',
        country: 'Country',
      },
      contact: {
        email: 'info@sample.edu',
        phone: '+1234567890',
        website: 'https://sample.edu',
      },
      primaryCampus: {
        name: 'Main Campus',
        location: '123 University Ave, City, State',
        country: 'Country',
      },
    });

    // Create admin user
    const admin = await User.create({
      email: 'admin@sample.edu',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      institutionId: institution._id,
      name: 'Admin User',
    });

    console.log('✅ Database seeded successfully!');
    console.log(`📝 Created institution: ${institution.name}`);
    console.log(`👤 Created admin user: ${admin.email}`);
    console.log(`🔑 Password: admin123`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding database:', error?.message || error);
    if (error?.errors) {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

seedDatabase();