/**
 * SendGrid Domain Verification Test Script
 * 
 * This script tests if the SendGrid sender domain is properly verified
 */

import * as dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const API_BASE_URL = 'https://api.sendgrid.com/v3';
const apiKey = process.env.SENDGRID_API_KEY;
const senderEmail = process.env.SENDGRID_FROM_EMAIL;

if (!apiKey) {
  console.error('Error: SENDGRID_API_KEY environment variable is not set');
  process.exit(1);
}

if (!senderEmail) {
  console.error('Error: SENDGRID_FROM_EMAIL environment variable is not set');
  process.exit(1);
}

console.log(`Testing domain verification for sender: ${senderEmail}`);
const domain = senderEmail.split('@')[1];
console.log(`Domain to check: ${domain}`);

async function checkDomainVerification() {
  try {
    // Get verified domains
    const response = await axios.get(`${API_BASE_URL}/verified_domains`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data || !response.data.results) {
      console.error('Error: Unexpected API response format');
      return false;
    }
    
    console.log('\nVerified Domains Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if our domain is in the verified list
    const verifiedDomains = response.data.results
      .filter(domainObj => domainObj.verified)
      .map(domainObj => domainObj.domain);
    
    console.log('\nVerified Domains:');
    verifiedDomains.forEach(d => console.log(`- ${d}`));
    
    const isVerified = verifiedDomains.includes(domain);
    console.log(`\nDomain "${domain}" verification status: ${isVerified ? 'VERIFIED ✅' : 'NOT VERIFIED ❌'}`);
    
    return isVerified;
  } catch (error) {
    console.error('Error checking domain verification:');
    
    if (error.response) {
      // The request was made and the server responded with a status code outside 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from SendGrid API');
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

async function checkSenderVerification() {
  try {
    // Get verified senders
    const response = await axios.get(`${API_BASE_URL}/verified_senders`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data || !response.data.results) {
      console.error('Error: Unexpected API response format');
      return false;
    }
    
    console.log('\nVerified Senders Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if our email is in the verified list
    const verifiedSenders = response.data.results
      .filter(sender => sender.verified)
      .map(sender => sender.from_email);
    
    console.log('\nVerified Sender Emails:');
    verifiedSenders.forEach(email => console.log(`- ${email}`));
    
    const isVerified = verifiedSenders.includes(senderEmail);
    console.log(`\nSender email "${senderEmail}" verification status: ${isVerified ? 'VERIFIED ✅' : 'NOT VERIFIED ❌'}`);
    
    return isVerified;
  } catch (error) {
    console.error('Error checking sender verification:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from SendGrid API');
    } else {
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

// Run the verification checks
async function runTests() {
  console.log('=== SendGrid Domain and Sender Verification Check ===\n');
  
  try {
    const domainVerified = await checkDomainVerification();
    const senderVerified = await checkSenderVerification();
    
    console.log('\n=== Summary ===');
    console.log(`Domain verification: ${domainVerified ? 'VERIFIED ✅' : 'NOT VERIFIED ❌'}`);
    console.log(`Sender verification: ${senderVerified ? 'VERIFIED ✅' : 'NOT VERIFIED ❌'}`);
    
    if (!domainVerified && !senderVerified) {
      console.log('\n⚠️ WARNING: Neither domain nor sender email is verified. Emails will likely be rejected or flagged as spam.');
      console.log('Please verify your domain or sender email in the SendGrid dashboard:');
      console.log('https://app.sendgrid.com/settings/sender_auth');
    } else if (!domainVerified) {
      console.log('\n⚠️ NOTE: Domain is not verified, but individual sender is verified. You can send from this specific email address.');
    } else if (!senderVerified) {
      console.log('\n⚠️ NOTE: Domain is verified but this specific sender is not individually verified.');
      console.log('This should still work as long as the domain verification includes proper DKIM/SPF records.');
    } else {
      console.log('\n✅ SUCCESS: Both domain and sender email are verified. Email sending should work correctly.');
    }
  } catch (error) {
    console.error('\nError running verification tests:', error);
  }
}

runTests();