/**
 * Standalone Test for Perplexity API with JSON Response
 * 
 * This script tests the Perplexity API's ability to return properly structured JSON responses.
 * It can be used to verify that the API key is working and the service is responding correctly.
 */

import 'dotenv/config';
import fetch from 'node-fetch';

// Check for API key
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('\x1b[31mERROR: PERPLEXITY_API_KEY environment variable is not set\x1b[0m');
  console.log('Please set PERPLEXITY_API_KEY as an environment variable or a Replit secret.');
  process.exit(1);
}

async function testPerplexityAPIWithJSON() {
  console.log('\x1b[36m=== Testing Perplexity API with JSON Response ===\x1b[0m');
  
  try {
    // Request JSON data about an event planning suggestion
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are an event planning assistant. Always respond with valid JSON objects. Your response should always be a valid JSON object with keys for 'suggestions', 'considerations', and 'timeline'. Each key should contain an array of strings."
          },
          {
            role: "user",
            content: "I'm planning a tech conference for 200 people. What are some key suggestions?"
          }
        ],
        max_tokens: 1024,
        temperature: 0.2,
        frequency_penalty: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('\x1b[32m✓ API response received successfully\x1b[0m');
    
    // Log the full response for debugging
    console.log('\nRaw API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Extract and parse the content
    const content = data.choices[0].message.content;
    console.log('\nResponse Content:');
    console.log(content);
    
    // Attempt to parse the content as JSON
    try {
      const parsedContent = JSON.parse(content);
      console.log('\nParsed JSON:');
      console.log(JSON.stringify(parsedContent, null, 2));
      console.log('\x1b[32m✓ Successfully parsed response as JSON\x1b[0m');
      
      // Verify the expected structure
      if (
        Array.isArray(parsedContent.suggestions) && 
        Array.isArray(parsedContent.considerations) && 
        Array.isArray(parsedContent.timeline)
      ) {
        console.log('\x1b[32m✓ JSON has the expected structure\x1b[0m');
      } else {
        console.log('\x1b[33m⚠ JSON does not have the expected structure\x1b[0m');
      }
    } catch (parseError) {
      console.error('\x1b[31m✗ Failed to parse content as JSON:\x1b[0m', parseError.message);
      console.log('Content that failed to parse:', content);
    }
    
    return true;
  } catch (error) {
    console.error('\x1b[31m✗ Error testing Perplexity API:\x1b[0m', error.message);
    if (error.message.includes('429')) {
      console.log('\x1b[33mYou may have exceeded your rate limits. Try again later.\x1b[0m');
    }
    return false;
  }
}

// Run the test
testPerplexityAPIWithJSON()
  .then(success => {
    if (success) {
      console.log('\n\x1b[32m======================================\x1b[0m');
      console.log('\x1b[32mPerplexity API test completed successfully!\x1b[0m');
      console.log('\x1b[32m======================================\x1b[0m');
    } else {
      console.log('\n\x1b[31m======================================\x1b[0m');
      console.log('\x1b[31mPerplexity API test failed.\x1b[0m');
      console.log('\x1b[31m======================================\x1b[0m');
      process.exit(1);
    }
  });