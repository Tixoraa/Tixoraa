/**
 * Simple Anthropic Claude API Test for Tixoraa
 * 
 * This script makes a simple request to the Anthropic Claude API to verify
 * that your API key is working correctly.
 * 
 * Usage:
 * ANTHROPIC_API_KEY=your_key_here node test-anthropic-simple.js
 */

// Get API key from environment variable
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error("Error: No Anthropic API key provided");
  console.error("Set the ANTHROPIC_API_KEY environment variable to run this test");
  process.exit(1);
}

// Make a simple request to the Anthropic Claude API
async function testAnthropicAPI() {
  console.log("Testing Anthropic Claude API connection...");
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: "What are the top 3 best practices for event organizers to maximize ticket sales?"
          }
        ]
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
    console.log(result.content[0].text);
    console.log("\nFull response data:");
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    
    if (error.message.includes("401")) {
      console.error("\nAuthentication error: Your API key is invalid or expired.");
      console.error("Check that your ANTHROPIC_API_KEY is correct and try again.");
    } else if (error.message.includes("429")) {
      console.error("\nRate limit exceeded: Too many requests to the Anthropic API.");
      console.error("Wait a few minutes and try again.");
    }
  }
}

// Run the test
testAnthropicAPI();