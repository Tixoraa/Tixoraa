/**
 * Direct Perplexity API Test Script
 * 
 * This script tests the Perplexity API directly with a provided API key
 */

// Function to test the Perplexity API with a direct API key
async function testPerplexityAPI(apiKey) {
  console.log('Testing Perplexity API...');

  if (!apiKey) {
    console.error('Error: No API key provided');
    console.log('Usage: node test-perplexity-direct.js YOUR_API_KEY');
    return;
  }

  console.log('API key provided. Making API request...');

  try {
    // Make a simple request to the Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Be precise and concise.'
          },
          {
            role: 'user',
            content: 'What are the key features of the Perplexity API?'
          }
        ],
        temperature: 0.2,
        max_tokens: 200
      })
    });

    // Parse and display the response
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Extract the response content
    if (data.choices && data.choices.length > 0) {
      console.log('\nResponse content:');
      console.log(data.choices[0].message.content);
    }
    
    console.log('\nPerplexity API test completed successfully!');
  } catch (error) {
    console.error('Error testing Perplexity API:', error.message);
  }
}

// Get API key from command line argument
const apiKey = process.argv[2];
testPerplexityAPI(apiKey).catch(err => {
  console.error('Unhandled error:', err);
});