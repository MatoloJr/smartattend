import { connectToDatabase } from '../lib/db.ts';

async function main() {
  const conn = await connectToDatabase();
  const db = conn.db;
  const collections = ['institutions','users','courses','sessions','enrollments','attendances'];
  for (const name of collections) {
    const count = await db.collection(name).countDocuments();
    console.log(`${name}: ${count}`);
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Error showing counts:', err);
  process.exit(1);
});
