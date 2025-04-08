/**
 * SendGrid Email Verification Test Script
 * 
 * This script tests the SendGrid integration and verification code system
 * 
 * Usage:
 * node test-email-service.js [test_email@example.com]
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { sendgridService } from './server/sendgrid-service.js';

// Check for email address argument
const testEmail = process.argv[2] || 'test@example.com';

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

if (!isValidEmail(testEmail)) {
  console.error('Error: Invalid email address format.');
  console.log('Usage: node test-email-service.js [email@example.com]');
  process.exit(1);
}

// Generate a test verification code
function generateVerificationCode() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
}

async function runTest() {
  console.log('=== SendGrid Email Service Test ===');
  console.log(`Test email address: ${testEmail}`);
  
  // Check environment variables
  if (!process.env.SENDGRID_API_KEY) {
    console.error('Error: SENDGRID_API_KEY environment variable is not set.');
    process.exit(1);
  }
  
  if (!process.env.SENDGRID_FROM_EMAIL) {
    console.warn('Warning: SENDGRID_FROM_EMAIL environment variable is not set.');
    console.warn('Using test@example.com as default sender.');
  }
  
  const from = process.env.SENDGRID_FROM_EMAIL || 'test@example.com';
  
  console.log('\nStep 1: Testing SendGrid service initialization...');
  try {
    const isInitialized = await sendgridService.initialize();
    console.log(`SendGrid initialization result: ${isInitialized ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (!isInitialized) {
      console.error('Error: Failed to initialize SendGrid service.');
      process.exit(1);
    }
    
    // Get service status
    const status = sendgridService.getStatus();
    console.log('\nSendGrid Service Status:');
    console.log(JSON.stringify(status, null, 2));
  } catch (error) {
    console.error('Error during SendGrid initialization:', error);
    process.exit(1);
  }
  
  console.log('\nStep 2: Sending a test verification code...');
  const testCode = generateVerificationCode();
  console.log(`Generated verification code: ${testCode}`);
  
  try {
    const sentResult = await sendgridService.sendVerificationCode(testEmail, testCode);
    
    console.log('\nVerification Email Send Result:');
    console.log(JSON.stringify(sentResult, null, 2));
    
    if (!sentResult) {
      console.error('Error: Failed to send verification code email.');
      process.exit(1);
    }
    
    console.log('\n✅ SUCCESS: Test verification code email sent successfully.');
    console.log(`Please check ${testEmail} inbox for the verification code.`);
    console.log(`The verification code is: ${testCode}`);
  } catch (error) {
    console.error('Error sending verification code email:', error);
    process.exit(1);
  }
}

// Run the test
runTest().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});