// Test the API endpoints for the verification system
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api';

async function testApiEndpoints() {
  try {
    console.log('Testing API endpoints...');
    
    // Test 1: Send verification code
    const email = 'test@example.com';
    
    console.log(`\n1. Testing /api/auth/send-code for ${email}...`);
    const sendCodeResponse = await fetch(`${API_BASE_URL}/auth/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        mode: 'signup'
      })
    });
    
    const sendCodeData = await sendCodeResponse.json();
    console.log('Response status:', sendCodeResponse.status);
    console.log('Response data:', sendCodeData);
    
    // If we're in development, the code should be included in the response
    let verificationCode;
    if (sendCodeData.code) {
      verificationCode = sendCodeData.code;
      console.log('Retrieved verification code from response:', verificationCode);
    } else {
      // Use a static code for testing, assuming one was sent via email in production
      verificationCode = '123456';
      console.log('Using test verification code:', verificationCode);
    }
    
    // Test 2: Verify code
    console.log(`\n2. Testing /api/auth/verify-code with code: ${verificationCode}...`);
    const verifyCodeResponse = await fetch(`${API_BASE_URL}/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        code: verificationCode
      })
    });
    
    const verifyCodeData = await verifyCodeResponse.json();
    console.log('Response status:', verifyCodeResponse.status);
    console.log('Response data:', verifyCodeData);
    
    // Test 3: Check email status
    console.log(`\n3. Testing /api/auth/check-email for ${email}...`);
    const checkEmailResponse = await fetch(`${API_BASE_URL}/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    });
    
    const checkEmailData = await checkEmailResponse.json();
    console.log('Response status:', checkEmailResponse.status);
    console.log('Response data:', checkEmailData);
    
  } catch (error) {
    console.error('Error testing API endpoints:', error);
  }
}

// Only run if the server is running
console.log('Please make sure the development server is running on http://localhost:3000');
console.log('You can start it with "npm run dev" in another terminal');
console.log('Press Ctrl+C to cancel or any key to continue...');

// Simple way to wait for user input in Node.js
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  process.stdin.setRawMode(false);
  process.stdin.pause();
  
  testApiEndpoints()
    .then(() => console.log('API tests completed'))
    .catch(err => console.error('API test error:', err))
    .finally(() => process.exit(0));
});