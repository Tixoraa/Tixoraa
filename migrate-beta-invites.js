import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

// Extract database connection parameters from DATABASE_URL
const parseDbUrl = (url) => {
  const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  if (!match) throw new Error('Invalid DATABASE_URL format');
  
  const [, user, password, host, port, database] = match;
  
  return {
    user,
    password,
    host,
    port: parseInt(port, 10),
    database,
    ssl: { rejectUnauthorized: false }
  };
};

// Skip pgbouncer parameter that causes issues
const getCleanDatabaseUrl = (url) => {
  return url.replace(/\?pgbouncer=true/, '');
};

async function migrateDatabase() {
  console.log('Starting beta_invites table migration...');
  
  // Clean the database URL to remove pgbouncer parameter
  const dbUrl = getCleanDatabaseUrl(process.env.DATABASE_URL);
  const config = parseDbUrl(dbUrl);
  
  const pool = new Pool(config);
  
  try {
    // Check if table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'beta_invites'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('beta_invites table does not exist, creating...');
      await pool.query(`
        CREATE TABLE beta_invites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          sender_user_id INTEGER NOT NULL,
          sender_email TEXT NOT NULL,
          sender_name TEXT,
          tracking_ref TEXT NOT NULL,
          platform TEXT,
          action TEXT NOT NULL,
          recipient_name TEXT,
          recipient_email TEXT,
          recipient_user_id INTEGER,
          message TEXT,
          beta_key TEXT,
          click_count INTEGER DEFAULT 0,
          status TEXT DEFAULT 'sent',
          created_at TIMESTAMP DEFAULT NOW(),
          last_clicked_at TIMESTAMP,
          completed_at TIMESTAMP
        );
      `);
      console.log('beta_invites table created successfully');
    } else {
      console.log('beta_invites table exists, adding missing columns...');
      
      // Add missing columns
      await pool.query(`
        ALTER TABLE beta_invites
        ADD COLUMN IF NOT EXISTS sender_user_id INTEGER,
        ADD COLUMN IF NOT EXISTS sender_email TEXT,
        ADD COLUMN IF NOT EXISTS sender_name TEXT,
        ADD COLUMN IF NOT EXISTS recipient_name TEXT,
        ADD COLUMN IF NOT EXISTS message TEXT,
        ADD COLUMN IF NOT EXISTS beta_key TEXT,
        ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMP;
      `);
      
      // Update schema to ensure sender_user_id equals user_id for compatibility
      await pool.query(`
        UPDATE beta_invites
        SET sender_user_id = user_id
        WHERE sender_user_id IS NULL;
      `);
      
      console.log('Missing columns added successfully');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await pool.end();
  }
}

migrateDatabase().catch(console.error);