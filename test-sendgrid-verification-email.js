/**
 * SendGrid Verification Email Test Script
 * 
 * This script tests the SendGrid email service by sending a verification code email
 * exactly as the application would do, using the same template and code format.
 * 
 * Usage:
 * 1. Make sure SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are set in your .env file
 * 2. Run: node test-sendgrid-verification-email.js [test_email@example.com]
 * 
 * Note: If no email is provided as a command-line argument, the script will prompt you to enter one.
 */

// Load environment variables
import 'dotenv/config';
import { MailService } from '@sendgrid/mail';
import readline from 'readline';

// Initialize variables
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;

// Check required environment variables
if (!sendgridApiKey) {
  console.error('ERROR: SENDGRID_API_KEY environment variable is not set.');
  process.exit(1);
}

if (!sendgridFromEmail) {
  console.warn('WARNING: SENDGRID_FROM_EMAIL environment variable is not set. Will use default sender.');
}

// Email validation function
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Generate a random verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send verification email
async function testSendVerificationEmail(email) {
  if (!isValidEmail(email)) {
    console.error(`Invalid email address: ${email}`);
    return false;
  }

  // Initialize SendGrid
  const sgMail = new MailService();
  sgMail.setApiKey(sendgridApiKey);
  
  // Generate the verification code
  const code = generateVerificationCode();
  
  // Create the email template (same as in the application)
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #001F2F; margin-bottom: 10px;">Tixoraa</h1>
        <p style="color: #666; font-size: 16px;">Your stage, your story</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #001F2F; margin-top: 0;">Your Verification Code</h2>
        <p style="font-size: 16px; line-height: 1.5;">To complete your registration, please use the following verification code:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #001F2F; background-color: #e9ecef; padding: 10px; border-radius: 5px; display: inline-block;">
            ${code}
          </div>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5;">This code will expire in 10 minutes.</p>
      </div>
      
      <div style="color: #666; font-size: 14px; line-height: 1.5;">
        <p>If you did not request this code, please ignore this email or contact support if you have concerns.</p>
        <p>© ${new Date().getFullYear()} Tixoraa. All rights reserved.</p>
      </div>
    </div>
  `;
  
  const plainTextContent = `Your Tixoraa Verification Code: ${code}
    
This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

© ${new Date().getFullYear()} Tixoraa. All rights reserved.`;

  // Prepare the email message
  const msg = {
    to: email,
    from: sendgridFromEmail || 'test@example.com',
    subject: 'Tixoraa - Your Verification Code',
    text: plainTextContent,
    html: htmlContent,
  };

  try {
    console.log(`Sending verification code ${code} to ${email}...`);
    await sgMail.send(msg);
    console.log('✅ Verification email sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Response details:');
      console.error(`Status code: ${error.response.statusCode}`);
      const body = error.response.body || {};
      console.error(`Error details: ${JSON.stringify(body, null, 2)}`);
    }
    
    return false;
  }
}

// Function to run the test
async function run() {
  let email = process.argv[2];
  
  // If no email provided as argument, prompt for it
  if (!email) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    email = await new Promise(resolve => {
      rl.question('Enter the email address to send a test verification code: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
  
  if (!isValidEmail(email)) {
    console.error(`Invalid email address: ${email}`);
    console.error('Usage: node test-sendgrid-verification-email.js [valid_email@example.com]');
    process.exit(1);
  }
  
  console.log('\nSendGrid Verification Email Test');
  console.log('===============================');
  console.log(`Test will send a verification code to: ${email}`);
  console.log(`Using sender: ${sendgridFromEmail || '(default - will be selected by SendGrid)'}`);
  
  await testSendVerificationEmail(email);
  console.log('\nTest completed!');
}

// Run the script
run().catch(error => {
  console.error('Unexpected error in test:', error);
  process.exit(1);
});