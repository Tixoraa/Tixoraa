/**
 * Test Script for Perplexity Insights Service
 * 
 * This script tests the generateEventInsights and generateCompetitiveAnalysis
 * functions from the perplexity-insights module.
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Dynamic import for ESM compatibility
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check for API key
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('\x1b[31mERROR: PERPLEXITY_API_KEY environment variable is not set\x1b[0m');
  console.log('Please set PERPLEXITY_API_KEY as an environment variable or a Replit secret.');
  process.exit(1);
}

// Create temporary TypeScript module for testing
async function createTempModule() {
  console.log('\x1b[36mCreating temporary module for testing...\x1b[0m');
  
  try {
    const tempDir = path.join(__dirname, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    // Create simplified mock modules to avoid complex dependencies
    const mockVite = `
export function log(message, source) {
  console.log(\`[\${source || 'server'}] \${message}\`);
}
`;
    
    const mockPerplexity = `
import fetch from 'node-fetch';

export async function askPerplexity(options) {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.PERPLEXITY_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: options.messages,
        temperature: options.temperature || 0.2,
        max_tokens: options.max_tokens || 1024,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(\`API request failed: \${response.status} \${response.statusText} - \${errorText}\`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in askPerplexity:', error.message);
    return null;
  }
}
`;
    
    const mockJson = `
export function parsePerplexityResponse(content, functionName) {
  // Try to extract JSON from triple backtick code blocks first
  const codeBlockRegex = /\`\`\`(?:json)?\\s*\\n([\\s\\S]*?)\\n\`\`\`/;
  const codeBlockMatch = content.match(codeBlockRegex);
  
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      console.log(\`Failed to parse JSON from code block\`);
    }
  }
  
  // Try to extract JSON from single backtick blocks
  const singleTickRegex = /\`([^\`]*)\`/;
  const singleTickMatch = content.match(singleTickRegex);
  
  if (singleTickMatch && singleTickMatch[1]) {
    try {
      return JSON.parse(singleTickMatch[1]);
    } catch (e) {
      console.log(\`Failed to parse JSON from single tick block\`);
    }
  }
  
  // If no code blocks found or parsing failed, try to find JSON objects directly
  try {
    // Look for opening and closing JSON brackets
    const jsonStartIndex = content.indexOf('{');
    const jsonEndIndex = content.lastIndexOf('}') + 1;
    
    if (jsonStartIndex >= 0 && jsonEndIndex > 0 && jsonEndIndex > jsonStartIndex) {
      const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);
      return JSON.parse(jsonContent);
    }
  } catch (e) {
    console.log(\`Failed to parse direct JSON\`);
  }
  
  // If all methods fail, try to parse the whole content
  try {
    return JSON.parse(content);
  } catch (e) {
    console.log(\`Could not extract valid JSON from response\`);
    return null;
  }
}
`;
    
    // Copy the actual insights module
    const insightsSource = await fs.readFile(path.join(__dirname, 'server', 'perplexity-insights.ts'), 'utf8');
    
    // Write files to the temp directory
    await fs.writeFile(path.join(tempDir, 'vite.js'), mockVite);
    await fs.writeFile(path.join(tempDir, 'perplexity.js'), mockPerplexity);
    await fs.writeFile(path.join(tempDir, 'perplexity-json.js'), mockJson);
    await fs.writeFile(path.join(tempDir, 'perplexity-insights.js'), insightsSource);
    
    console.log('\x1b[32m✓ Temporary modules created successfully\x1b[0m');
    return tempDir;
  } catch (error) {
    console.error('\x1b[31m✗ Failed to create temporary modules:\x1b[0m', error.message);
    process.exit(1);
  }
}

// Test the event insights function
async function testEventInsights(insightsModule) {
  console.log('\n\x1b[36m=== Testing Event Insights Generation ===\x1b[0m');
  
  try {
    const result = await insightsModule.generateEventInsights(
      'Tech Innovation Summit 2025',
      'A conference bringing together industry leaders to discuss emerging technologies and future trends in software development, AI, and IoT.',
      'Technology',
      'San Francisco, CA',
      599
    );
    
    console.log('\x1b[32m✓ Function executed successfully\x1b[0m');
    console.log('\nResults:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.marketTrends.length > 0) {
      console.log('\x1b[32m✓ Received valid insights\x1b[0m');
      return true;
    } else {
      console.log('\x1b[31m✗ Insights generation failed or returned empty results\x1b[0m');
      return false;
    }
  } catch (error) {
    console.error('\x1b[31m✗ Error testing event insights:\x1b[0m', error.message);
    return false;
  }
}

// Test the competitive analysis function
async function testCompetitiveAnalysis(insightsModule) {
  console.log('\n\x1b[36m=== Testing Competitive Analysis Generation ===\x1b[0m');
  
  try {
    const result = await insightsModule.generateCompetitiveAnalysis(
      'Music Festival Summer 2025',
      'A 3-day outdoor music festival featuring top artists across multiple genres with camping options and food vendors.',
      'Music & Entertainment',
      ['Coachella', 'Lollapalooza', 'Bonnaroo']
    );
    
    console.log('\x1b[32m✓ Function executed successfully\x1b[0m');
    console.log('\nResults:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.strengths.length > 0) {
      console.log('\x1b[32m✓ Received valid competitive analysis\x1b[0m');
      return true;
    } else {
      console.log('\x1b[31m✗ Competitive analysis failed or returned empty results\x1b[0m');
      return false;
    }
  } catch (error) {
    console.error('\x1b[31m✗ Error testing competitive analysis:\x1b[0m', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('\x1b[36m=== Perplexity Insights Service Test ===\x1b[0m');
  
  try {
    // Create temporary module
    const tempDir = await createTempModule();
    
    // Import the insights module dynamically
    const { generateEventInsights, generateCompetitiveAnalysis } = await import(`${tempDir}/perplexity-insights.js`);
    const insightsModule = { generateEventInsights, generateCompetitiveAnalysis };
    
    // Run the tests
    const insightsResult = await testEventInsights(insightsModule);
    const analysisResult = await testCompetitiveAnalysis(insightsModule);
    
    // Clean up temporary files
    await fs.rm(tempDir, { recursive: true });
    
    // Summary
    console.log('\n\x1b[36m=== Test Summary ===\x1b[0m');
    console.log(`Event Insights: ${insightsResult ? '\x1b[32mPASS' : '\x1b[31mFAIL'}\x1b[0m`);
    console.log(`Competitive Analysis: ${analysisResult ? '\x1b[32mPASS' : '\x1b[31mFAIL'}\x1b[0m`);
    
    if (insightsResult && analysisResult) {
      console.log('\n\x1b[32m======================================\x1b[0m');
      console.log('\x1b[32mPerplexity Insights tests passed successfully!\x1b[0m');
      console.log('\x1b[32m======================================\x1b[0m');
    } else {
      console.log('\n\x1b[31m======================================\x1b[0m');
      console.log('\x1b[31mSome Perplexity Insights tests failed.\x1b[0m');
      console.log('\x1b[31m======================================\x1b[0m');
      process.exit(1);
    }
  } catch (error) {
    console.error('\x1b[31m✗ Test execution error:\x1b[0m', error);
    process.exit(1);
  }
}

// Execute the test runner
runTests();