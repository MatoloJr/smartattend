import { connectToDatabase } from '../lib/db.ts';

async function main() {
  const conn = await connectToDatabase();
  const collections = await conn.db.listCollections().toArray();
  console.log(collections.map((c: { name: string }) => c.name));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});