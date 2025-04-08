/**
 * SendGrid Verification Test Script
 * 
 * This script tests the SendGrid API key and email sending functionality
 * to verify that the verification code email system is working correctly.
 * 
 * Usage:
 * 1. Make sure SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are set in your .env file
 * 2. Run: node test-sendgrid-verification.js [test_email@example.com]
 * 
 * Note: If no email is provided as a command-line argument, the script will prompt you to enter one.
 */

import 'dotenv/config';
import sgMail from '@sendgrid/mail';
import readline from 'readline';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function testSendGrid(targetEmail) {
  console.log('\n=== SendGrid Verification Email Test ===\n');
  
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
  
  // Generate a verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Test email sending
  try {
    console.log(`\nSending test verification email to: ${targetEmail}`);
    console.log(`Using verification code: ${code}`);
    
    const msg = {
      to: targetEmail,
      from: fromEmail,
      subject: 'Tixoraa Verification Code',
      text: `Your verification code is: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Welcome to Tixoraa!</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
            ${code}
          </div>
          <p style="margin-top: 20px;">This code will expire in 30 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Tixoraa. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    
    const result = await sgMail.send(msg);
    console.log(`✅ Email sent successfully! Response status: ${result[0].statusCode}`);
    console.log('\nCheck your inbox (and spam folder) for the verification email.');
    console.log('If all went well, you should have received your verification code.');
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
      rl.question('Enter an email address to send the test to: ', (answer) => {
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
  await testSendGrid(email);
}

// Run the script
run().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});