// Test the entire verification code workflow
import { 
  createVerificationCode, 
  getVerificationCode, 
  getVerificationCodes, 
  markVerificationCodeAsUsed 
} from '../server/verification-code-implementation.js';

async function testVerificationWorkflow() {
  try {
    console.log('Testing verification code workflow...');
    
    // Step 1: Create a verification code
    const testEmail = 'test@example.com';
    const testCode = '123456';
    const testUserId = 999; // Test user ID
    
    console.log('Creating verification code...');
    const newCode = await createVerificationCode({
      userId: testUserId,
      email: testEmail,
      code: testCode,
      type: 'test_verification',
      metadata: JSON.stringify({ test: true }),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    });
    
    console.log('Created verification code:', newCode);
    
    // Step 2: Get verification codes for email
    console.log('\nFetching verification codes for email:', testEmail);
    const emailCodes = await getVerificationCodes(testEmail);
    console.log('Found codes:', emailCodes.length);
    console.log('Most recent code:', emailCodes[0]);
    
    // Step 3: Get verification code by userId and code
    console.log('\nFetching verification code by userId and code...');
    const foundCode = await getVerificationCode(testUserId, testCode);
    console.log('Found code by userId and code:', foundCode);
    
    // Step 4: Mark code as used
    if (foundCode) {
      console.log('\nMarking code as used...');
      const markedCode = await markVerificationCodeAsUsed(foundCode.id);
      console.log('Marked code:', markedCode);
      
      // Step 5: Verify code is now used
      console.log('\nVerifying code is now used...');
      const usedCode = await getVerificationCode(testUserId, testCode);
      console.log('Code after marking as used:', usedCode);
      
      if (!usedCode) {
        console.log('✅ Code is no longer valid because it was marked as used - workflow is working correctly!');
      } else {
        console.log('❌ Code is still valid after being marked as used - workflow has an issue!');
      }
    }
    
  } catch (error) {
    console.error('Error in verification workflow test:', error);
  }
}

testVerificationWorkflow()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test error:', err));