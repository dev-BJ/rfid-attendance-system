import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.CLOUD_DATABASE_URL,
});

async function cleanup() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Drop tables
    const dropTablesSQL = `
      DROP TABLE IF EXISTS "student_attendance" CASCADE;
      DROP TABLE IF EXISTS "student_card" CASCADE;
      DROP TABLE IF EXISTS "system_device" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;
    `;

    await client.query(dropTablesSQL);
    console.log('Dropped all tables');

    // Drop sequences
    const sequences = [
      'student_attendance_id_seq',
      'student_card_id_seq',
      'system_device_id_seq',
      'users_id_seq',
    ];

    for (const seq of sequences) {
      try {
        await client.query(`DROP SEQUENCE IF EXISTS "${seq}" CASCADE;`);
        console.log(`Dropped sequence ${seq}`);
      } catch (e) {
        // Ignore if sequence doesn't exist
      }
    }

    console.log('Cleanup complete!');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanup();
