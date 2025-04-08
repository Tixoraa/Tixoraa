/**
 * SendGrid Email Test Script
 * 
 * This script tests the SendGrid email system with the current environment variables
 * 
 * Usage:
 * node test-sendgrid.js [test_email@example.com]
 */

import dotenv from 'dotenv';
dotenv.config();

import { MailService } from '@sendgrid/mail';

// Check for email address argument
const testEmail = process.argv[2] || 'test@example.com';

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

if (!isValidEmail(testEmail)) {
  console.error('Error: Invalid email address format.');
  console.log('Usage: node test-sendgrid.js [email@example.com]');
  process.exit(1);
}

// Generate a test verification code
function generateVerificationCode() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
}

async function sendTestEmail() {
  // Check environment variables
  if (!process.env.SENDGRID_API_KEY) {
    console.error('Error: SENDGRID_API_KEY environment variable is not set.');
    process.exit(1);
  }
  
  if (!process.env.SENDGRID_FROM_EMAIL) {
    console.warn('Warning: SENDGRID_FROM_EMAIL environment variable is not set.');
    console.warn('Using test@example.com as default sender.');
  }
  
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'test@example.com';
  const apiKey = process.env.SENDGRID_API_KEY;
  
  console.log(`=== SendGrid Email Test ===`);
  console.log(`From: ${fromEmail}`);
  console.log(`To: ${testEmail}`);
  
  try {
    // Initialize SendGrid
    const mailService = new MailService();
    mailService.setApiKey(apiKey);
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    console.log(`Generated verification code: ${verificationCode}`);
    
    // Create email message with HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Your Verification Code</h2>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 30px; letter-spacing: 8px; font-weight: bold; padding: 15px; background-color: #f7f7f7; border-radius: 5px; display: inline-block;">
            ${verificationCode}
          </div>
        </div>
        <p style="color: #666; text-align: center;">
          This code is valid for 15 minutes. Please do not share this code with anyone.
        </p>
        <div style="margin-top: 40px; text-align: center; color: #999; font-size: 13px;">
          <p>This email was sent from Tixoraa. If you did not request this code, please ignore this email.</p>
        </div>
      </div>
    `;
    
    // Plain text fallback
    const text = `Your verification code is: ${verificationCode}. This code is valid for 15 minutes. Please do not share this code with anyone.`;
    
    // Setup email parameters
    const msg = {
      to: testEmail,
      from: fromEmail,
      subject: 'Your Verification Code',
      text: text,
      html: html,
    };
    
    console.log('\nSending test email...');
    
    // Send email
    await mailService.send(msg);
    
    console.log('\n✅ SUCCESS: Test email sent successfully.');
    console.log(`Please check ${testEmail} inbox for the verification code.`);
    console.log(`The verification code is: ${verificationCode}`);
  } catch (error) {
    console.error('\n❌ ERROR: Failed to send test email:');
    console.error(error);
    
    if (error.response) {
      console.error('\nSendGrid API Error Details:');
      console.error(JSON.stringify(error.response.body, null, 2));
    }
    
    process.exit(1);
  }
}

// Run the test
sendTestEmail().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});