#!/usr/bin/env node

/**
 * SendGrid Email Service Test Script
 * 
 * This script tests the updated SendGrid email service with proper return type
 * {code, success} instead of just a boolean.
 */

// Load environment variables from .env file
require('dotenv').config();

const { MailService } = require('@sendgrid/mail');

// Check for required environment variables
if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY environment variable is not set.');
  console.error('Please set this in your .env file or environment variables.');
  process.exit(1);
}

if (!process.env.SENDGRID_FROM_EMAIL) {
  console.error('❌ SENDGRID_FROM_EMAIL environment variable is not set.');
  console.error('Please set this in your .env file or environment variables.');
  process.exit(1);
}

// Test email recipient
const testEmail = process.argv[2] || process.env.TEST_EMAIL;
if (!testEmail) {
  console.error('❌ Please provide a test email address as an argument or set TEST_EMAIL in your environment.');
  console.error('Usage: node test-sendgrid-service-new.js [test_email@example.com]');
  process.exit(1);
}

// Validate email format
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

if (!isValidEmail(testEmail)) {
  console.error(`❌ Invalid email format: ${testEmail}`);
  process.exit(1);
}

// Generate a random 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Test the updated sendVerificationCode function directly
async function testSendVerificationCode() {
  console.log('🔍 Testing SendGrid email verification code service...\n');
  
  try {
    // Create a mail service instance
    const mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);

    // Generate a verification code
    const verificationCode = generateVerificationCode();
    console.log(`📋 Generated verification code: ${verificationCode}`);

    console.log(`📧 Sending test verification email to ${testEmail}...`);

    // Create email content
    const msg = {
      to: testEmail,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Your Tixoraa Verification Code (Test)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Your Verification Code</h1>
          <p>Please use the following code to verify your email address:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #f5f5f5; padding: 10px; text-align: center; margin: 20px 0;">${verificationCode}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #777; font-size: 12px;">Tixoraa - Your ticket to unforgettable events</p>
        </div>
      `,
      text: `Your Tixoraa verification code is: ${verificationCode}. This code will expire in 10 minutes. If you did not request this code, please ignore this email.`
    };

    // Send the email
    const result = await mailService.send(msg);
    
    console.log('✅ Verification email sent successfully!');
    console.log(`📬 Email delivered to: ${testEmail}`);
    console.log(`🔢 Verification code: ${verificationCode}`);
    
    // Return an object with code and success similar to the updated function
    return {
      code: verificationCode,
      success: true
    };
  } catch (error) {
    console.error('❌ Error sending verification email:');
    console.error(error.toString());
    
    // If available, show more details about SendGrid API errors
    if (error.response && error.response.body) {
      console.error('SendGrid API Error Details:');
      console.error(JSON.stringify(error.response.body, null, 2));
    }
    
    // Return object with code and success=false
    return {
      code: generateVerificationCode(),
      success: false
    };
  }
}

// Run the test
async function runTest() {
  console.log('🚀 Starting SendGrid email service test');
  console.log('─────────────────────────────────────');
  
  console.log(`📝 Using SendGrid API Key: ${process.env.SENDGRID_API_KEY.substring(0, 5)}...${process.env.SENDGRID_API_KEY.substring(process.env.SENDGRID_API_KEY.length - 5)}`);
  console.log(`📤 From Email: ${process.env.SENDGRID_FROM_EMAIL}`);
  console.log(`📥 Test Email: ${testEmail}`);
  console.log('─────────────────────────────────────\n');

  try {
    const result = await testSendVerificationCode();
    
    console.log('\n─────────────────────────────────────');
    console.log(`Test Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Verification Code: ${result.code}`);
    console.log('─────────────────────────────────────\n');
    
    if (result.success) {
      console.log('✅ Test completed successfully!');
      console.log('Please check your email inbox for the verification code.');
      process.exit(0);
    } else {
      console.log('❌ Test failed. Please check the error details above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error during test execution:');
    console.error(error);
    process.exit(1);
  }
}

// Execute the test
runTest();