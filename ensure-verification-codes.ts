/**
 * Verification Codes Table Migration Script
 * 
 * This script ensures that the verification_codes table exists in the database.
 * It's designed to be run during application startup or deployment to ensure
 * the necessary database structure for the email verification system.
 */

import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';

async function createVerificationCodesTable() {
  try {
    // Check if the table already exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'verification_codes'
      );
    `);
    
    const tableExists = result.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ verification_codes table already exists');
      return true;
    }
    
    // Create the table if it doesn't exist
    console.log('Creating verification_codes table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'email_verification',
        metadata TEXT DEFAULT '{}',
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
    `);
    
    console.log('✅ verification_codes table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating verification_codes table:', error);
    return false;
  }
}

// Function to validate the table structure matches our schema
async function validateTableStructure() {
  try {
    // Check column definitions
    const columnResult = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'verification_codes'
      ORDER BY ordinal_position;
    `);
    
    const expectedColumns = {
      'id': { type: 'integer', nullable: 'NO' },
      'user_id': { type: 'integer', nullable: 'NO' },
      'email': { type: 'text', nullable: 'NO' },
      'code': { type: 'text', nullable: 'NO' },
      'type': { type: 'text', nullable: 'NO' },
      'metadata': { type: 'text', nullable: 'YES' },
      'expires_at': { type: 'timestamp without time zone', nullable: 'NO' },
      'is_used': { type: 'boolean', nullable: 'YES' },
      'created_at': { type: 'timestamp without time zone', nullable: 'YES' },
    };
    
    const columns = columnResult.rows.reduce((acc, col) => {
      acc[col.column_name] = {
        type: col.data_type,
        nullable: col.is_nullable
      };
      return acc;
    }, {});
    
    // Check if all expected columns exist with correct types
    let structureValid = true;
    for (const [colName, expectedDef] of Object.entries(expectedColumns)) {
      const actualDef = columns[colName];
      if (!actualDef) {
        console.error(`❌ Missing column: ${colName}`);
        structureValid = false;
        continue;
      }
      
      if (actualDef.type !== expectedDef.type) {
        console.error(`❌ Column ${colName} has wrong type: ${actualDef.type} (expected ${expectedDef.type})`);
        structureValid = false;
      }
      
      if (actualDef.nullable !== expectedDef.nullable) {
        console.error(`❌ Column ${colName} has wrong nullability: ${actualDef.nullable} (expected ${expectedDef.nullable})`);
        structureValid = false;
      }
    }
    
    if (structureValid) {
      console.log('✅ verification_codes table structure is valid');
    } else {
      console.error('❌ verification_codes table structure has issues');
    }
    
    return structureValid;
  } catch (error) {
    console.error('Error validating table structure:', error);
    return false;
  }
}

// Main function to execute the script
export async function ensureVerificationCodesTable() {
  console.log('Checking verification_codes table...');
  
  try {
    // First make sure we have a working database connection
    await pool.query('SELECT 1');
    console.log('Database connection established');
    
    // Create the table if it doesn't exist
    const tableCreated = await createVerificationCodesTable();
    
    if (tableCreated) {
      // Validate the table structure
      await validateTableStructure();
    }
    
    return true;
  } catch (error) {
    console.error('Failed to ensure verification_codes table:', error);
    console.error('Email verification functionality may not work correctly');
    return false;
  } finally {
    console.log('Verification codes table check complete');
  }
}

// Allow running as a standalone script
// This is compatible with ESM modules
if (import.meta.url === import.meta.resolve('./ensure-verification-codes.ts')) {
  ensureVerificationCodesTable()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}