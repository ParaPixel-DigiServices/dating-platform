const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query('SELECT * FROM "Interest"');
  console.log('Total interests:', res.rows.length);
  if (res.rows.length > 0) {
    console.log('Sample:', res.rows[0]);
  }
  await client.end();
}
main().catch(console.error);
