/**
 * SendGrid Service Test Script
 * 
 * This script tests the SendGrid service module implementation with proper variable naming
 * to ensure the service initializes correctly and can send emails.
 * 
 * Usage:
 * 1. Make sure SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are set in your .env file
 * 2. Run: node test-sendgrid-service.js [test_email@example.com]
 */

// Load environment variables
import 'dotenv/config';
import { MailService } from '@sendgrid/mail';
import https from 'https';

// Initialize SendGrid client
const sgMail = new MailService();

// Check environment variables
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;

if (!sendgridApiKey) {
  console.error('ERROR: SENDGRID_API_KEY environment variable is not set.');
  process.exit(1);
}

if (!sendgridFromEmail) {
  console.warn('WARNING: SENDGRID_FROM_EMAIL environment variable is not set. Will use default sender.');
}

// Get test email from command line argument or use a default
const testEmail = process.argv[2] || 'test@example.com';

// Validate email format
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

if (!isValidEmail(testEmail)) {
  console.error(`Invalid email address: ${testEmail}`);
  console.error('Usage: node test-sendgrid-service.js [valid_email@example.com]');
  process.exit(1);
}

async function testSendgridService() {
  console.log('SendGrid Service Test');
  console.log('====================');
  console.log(`Test email: ${testEmail}`);
  console.log(`SENDGRID_FROM_EMAIL: ${sendgridFromEmail || '(not set)'}`);
  console.log('\n1. Testing service initialization...');
  
  // Initialize SendGrid client
  sgMail.setApiKey(sendgridApiKey);
  console.log('   SendGrid client initialized with API key');
  
  // Test API key validity with a request to SendGrid API
  console.log('   Testing API key validity...');
  try {
    const request = https.request({
      hostname: 'api.sendgrid.com',
      path: '/v3/verified_senders',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      }
    }, (response) => {
      console.log(`   API response status code: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log('   ✅ API key is valid and has proper permissions');
      } else if (response.statusCode === 401) {
        console.error('   ❌ API key is invalid or unauthorized');
        process.exit(1);
      } else {
        console.warn(`   ⚠️ Unexpected status code: ${response.statusCode}`);
      }
    });
    
    request.on('error', (error) => {
      console.error('   ❌ Failed to connect to SendGrid API:', error.message);
    });
    
    request.end();
  } catch (error) {
    console.error('   ❌ Error testing API key:', error.message);
  }
  
  // Test verified senders via direct API call
  console.log('\n2. Testing verified senders with direct API call...');
  try {
    const verifiedSendersReq = https.request({
      hostname: 'api.sendgrid.com',
      path: '/v3/verified_senders',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          if (response.statusCode === 200) {
            const result = JSON.parse(data);
            const verifiedEmails = result.results || [];
            
            console.log(`   Found ${verifiedEmails.length} verified sender emails:`);
            verifiedEmails.forEach(sender => {
              console.log(`   - ${sender.from_email} (${sender.verified ? 'verified' : 'not verified'})`);
            });
            
            // Check if preferred sender is in the list
            const preferredEmailVerified = verifiedEmails.some(
              sender => sender.from_email === sendgridFromEmail && sender.verified
            );
            
            console.log(`\n   Preferred email (${sendgridFromEmail || 'not set'}) verified: ${preferredEmailVerified}`);
            
            // Select a verified sender
            const verifiedSender = verifiedEmails.find(sender => sender.verified)?.from_email || null;
            console.log(`   Selected verified sender: ${verifiedSender || 'None available'}`);
          } else {
            console.error(`   Failed to get verified senders: ${response.statusCode}`);
            console.error(`   Response: ${data}`);
          }
        } catch (error) {
          console.error('   Error processing verified senders:', error.message);
        }
      });
    });
    
    verifiedSendersReq.on('error', (error) => {
      console.error('   Failed to get verified senders:', error.message);
    });
    
    verifiedSendersReq.end();
  } catch (error) {
    console.error('   Error checking verified senders:', error.message);
  }
  
  // Test sending email directly with SendGrid
  console.log('\n3. Testing direct email sending with SendGrid...');
  console.log(`   Sending test email to: ${testEmail}`);
  
  try {
    // Set up email data
    const msg = {
      to: testEmail,
      from: sendgridFromEmail || 'test@example.com', // Use default if not set
      subject: 'SendGrid Direct Test',
      text: 'This is a test email sent directly with the SendGrid SDK.',
      html: '<p>This is a test email sent directly with the SendGrid SDK.</p>' +
            '<p>If you received this email, it means SendGrid is working correctly.</p>' +
            '<p>Timestamp: ' + new Date().toISOString() + '</p>'
    };
    
    // Send email
    await sgMail.send(msg);
    console.log('   ✅ Email sent successfully!');
  } catch (error) {
    console.error('   ❌ Email sending failed with error:');
    console.error(`   ${error.message}`);
    if (error.response) {
      console.error('   Response details:');
      console.error(`   - Status code: ${error.response.status}`);
      console.error(`   - Body: ${JSON.stringify(error.response.body)}`);
    }
  }
  
  console.log('\nTest completed!');
}

testSendgridService().catch(error => {
  console.error('Unexpected error in test:', error);
  process.exit(1);
});