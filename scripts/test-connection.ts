import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

import { connectToDatabase } from '../lib/db.js';

/**
 * Simple script to test MongoDB Atlas connection
 * Usage: npm run test:connection
 */
async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB Atlas connection...');
    console.log('📝 Connection string:', process.env.MONGODB_URI ? 'Found in environment' : 'NOT FOUND');
    
    const connection = await connectToDatabase();
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database name:', connection.db.databaseName);
    console.log('🔗 Connection state:', connection.readyState === 1 ? 'Connected' : 'Not connected');
    
    // List collections
    const collections = await connection.db.listCollections().toArray();
    console.log(`\n📦 Collections (${collections.length}):`);
    if (collections.length === 0) {
      console.log('   (No collections yet - database is empty)');
    } else {
      collections.forEach((col: { name: string }) => {
        console.log(`   - ${col.name}`);
      });
    }
    
    console.log('\n🎉 Connection test passed! Your Atlas setup is working correctly.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Connection test failed!');
    const errorMessage = error?.message || String(error) || 'Unknown error';
    console.error('Error:', errorMessage);
    
    if (errorMessage.includes('authentication')) {
      console.error('\n💡 Tip: Check your MONGODB_URI in .env.local');
      console.error('   - Make sure username and password are correct');
      console.error('   - URL-encode special characters in password (@ → %40, # → %23)');
    } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      console.error('\n💡 Tip: Check your Network Access settings in Atlas');
      console.error('   - Make sure your IP address is whitelisted');
      console.error('   - Go to Atlas → Network Access → Add IP Address');
    } else if (errorMessage.includes('MONGODB_URI')) {
      console.error('\n💡 Tip: Make sure .env.local file exists with MONGODB_URI');
      console.error('   - File should be in project root');
      console.error('   - Format: MONGODB_URI=mongodb+srv://...');
    }
    
    process.exit(1);
  }
}

testConnection();

