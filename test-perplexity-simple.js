/**
 * Simple Perplexity API Test for Tixoraa
 * 
 * This script makes a simple request to the Perplexity API to verify
 * that your API key is working correctly.
 * 
 * Usage:
 * PERPLEXITY_API_KEY=your_key_here node test-perplexity-simple.js
 */

// Get API key from environment variable
const apiKey = process.env.PERPLEXITY_API_KEY;

if (!apiKey) {
  console.error("Error: No Perplexity API key provided");
  console.error("Set the PERPLEXITY_API_KEY environment variable to run this test");
  process.exit(1);
}

// Make a simple request to the Perplexity API
async function testPerplexityAPI() {
  console.log("Testing Perplexity API connection...");
  
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You're a helpful assistant that responds with concise answers."
          },
          {
            role: "user",
            content: "What are the top 3 best practices for event ticketing platforms?"
          }
        ],
        max_tokens: 150,
        temperature: 0.2
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log("\n✅ Connection successful!\n");
    console.log("API Response:");
    console.log("-------------");
    console.log(result.choices[0].message.content);
    console.log("\nFull response data:");
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    
    if (error.message.includes("401")) {
      console.error("\nAuthentication error: Your API key is invalid or expired.");
      console.error("Check that your PERPLEXITY_API_KEY is correct and try again.");
    } else if (error.message.includes("429")) {
      console.error("\nRate limit exceeded: Too many requests to the Perplexity API.");
      console.error("Wait a few minutes and try again.");
    }
  }
}

// Run the test
testPerplexityAPI();