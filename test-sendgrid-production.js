/**
 * SendGrid Production Test Script
 * 
 * This script performs comprehensive testing of the SendGrid email service
 * configuration in a production environment to diagnose verification email issues.
 * 
 * Tests performed:
 * 1. Validates API key format and existence
 * 2. Checks sender verification status 
 * 3. Tests network connectivity to SendGrid
 * 4. Attempts to send a test email with detailed error logging
 * 
 * Usage:
 * 1. Make sure SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are set in your environment
 * 2. Run: node test-sendgrid-production.js [test_email@example.com]
 */

// Load environment variables
import 'dotenv/config';
import { MailService } from '@sendgrid/mail';
import https from 'https';
import dns from 'dns';
import readline from 'readline';

// Initialize variables
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;

// Validation utilities
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function validateApiKeyFormat(apiKey) {
  if (!apiKey) {
    return { valid: false, reason: 'API key is missing' };
  }
  
  if (!apiKey.startsWith('SG.')) {
    return { valid: false, reason: 'API key does not start with "SG."' };
  }
  
  const parts = apiKey.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'API key should have 3 parts separated by dots' };
  }
  
  if (parts[1].length < 22 || parts[2].length < 43) {
    return { valid: false, reason: 'API key parts have incorrect length' };
  }
  
  return { valid: true };
}

async function testSenderVerification(apiKey, fromEmail) {
  console.log(`\nTesting sender verification for: ${fromEmail}`);
  
  // Get domain from email
  const domain = fromEmail.split('@')[1];
  
  try {
    // Check both the exact email and the domain verification
    let isVerified = false;
    let verifiedSenders = [];
    let verifiedDomains = [];
    
    // Check verified senders
    const sendersResponse = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.sendgrid.com',
        path: '/v3/verified_senders',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(new Error(`Failed to parse response: ${err.message}`));
            }
          } else {
            reject(new Error(`Failed to get verified senders. Status code: ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      req.end();
    });
    
    // Check verified domains
    const domainsResponse = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.sendgrid.com',
        path: '/v3/verified_domains',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(new Error(`Failed to parse response: ${err.message}`));
            }
          } else {
            reject(new Error(`Failed to get verified domains. Status code: ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      req.end();
    });
    
    // Process verified senders and domains
    if (sendersResponse && sendersResponse.results) {
      verifiedSenders = sendersResponse.results
        .filter(sender => sender.verified)
        .map(sender => sender.from_email);
    }
    
    if (domainsResponse && domainsResponse.results) {
      verifiedDomains = domainsResponse.results
        .filter(domainObj => domainObj.verified)
        .map(domainObj => domainObj.domain);
    }
    
    // Check if our sender is verified
    const isEmailVerified = verifiedSenders.includes(fromEmail);
    const isDomainVerified = verifiedDomains.includes(domain);
    
    isVerified = isEmailVerified || isDomainVerified;
    
    console.log(`Verified Senders: ${verifiedSenders.length > 0 ? verifiedSenders.join(', ') : 'None'}`);
    console.log(`Verified Domains: ${verifiedDomains.length > 0 ? verifiedDomains.join(', ') : 'None'}`);
    console.log(`Sender Email (${fromEmail}): ${isEmailVerified ? 'Verified ✅' : 'Not Verified ❌'}`);
    console.log(`Sender Domain (${domain}): ${isDomainVerified ? 'Verified ✅' : 'Not Verified ❌'}`);
    
    if (!isVerified) {
      if (verifiedSenders.length > 0) {
        console.log(`\nSuggestion: Use one of the verified sender emails instead: ${verifiedSenders[0]}`);
      } else if (verifiedDomains.length > 0) {
        console.log(`\nSuggestion: Use an email with one of the verified domains: ${verifiedDomains[0]}`);
      } else {
        console.log('\nSuggestion: Verify your sender email or domain in the SendGrid dashboard');
      }
    }
    
    return { 
      verified: isVerified,
      emailVerified: isEmailVerified,
      domainVerified: isDomainVerified,
      verifiedSenders, 
      verifiedDomains 
    };
  } catch (error) {
    console.error(`Error checking verification status: ${error.message}`);
    return { verified: false, error: error.message };
  }
}

