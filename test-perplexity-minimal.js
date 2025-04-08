/**
 * Simple Perplexity API test script
 * 
 * This script tests basic functionality of the Perplexity API
 */

async function testPerplexityAPI() {
  console.log('Testing Perplexity API...');

  try {
    // Get the API key from environment
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.error('Error: PERPLEXITY_API_KEY environment variable is not set');
      return;
    }

    console.log('API key found. Making API request...');

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
    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\nPerplexity API test completed successfully!');
  } catch (error) {
    console.error('Error testing Perplexity API:', error.message);
  }
}

// Execute the test function
testPerplexityAPI().catch(err => {
  console.error('Unhandled error:', err);
});