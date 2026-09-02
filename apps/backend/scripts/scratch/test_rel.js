const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query('SELECT * FROM "Religion"');
  console.log('Total religions:', res.rows.length);
  await client.end();
}
main().catch(console.error);