async function testSendGridConnectivity() {
  console.log('\nTesting network connectivity to SendGrid...');
  
  try {
    // Test DNS resolution
    await new Promise((resolve, reject) => {
      dns.lookup('api.sendgrid.com', (err, address) => {
        if (err) {
          reject(new Error(`DNS lookup failed: ${err.message}`));
        } else {
          console.log(`DNS resolution: Success (${address}) ✅`);
          resolve(address);
        }
      });
    });
    
    // Test HTTPS connection
    await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.sendgrid.com',
        path: '/v3/user/profile',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`
        }
      }, (res) => {
        let statusCode = res.statusCode;
        let success = statusCode >= 200 && statusCode < 400; // Consider 2xx and 3xx as success
        
        console.log(`HTTPS connection: ${success ? 'Success' : 'Failed'} (HTTP ${statusCode}) ${success ? '✅' : '❌'}`);
        if (success) {
          resolve();
        } else {
          reject(new Error(`HTTP status code: ${statusCode}`));
        }
      });
      
      req.on('error', (err) => {
        console.error(`HTTPS connection: Failed ❌`);
        reject(err);
      });
      
      req.end();
    });
    
    return true;
  } catch (error) {
    console.error(`Connectivity test failed: ${error.message}`);
    return false;
  }
}

async function sendTestEmail(apiKey, fromEmail, toEmail) {
  console.log(`\nSending test email from ${fromEmail} to ${toEmail}...`);
  
  try {
    // Initialize SendGrid client
    const sgMail = new MailService();
    sgMail.setApiKey(apiKey);
    
    // Generate verification code
    const code = generateVerificationCode();
    
    // Create email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #001F2F; margin-bottom: 10px;">Tixoraa</h1>
          <p style="color: #666; font-size: 16px;">Your stage, your story</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #001F2F; margin-top: 0;">Your Verification Code</h2>
          <p style="font-size: 16px; line-height: 1.5;">This is a test email to verify SendGrid connectivity:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #001F2F; background-color: #e9ecef; padding: 10px; border-radius: 5px; display: inline-block;">
              ${code}
            </div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5;">This is only a test email. No action is required.</p>
        </div>
        
        <div style="color: #666; font-size: 14px; line-height: 1.5;">
          <p>If you did not expect this email, please ignore it.</p>
          <p>© ${new Date().getFullYear()} Tixoraa. All rights reserved.</p>
        </div>
      </div>
    `;
    
    const plainTextContent = `Tixoraa - Test Email
    
Your test verification code: ${code}
    
This is only a test email. No action is required.

© ${new Date().getFullYear()} Tixoraa. All rights reserved.`;

    // Prepare the email
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: 'Tixoraa - Email Service Test',
      text: plainTextContent,
      html: htmlContent,
    };

    // Send the email
    await sgMail.send(msg);
    console.log('Email sent successfully! ✅');
    return true;
  } catch (error) {
    console.error('Failed to send email: ❌');
    console.error(`Error: ${error.message}`);
    
    if (error.response) {
      console.error('Response details:');
      console.error(`- Status code: ${error.response.statusCode}`);
      
      try {
        if (error.response.body) {
          const body = typeof error.response.body === 'string' 
            ? JSON.parse(error.response.body) 
            : error.response.body;
          
          console.error(`- Error details: ${JSON.stringify(body, null, 2)}`);
        }
      } catch (parseError) {
        console.error(`- Raw response: ${error.response.body}`);
      }
    }
    
    return false;
  }
}

async function runSendGridTests() {
  console.log('SendGrid Production Email Test');
  console.log('============================\n');
  
  // Get test recipient email
  let toEmail = process.argv[2];
  if (!toEmail) {
    // Prompt for email if not provided
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    toEmail = await new Promise(resolve => {
      rl.question('Enter email address to send test email: ', (answer) => {
        rl.close();
        return resolve(answer);
      });
    });
  }
  
  // Validate the email
  if (!isValidEmail(toEmail)) {
    console.error(`Invalid email address: ${toEmail}`);
    process.exit(1);
  }
  
  // Check for required environment variables
  console.log('Checking environment variables:');
  
  // Check API key
  const apiKeyValidation = validateApiKeyFormat(sendgridApiKey);
  console.log(`- SENDGRID_API_KEY: ${apiKeyValidation.valid ? 'Valid format ✅' : 'Invalid format ❌'}`);
  if (!apiKeyValidation.valid) {
    console.error(`  Reason: ${apiKeyValidation.reason}`);
    console.error('  Make sure to set a valid SendGrid API key in your .env file');
    process.exit(1);
  }
  
  // Check from email
  if (!sendgridFromEmail) {
    console.log('- SENDGRID_FROM_EMAIL: Not set ❌');
    console.error('  Make sure to set SENDGRID_FROM_EMAIL in your .env file');
    process.exit(1);
  } else if (!isValidEmail(sendgridFromEmail)) {
    console.log(`- SENDGRID_FROM_EMAIL: Invalid format (${sendgridFromEmail}) ❌`);
    console.error('  Make sure SENDGRID_FROM_EMAIL contains a valid email address');
    process.exit(1);
  } else {
    console.log(`- SENDGRID_FROM_EMAIL: Valid format (${sendgridFromEmail}) ✅`);
  }
  
  // Test sender verification
  const verificationResult = await testSenderVerification(sendgridApiKey, sendgridFromEmail);
  
  // Test network connectivity
  const connectivityOk = await testSendGridConnectivity();
  
  // Send test email
  if (connectivityOk) {
    // Use verified sender if available
    let senderEmail = sendgridFromEmail;
    
    if (!verificationResult.verified) {
      if (verificationResult.verifiedSenders && verificationResult.verifiedSenders.length > 0) {
        senderEmail = verificationResult.verifiedSenders[0];
        console.log(`\nUsing verified sender (${senderEmail}) instead of unverified sender (${sendgridFromEmail})`);
      }
    }
    
    await sendTestEmail(sendgridApiKey, senderEmail, toEmail);
  } else {
    console.error('\nSkipping email test due to connectivity issues');
  }
  
  console.log('\nTest completed!');
  
  // Summary with recommendations
  console.log('\n===== SUMMARY =====');
  if (!verificationResult.verified) {
    console.log('❌ ISSUE: Sender email is not verified');
    console.log('   This is the most common reason for verification emails failing.');
    console.log('   SOLUTION: Verify your sender email or domain in the SendGrid dashboard.');
  }
  
  if (!connectivityOk) {
    console.log('❌ ISSUE: Network connectivity problems');
    console.log('   SOLUTION: Check firewall settings or network restrictions.');
  }
  
  if (verificationResult.verified && connectivityOk) {
    console.log('✅ All tests passed! If you\'re still having issues, check application logs for more details.');
  }
}

// Run the tests
runSendGridTests().catch(error => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});