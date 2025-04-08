/**
 * Verification Code System Test Tool
 * 
 * This script tests the full verification code system, from database creation
 * to sending and validating verification codes.
 * 
 * Usage:
 * node test-verification-code.js [test_email@example.com]
 */

require('dotenv').config();
const { Pool } = require('pg');
const sgMail = require('@sendgrid/mail');
const readline = require('readline');

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function checkVerificationCodesTable() {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'verification_codes'
      );
    `);
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking for verification_codes table:', error.message);
    return false;
  }
}

async function createVerificationCodesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'verification',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
        used BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);
    
    console.log('✅ Verification codes table created or already exists');
    return true;
  } catch (error) {
    console.error('❌ Failed to create verification_codes table:', error.message);
    return false;
  }
}

async function saveVerificationCode(email, code, type = 'verification') {
  try {
    const result = await pool.query(
      `INSERT INTO verification_codes (email, code, type) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [email, code, type]
    );
    
    console.log(`✅ Verification code saved to database with ID: ${result.rows[0].id}`);
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Failed to save verification code:', error.message);
    return null;
  }
}

async function checkVerificationCode(email, code) {
  try {
    const result = await pool.query(
      `SELECT id, created_at, expires_at, used
       FROM verification_codes
       WHERE email = $1 AND code = $2 AND type = 'verification'
       AND expires_at > NOW() AND used = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, code]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No valid verification code found');
      return null;
    }
    
    console.log(`✅ Valid verification code found with ID: ${result.rows[0].id}`);
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Failed to check verification code:', error.message);
    return null;
  }
}

async function markVerificationCodeAsUsed(id) {
  try {
    await pool.query(
      `UPDATE verification_codes SET used = TRUE WHERE id = $1`,
      [id]
    );
    
    console.log(`✅ Verification code marked as used`);
    return true;
  } catch (error) {
    console.error('❌ Failed to mark verification code as used:', error.message);
    return false;
  }
}

async function sendVerificationCodeEmail(email, code) {
  console.log('\n=== Sending Verification Email ===\n');
  
  // Check for required environment variables
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  if (!apiKey) {
    console.error('❌ SENDGRID_API_KEY is not set in your environment variables.');
    console.error('   Please add it to your .env file or set it in your environment.');
    return false;
  }
  
  if (!fromEmail) {
    console.error('❌ SENDGRID_FROM_EMAIL is not set in your environment variables.');
    console.error('   Please add it to your .env file or set it in your environment.');
    return false;
  }
  
  console.log(`✅ SENDGRID_API_KEY found (${apiKey.substring(0, 5)}...)`);
  console.log(`✅ SENDGRID_FROM_EMAIL found (${fromEmail})`);
  
  // Initialize SendGrid
  try {
    sgMail.setApiKey(apiKey);
    console.log('✅ SendGrid client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize SendGrid client:', error.message);
    return false;
  }
  
  // Test email sending
  try {
    console.log(`\nSending verification email to: ${email}`);
    console.log(`Using verification code: ${code}`);
    
    const msg = {
      to: email,
      from: {
        email: fromEmail,
        name: 'Tixoraa Support',
      },
      subject: 'Tixoraa Verification Code',
      text: `Your verification code for Tixoraa is: ${code}. This code will expire in 30 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5; margin-bottom: 5px;">Tixoraa</h1>
            <p style="color: #666; font-size: 16px;">Your Event Management Platform</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.5;">Thanks for signing up with Tixoraa! Please use the verification code below to complete your registration:</p>
            
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 25px 0; font-size: 30px; letter-spacing: 5px; font-weight: bold; color: #333;">
              ${code}
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.5;">This code will expire in 30 minutes. If you didn't request this code, please ignore this email.</p>
            
            <p style="color: #555; font-size: 14px; margin-top: 25px;">Need help? Contact our support team at support@tixoraa.com</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Tixoraa. All rights reserved.</p>
            <p>123 Event Street, Suite 100, San Francisco, CA 94103</p>
          </div>
        </div>
      `,
    };
    
    const result = await sgMail.send(msg);
    console.log(`✅ Email sent successfully! Response status: ${result[0].statusCode}`);
    console.log('\nCheck your inbox (and spam folder) for the verification email.');
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    
    // Provide more detailed error information if available
    if (error.response) {
      console.error('Error details:');
      console.error(`  Status code: ${error.response.statusCode}`);
      console.error(`  Body: ${JSON.stringify(error.response.body, null, 2)}`);
      console.error(`  Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
    }
    
    return false;
  }
}

async function runVerificationTest(email) {
  console.log('=== Tixoraa Verification Code System Test ===\n');
  
  // Check for database connection
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your DATABASE_URL environment variable');
    return;
  }
  
  // Step 1: Check if verification_codes table exists, create if needed
  const tableExists = await checkVerificationCodesTable();
  if (!tableExists) {
    console.log('Verification codes table does not exist, creating...');
    const created = await createVerificationCodesTable();
    if (!created) return;
  } else {
    console.log('✅ Verification codes table already exists');
  }
  
  // Step 2: Generate a verification code
  const code = generateVerificationCode();
  console.log(`✅ Generated verification code: ${code}`);
  
  // Step 3: Save verification code to database
  const codeId = await saveVerificationCode(email, code);
  if (!codeId) return;
  
  // Step 4: Send verification email
  const emailSent = await sendVerificationCodeEmail(email, code);
  if (!emailSent) return;
  
  // Step 5: Simulate code verification
  console.log('\n=== Simulating Code Verification ===\n');
  console.log('Waiting 5 seconds before verification check...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const verifiedCodeId = await checkVerificationCode(email, code);
  if (!verifiedCodeId) return;
  
  // Step 6: Mark code as used
  const marked = await markVerificationCodeAsUsed(verifiedCodeId);
  if (!marked) return;
  
  // Verification complete!
  console.log('\n✅ Verification system test completed successfully!');
  console.log('\nThis confirms that your verification code system is working as expected.');
  console.log('The entire verification flow has been tested from database to email delivery.');
}

// Main function to run the test
async function run() {
  let email = process.argv[2];
  
  // If no email is provided as a command-line argument, prompt the user
  if (!email) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    email = await new Promise(resolve => {
      rl.question('Enter an email address to test with: ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }
  
  // Validate the email
  if (!isValidEmail(email)) {
    console.error(`❌ Invalid email address: ${email}`);
    console.error('Please provide a valid email address.');
    return;
  }
  
  // Run the test
  await runVerificationTest(email);
  
  // Close the database connection
  await pool.end();
}

// Run the script
run().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});