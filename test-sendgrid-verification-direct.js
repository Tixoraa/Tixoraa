/**
 * Direct SendGrid Email Verification Test Script
 * 
 * This script tests the SendGrid email service by sending a test email
 * to verify that the API key and configuration are working correctly.
 */

import 'dotenv/config';
import sgMail from '@sendgrid/mail';

// Check for required environment variables
if (!process.env.SENDGRID_API_KEY) {
  console.error('\x1b[31mERROR: SENDGRID_API_KEY environment variable is not set\x1b[0m');
  console.log('Please set SENDGRID_API_KEY as an environment variable or a Replit secret.');
  process.exit(1);
}

if (!process.env.SENDGRID_FROM_EMAIL) {
  console.error('\x1b[31mERROR: SENDGRID_FROM_EMAIL environment variable is not set\x1b[0m');
  console.log('Please set SENDGRID_FROM_EMAIL as an environment variable or a Replit secret.');
  process.exit(1);
}

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Helper function to print colored text
function colorPrint(text, color) {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
  };

  console.log(`${colors[color] || ''}${text}${colors.reset}`);
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate a random verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Main test function
async function testSendGridVerification(testEmail) {
  colorPrint("=== Testing SendGrid Email Verification Service ===", "cyan");
  
  // Validate input email
  if (!testEmail || !isValidEmail(testEmail)) {
    colorPrint("✗ Invalid or missing test email address", "red");
    colorPrint("Usage: node test-sendgrid-verification-direct.js your-email@example.com", "yellow");
    return false;
  }
  
  const verificationCode = generateVerificationCode();
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  colorPrint(`Using from email: ${fromEmail}`, "blue");
  colorPrint(`Sending test email to: ${testEmail}`, "blue");
  colorPrint(`Generated verification code: ${verificationCode}`, "blue");
  
  // Prepare email message
  const msg = {
    to: testEmail,
    from: fromEmail,
    subject: 'Tixoraa Email Verification Test',
    text: `Your verification code is: ${verificationCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a5568; text-align: center;">Tixoraa Email Verification</h2>
        <p style="color: #4a5568; font-size: 16px;">Thank you for testing the Tixoraa email verification system.</p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <p style="font-size: 14px; color: #718096; margin: 0 0 10px 0;">Your verification code is:</p>
          <h3 style="color: #2d3748; font-size: 24px; letter-spacing: 2px; margin: 0;">${verificationCode}</h3>
        </div>
        <p style="color: #718096; font-size: 14px;">This is a test email to verify that the SendGrid integration is working correctly.</p>
        <p style="color: #718096; font-size: 14px; text-align: center; margin-top: 20px;">© 2025 Tixoraa. All rights reserved.</p>
      </div>
    `
  };
  
  try {
    // Send email
    const response = await sgMail.send(msg);
    
    // Check response
    if (response && response[0] && response[0].statusCode) {
      const statusCode = response[0].statusCode;
      
      if (statusCode >= 200 && statusCode < 300) {
        colorPrint(`✓ Email sent successfully with status code: ${statusCode}`, "green");
        
        colorPrint("\nEmail Details:", "cyan");
        console.log("- From:", fromEmail);
        console.log("- To:", testEmail);
        console.log("- Subject:", msg.subject);
        console.log("- Verification Code:", verificationCode);
        
        return true;
      } else {
        colorPrint(`✗ Email sent with unexpected status code: ${statusCode}`, "yellow");
        console.log("Response:", response);
        return false;
      }
    } else {
      colorPrint("✗ Invalid response format from SendGrid", "red");
      console.log("Response:", response);
      return false;
    }
  } catch (error) {
    colorPrint(`✗ Error sending email: ${error.message}`, "red");
    
    // Provide more helpful error messages
    if (error.response) {
      console.error("SendGrid API Error Response:");
      console.error(error.response.body);
      
      // Common error codes explanations
      if (error.code === 401) {
        colorPrint("The API key appears to be invalid. Please check your SENDGRID_API_KEY.", "yellow");
      } else if (error.code === 403) {
        colorPrint("Authorization error. Your account may not be allowed to send emails yet.", "yellow");
        colorPrint("Please complete the SendGrid sender verification process.", "yellow");
      }
    }
    
    return false;
  }
}

// Get email from command line arguments or use default
const testEmail = process.argv[2] || 'test@example.com';

// Run the test
testSendGridVerification(testEmail)
  .then(success => {
    if (success) {
      colorPrint("\n======================================", "green");
      colorPrint("SendGrid verification email test completed successfully!", "green");
      colorPrint("\nPlease check your inbox for the verification email.", "cyan");
      colorPrint("======================================", "green");
    } else {
      colorPrint("\n======================================", "red");
      colorPrint("SendGrid verification email test failed.", "red");
      colorPrint("======================================", "red");
      process.exit(1);
    }
  });