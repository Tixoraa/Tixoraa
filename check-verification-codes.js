// Script to check the verification_codes table
import { db } from '../server/db.js';
import { verificationCodes } from '../shared/schema.js';

async function checkVerificationCodes() {
  try {
    console.log('Checking verification_codes table...');
    const codes = await db.select().from(verificationCodes).limit(10);
    console.log('Results:', codes);
    console.log('Total records:', codes.length);
  } catch (error) {
    console.error('Error checking verification_codes table:', error);
  }
}

checkVerificationCodes()
  .then(() => console.log('Done'))
  .catch(err => console.error('Script error:', err));