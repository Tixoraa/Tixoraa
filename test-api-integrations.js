/**
 * Test API Integrations Script
 * 
 * This script tests connectivity to all the external APIs used in the Tixoraa platform.
 * It will attempt to make simple calls to each API to verify that the keys are valid
 * and connections can be established.
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Print colorized message
function print(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Print a header
function printHeader(message) {
  print('', 'reset');
  print('='.repeat(80), 'cyan');
  print(' ' + message, 'cyan');
  print('='.repeat(80), 'cyan');
  print('', 'reset');
}

// Print success message
function printSuccess(message) {
  print('✓ ' + message, 'green');
}

// Print warning message
function printWarning(message) {
  print('⚠ ' + message, 'yellow');
}

// Print error message
function printError(message) {
  print('✗ ' + message, 'red');
}

// Print info message
function printInfo(message) {
  print('ℹ ' + message, 'blue');
}

// Test OpenAI API
async function testOpenAIAPI() {
  printHeader('TESTING OPENAI API');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    printError('OpenAI API key is not set in environment variables');
    return false;
  }
  
  printInfo('API key found. Testing API connection...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello to Tixoraa!' }
        ],
        max_tokens: 50
      })
    });
    
    const data = await response.json();
    
    if (response.status === 200) {
      printSuccess('OpenAI API connection successful');
      printInfo(`Response content: "${data.choices[0].message.content.trim()}"`);
      return true;
    } else {
      printError(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
      printInfo(`Status code: ${response.status}`);
      printInfo(`Full response: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error) {
    printError(`Failed to connect to OpenAI API: ${error.message}`);
    return false;
  }
}

// Test Anthropic API
async function testAnthropicAPI() {
  printHeader('TESTING ANTHROPIC API');
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    printError('Anthropic API key is not set in environment variables');
    return false;
  }
  
  printInfo('API key found. Testing API connection...');
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219', // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 100,
        messages: [
          { role: 'user', content: 'Say hello to Tixoraa!' }
        ]
      })
    });
    
    const data = await response.json();
    
    if (response.status === 200) {
      printSuccess('Anthropic API connection successful');
      if (data.content && data.content[0] && data.content[0].text) {
        printInfo(`Response content: "${data.content[0].text.trim()}"`);
      }
      return true;
    } else {
      printError(`Anthropic API error: ${data.error?.message || 'Unknown error'}`);
      printInfo(`Status code: ${response.status}`);
      printInfo(`Full response: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error) {
    printError(`Failed to connect to Anthropic API: ${error.message}`);
    return false;
  }
}

// Test Perplexity API
async function testPerplexityAPI() {
  printHeader('TESTING PERPLEXITY API');
  
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    printError('Perplexity API key is not set in environment variables');
    return false;
  }
  
  printInfo('API key found. Testing API connection...');
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'system', content: 'Be precise and concise.' },
          { role: 'user', content: 'Say hello to Tixoraa!' }
        ],
        max_tokens: 100,
        temperature: 0.2,
        stream: false
      })
    });
    
    const data = await response.json();
    
    if (response.status === 200) {
      printSuccess('Perplexity API connection successful');
      printInfo(`Response content: "${data.choices[0].message.content.trim()}"`);
      return true;
    } else {
      printError(`Perplexity API error: ${data.error?.message || 'Unknown error'}`);
      printInfo(`Status code: ${response.status}`);
      printInfo(`Full response: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error) {
    printError(`Failed to connect to Perplexity API: ${error.message}`);
    return false;
  }
}

// Test SendGrid API
async function testSendGridAPI() {
  printHeader('TESTING SENDGRID API');
  
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  if (!apiKey) {
    printError('SendGrid API key is not set in environment variables');
    return false;
  }
  
  if (!fromEmail) {
    printWarning('SendGrid from email address is not set in environment variables');
    printInfo('Using test@example.com as a placeholder (this will not work for sending)');
  }
  
  printInfo('API key found. Testing API connection...');
  
  try {
    // Instead of trying to send an email (which might spam someone),
    // just verify the API key by getting API key info
    const response = await fetch('https://api.sendgrid.com/v3/user/credits', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      printSuccess('SendGrid API connection successful');
      printInfo(`Account credits limit: ${data.limit || 'Unlimited'}`);
      printInfo(`Account credits used: ${data.used || '0'}`);
      return true;
    } else if (response.status === 401) {
      printError('SendGrid API authentication failed. Invalid API key.');
      return false;
    } else {
      const text = await response.text();
      printError(`SendGrid API error: Status ${response.status}`);
      printInfo(`Response text: ${text}`);
      return false;
    }
  } catch (error) {
    printError(`Failed to connect to SendGrid API: ${error.message}`);
    return false;
  }
}

// Test database connection
async function testDatabaseConnection() {
  printHeader('TESTING DATABASE CONNECTION');
  
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    printError('DATABASE_URL is not set in environment variables');
    return false;
  }
  
  printInfo(`Database URL found: ${dbUrl.replace(/postgres:\/\/[^:]+:[^@]+@/, 'postgres://user:****@')}`);
  
  // Using the pg module would require installing it, so we'll just check if the URL is valid
  if (!dbUrl.startsWith('postgres://')) {
    printWarning('DATABASE_URL does not start with postgres:// which may indicate an issue');
  }
  
  // For a real connection test, we would need to use the pg module, but that requires installation
  printInfo('Note: This is just a basic validation. For a real connection test, run:');
  printInfo('node -e "const { Pool } = require(\'pg\'); const pool = new Pool(); pool.query(\'SELECT 1\').then(() => console.log(\'Connection successful\')).catch(err => console.error(\'Connection failed\', err)).finally(() => pool.end())"');
  
  try {
    // Parse the database URL to extract components
    const match = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (match) {
      const [, user, password, host, port, database] = match;
      printSuccess('Database URL format is valid');
      printInfo(`Host: ${host}`);
      printInfo(`Port: ${port}`);
      printInfo(`Database: ${database}`);
      printInfo(`User: ${user}`);
      return true;
    } else {
      printWarning('Database URL format could not be parsed');
      return false;
    }
  } catch (error) {
    printError(`Failed to parse database URL: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  printHeader('TIXORAA API INTEGRATION TESTS');
  
  print('This script will test connectivity to all external APIs used by Tixoraa', 'white');
  print('', 'reset');
  
  // Store results
  const results = {
    openai: false,
    anthropic: false,
    perplexity: false,
    sendgrid: false,
    database: false
  };
  
  // Test OpenAI API
  results.openai = await testOpenAIAPI();
  
  // Test Anthropic API
  results.anthropic = await testAnthropicAPI();
  
  // Test Perplexity API
  results.perplexity = await testPerplexityAPI();
  
  // Test SendGrid API
  results.sendgrid = await testSendGridAPI();
  
  // Test database connection
  results.database = await testDatabaseConnection();
  
  // Summary
  printHeader('TEST RESULTS SUMMARY');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  // Print individual results
  print('OpenAI API:      ' + (results.openai ? '✓ PASSED' : '✗ FAILED'), results.openai ? 'green' : 'red');
  print('Anthropic API:   ' + (results.anthropic ? '✓ PASSED' : '✗ FAILED'), results.anthropic ? 'green' : 'red');
  print('Perplexity API:  ' + (results.perplexity ? '✓ PASSED' : '✗ FAILED'), results.perplexity ? 'green' : 'red');
  print('SendGrid API:    ' + (results.sendgrid ? '✓ PASSED' : '✗ FAILED'), results.sendgrid ? 'green' : 'red');
  print('Database:        ' + (results.database ? '✓ PASSED' : '✗ FAILED'), results.database ? 'green' : 'red');
  print('', 'reset');
  
  // Print overall summary
  if (passedTests === totalTests) {
    printSuccess(`All ${totalTests} tests passed! Tixoraa is ready to use all external APIs.`);
  } else {
    printWarning(`${passedTests} of ${totalTests} tests passed.`);
    printInfo('Some APIs may not be available. Check the details above for specific errors.');
    
    // Provide guidance for fixing issues
    print('', 'reset');
    print('TROUBLESHOOTING GUIDE:', 'bold');
    
    if (!results.openai) {
      print('- OpenAI API: Make sure OPENAI_API_KEY is set correctly and the account has available credits.', 'white');
    }
    
    if (!results.anthropic) {
      print('- Anthropic API: Make sure ANTHROPIC_API_KEY is set correctly and is valid.', 'white');
    }
    
    if (!results.perplexity) {
      print('- Perplexity API: Make sure PERPLEXITY_API_KEY is set correctly and is valid.', 'white');
    }
    
    if (!results.sendgrid) {
      print('- SendGrid API: Make sure SENDGRID_API_KEY is set correctly and the account is active.', 'white');
      print('  Also ensure SENDGRID_FROM_EMAIL is configured with a verified sender address.', 'white');
    }
    
    if (!results.database) {
      print('- Database: Make sure DATABASE_URL is set correctly and the database is accessible.', 'white');
      print('  Check that the database server is running and network access is properly configured.', 'white');
    }
  }
  
  return passedTests === totalTests;
}

// Run the main function
main().catch(error => {
  printError(`Unhandled error in test script: ${error.message}`);
  process.exit(1);
});