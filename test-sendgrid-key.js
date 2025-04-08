/**
 * SendGrid API Key Test Script
 * 
 * This script tests whether the provided SendGrid API key is valid
 * by making a simple API call to the SendGrid API.
 * 
 * Usage:
 * 1. Ensure the SENDGRID_API_KEY is set in your .env file
 * 2. Run: node test-sendgrid-key.js
 */

// Load environment variables from .env file
require('dotenv').config();

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;

// Check if required environment variables are set
if (!fromEmail) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: SENDGRID_FROM_EMAIL environment variable is not set');
  console.error('Please set your verified SendGrid sender email in the .env file or in your environment');
  process.exit(1);
}

// Bail out if no API key provided
if (!apiKey) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: SENDGRID_API_KEY environment variable is not set');
  console.error('Please set your SendGrid API key in the .env file or in your environment');
  process.exit(1);
}

// First validate the API key format
if (!apiKey.startsWith('SG.')) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Invalid SendGrid API key format');
  console.error('SendGrid API keys should start with "SG."');
  console.error(`Your key starts with "${apiKey.substring(0, 3)}" instead`);
  process.exit(1);
}

// Import the SendGrid client
console.log('Importing SendGrid client...');
const sgMail = require('@sendgrid/mail');

// Test SendGrid API key
async function testSendGridApiKey() {
  console.log('\x1b[36m%s\x1b[0m', '\n=== SendGrid API Key Test ===');
  console.log('Testing API key...');
  
  try {
    // Set the API key
    sgMail.setApiKey(apiKey);
    console.log('\x1b[32m%s\x1b[0m', '✓ API key format is valid and successfully set');
    
    // Make a simple API call that doesn't send an email
    // Just fetch from the suppression invalid emails endpoint to test connectivity
    const client = require('@sendgrid/client');
    client.setApiKey(apiKey);
    
    console.log('Making API call to test connection...');
    
    const request = {
      method: 'GET',
      url: '/v3/suppression/invalid_emails',
      qs: {
        start_time: 1, 
        limit: 1
      }
    };
    
    // Set a timeout to handle hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000);
    });
    
    // Race to handle hanging requests
    const startTime = Date.now();
    await Promise.race([
      client.request(request),
      timeoutPromise
    ]);
    
    const endTime = Date.now();
    
    console.log('\x1b[32m%s\x1b[0m', `✓ API connection successful (${endTime - startTime}ms)`);
    console.log('\x1b[32m%s\x1b[0m', '✓ API key is valid and working correctly');
    
    // Log additional information
    console.log('\n\x1b[36m%s\x1b[0m', '=== API Key Information ===');
    console.log('API Key Length:', apiKey.length, 'characters');
    console.log('API Key Format:', 'Valid (starts with SG.)');
    console.log('From Email:', fromEmail);
    
    console.log('\n\x1b[32m%s\x1b[0m', 'SUCCESS! Your SendGrid API key is configured correctly.');
    
    return true;
  } catch (error) {
    console.log('\n\x1b[31m%s\x1b[0m', '=== SendGrid API Key Test FAILED ===');
    
    if (error.response) {
      // The API responded with an error
      const status = error.response.status || 'Unknown';
      
      console.error(`API Error Status: ${status}`);
      
      if (status === 401) {
        console.error('\x1b[31m%s\x1b[0m', 'UNAUTHORIZED: Your API key is invalid or revoked.');
        console.error('Please check your SendGrid account and generate a new API key if needed.');
      } else if (status === 403) {
        console.error('\x1b[31m%s\x1b[0m', 'FORBIDDEN: Your API key does not have permission to access this endpoint.');
        console.error('Make sure your SendGrid API key has the necessary permissions.');
      } else if (status === 429) {
        console.error('\x1b[31m%s\x1b[0m', 'RATE LIMITED: Too many requests have been made to the SendGrid API.');
        console.error('Please wait a moment and try again.');
      } else {
        console.error(`Error details: ${JSON.stringify(error.response.body || 'No response body')}`);
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\x1b[31m%s\x1b[0m', 'NETWORK ERROR: Could not connect to SendGrid API.');
      console.error('Please check your internet connection and try again.');
    } else if (error.message && error.message.includes('timeout')) {
      console.error('\x1b[31m%s\x1b[0m', 'TIMEOUT: The request to SendGrid API timed out.');
      console.error('This could be due to network issues or a temporary SendGrid service disruption.');
    } else {
      console.error('\x1b[31m%s\x1b[0m', 'UNKNOWN ERROR:');
      console.error(error.message || error);
    }
    
    console.log('\nTROUBLESHOOTING TIPS:');
    console.log('1. Verify your API key in your SendGrid account');
    console.log('2. Generate a new API key if needed');
    console.log('3. Check if your SendGrid account is active and in good standing');
    console.log('4. Ensure your network allows connections to SendGrid API (api.sendgrid.com)');
    
    return false;
  }
}

// Run the test
testSendGridApiKey()
  .then(success => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during test:', error);
    process.exit(1);
  });