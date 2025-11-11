import mongoose from 'mongoose';
import User from '../models/User.js';
import Institution from '../models/Institution.js';
import Course from '../models/Course.js';
import { connectToDatabase } from '../lib/db.js';

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
    });

    // Create admin user
    const admin = await User.create({
      email: 'admin@sample.edu',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      institutionId: institution._id,
      name: 'Admin User',
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();