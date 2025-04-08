/**
 * GitHub Token Validation Test Script
 * 
 * This script tests the GitHub token validation logic from github-pull.js
 * to verify that the token is valid and has the necessary permissions.
 * 
 * Usage:
 * node test-github-token.js
 */

const https = require('https');

// Get GitHub token from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Validate token format
function validateTokenFormat() {
  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is not set. Please set it and try again.');
    console.error('   You can create a token at https://github.com/settings/tokens');
    console.error('   Add it to your Replit Secrets with the key GITHUB_TOKEN');
    return false;
  }
  
  // Basic validation on token format
  if (!GITHUB_TOKEN.startsWith('ghp_') && !GITHUB_TOKEN.startsWith('github_pat_')) {
    console.warn('⚠️  Warning: GITHUB_TOKEN format does not match expected pattern.');
    console.warn('   Tokens usually start with "ghp_" or "github_pat_".');
    console.warn('   If you continue to experience issues, verify your token is valid.');
    // We'll still try to use it, but warn the user
  }
  
  return true;
}

// Test GitHub token validity against API
async function testTokenWithAPI() {
  console.log('Testing GitHub token against API...');
  
  try {
    const tokenTest = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: '/user',
        method: 'GET',
        headers: {
          'User-Agent': 'Tixoraa-GitHub-Token-Test',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const statusCode = res.statusCode;
          let response = {};
          
          try {
            response = JSON.parse(data);
          } catch (e) {
            // Invalid JSON, ignore
          }
          
          if (statusCode === 200) {
            resolve({ 
              valid: true, 
              message: `Token is valid and belongs to GitHub user: ${response.login}`,
              details: { 
                user: response.login,
                plan: response.plan ? response.plan.name : 'unknown',
                scopes: res.headers['x-oauth-scopes'] || 'none'
              }
            });
          } else if (statusCode === 401) {
            resolve({ 
              valid: false, 
              message: 'Invalid or expired token - please update your GitHub token in Replit Secrets',
              error: response.message
            });
          } else if (statusCode === 403) {
            resolve({ 
              valid: false, 
              message: 'Token needs proper scope permissions - please check your token settings',
              error: response.message
            });
          } else {
            resolve({ 
              valid: false, 
              message: `Unexpected GitHub API response (${statusCode})`,
              error: response.message
            });
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`GitHub API request failed: ${error.message}`));
      });
      
      req.end();
    });
    
    // Display results
    if (tokenTest.valid) {
      console.log(`✅ ${tokenTest.message}`);
      
      // Show detailed token info
      console.log('\n📊 Token Details:');
      console.log(`GitHub Username: ${tokenTest.details.user}`);
      console.log(`Account Type: ${tokenTest.details.plan}`);
      console.log(`Token Scopes: ${tokenTest.details.scopes}`);
      
      // Check for necessary scopes
      if (tokenTest.details.scopes.includes('repo')) {
        console.log('✅ Token has "repo" scope required for repository operations');
      } else {
        console.warn('⚠️  Warning: Token does not have "repo" scope, which may limit functionality');
      }
      
      return true;
    } else {
      console.error(`❌ ${tokenTest.message}`);
      if (tokenTest.error) {
        console.error(`   Error details: ${tokenTest.error}`);
      }
      return false;
    }
  } catch (error) {
    console.error(`❌ GitHub token validation failed: ${error.message}`);
    console.error('   Make sure your network connection is working and try again.');
    return false;
  }
}

// Test repository access
async function testRepositoryAccess() {
  const repo = process.env.GITHUB_REPO || 'yourusername/tixoraa';
  const branch = process.env.GITHUB_BRANCH || 'replit-frontend-deploy';
  
  console.log(`\nTesting access to repository ${repo} on branch ${branch}...`);
  
  try {
    const repoTest = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${repo}/branches/${branch}`,
        method: 'GET',
        headers: {
          'User-Agent': 'Tixoraa-GitHub-Token-Test',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const statusCode = res.statusCode;
          let response = {};
          
          try {
            response = JSON.parse(data);
          } catch (e) {
            // Invalid JSON, ignore
          }
          
          if (statusCode === 200) {
            resolve({ 
              valid: true, 
              message: `Successfully accessed repository ${repo} on branch ${branch}`,
              details: { 
                commit: response.commit ? response.commit.sha.substring(0, 7) : 'unknown',
                protected: response.protected
              }
            });
          } else if (statusCode === 404) {
            resolve({ 
              valid: false, 
              message: `Repository ${repo} or branch ${branch} not found`,
              error: response.message
            });
          } else {
            resolve({ 
              valid: false, 
              message: `Error accessing repository: ${response.message || 'Unknown error'}`,
              error: response.message
            });
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`GitHub API request failed: ${error.message}`));
      });
      
      req.end();
    });
    
    // Display results
    if (repoTest.valid) {
      console.log(`✅ ${repoTest.message}`);
      console.log(`   Latest commit: ${repoTest.details.commit}`);
      console.log(`   Branch protected: ${repoTest.details.protected}`);
      return true;
    } else {
      console.error(`❌ ${repoTest.message}`);
      if (repoTest.error) {
        console.error(`   Error details: ${repoTest.error}`);
      }
      
      console.log('\n📝 Troubleshooting steps:');
      console.log('1. Check that the repository name is correct (format: username/repo)');
      console.log('2. Verify that the branch exists in the repository');
      console.log('3. Ensure your token has access to this repository');
      return false;
    }
  } catch (error) {
    console.error(`❌ Repository access test failed: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 GitHub Token Validation Test\n');
  
  // Step 1: Validate token format
  if (!validateTokenFormat()) {
    return false;
  }
  
  // Step 2: Test token with GitHub API
  const tokenValid = await testTokenWithAPI();
  if (!tokenValid) {
    return false;
  }
  
  // Step 3: Test repository access
  const repoAccessValid = await testRepositoryAccess();
  
  // Final summary
  console.log('\n📋 Test Summary:');
  console.log(`Token Format: ${validateTokenFormat() ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`API Authentication: ${tokenValid ? '✅ Successful' : '❌ Failed'}`);
  console.log(`Repository Access: ${repoAccessValid ? '✅ Successful' : '❌ Failed'}`);
  
  const overallResult = tokenValid && repoAccessValid;
  console.log(`\nOverall Result: ${overallResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (overallResult) {
    console.log('\n✨ Your GitHub token is correctly configured and ready to use with github-pull.js');
  } else {
    console.log('\n❗ Please address the issues above to ensure proper functionality.');
  }
  
  return overallResult;
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error in main:', error);
  process.exit(1);
});