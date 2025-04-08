/**
 * Direct test script for the Perplexity API
 * 
 * This script tests the Perplexity API directly without using our server endpoints
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Check if API key exists
if (!process.env.PERPLEXITY_API_KEY) {
  console.error("Error: PERPLEXITY_API_KEY environment variable is not set");
  process.exit(1);
}

// Helper function to extract JSON from different response formats
function extractJsonFromMarkdown(markdownText) {
  if (!markdownText) return null;
  
  try {
    // Case 1: Try to parse the entire response as JSON first
    try {
      return JSON.parse(markdownText);
    } catch (e) {
      // Not valid JSON, continue to other extraction methods
    }

    // Case 2: Extract JSON from markdown code blocks (```json ... ```)
    const codeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n```/g;
    const codeBlockMatch = codeBlockRegex.exec(markdownText);
    
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch (e) {
        console.log("Failed to parse JSON from code block:", e.message);
      }
    }

    // Case 3: Extract JSON from inline code blocks (` ... `)
    const inlineCodeRegex = /`([\s\S]*?)`/g;
    const inlineMatches = [...markdownText.matchAll(inlineCodeRegex)];
    
    for (const match of inlineMatches) {
      try {
        if (match[1] && (match[1].trim().startsWith('{') || match[1].trim().startsWith('['))) {
          return JSON.parse(match[1].trim());
        }
      } catch (e) {
        // Continue to next match
      }
    }

    // Case 4: Try to find JSON object in the text
    const jsonObjectRegex = /{[\s\S]*?}/g;
    const jsonMatch = jsonObjectRegex.exec(markdownText);
    
    if (jsonMatch && jsonMatch[0]) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log("Failed to parse JSON object from text:", e.message);
      }
    }

    console.log("Could not extract valid JSON from the response");
    return null;
  } catch (error) {
    console.error("Error in JSON extraction:", error);
    return null;
  }
}

// Test the Perplexity API directly
async function testPerplexityAPI() {
  console.log("Testing Perplexity API directly...");
  
  const prompt = "Analyze the following event and provide insights in JSON format with these keys: 'targetAudience', 'marketingTips', 'expectedAttendance', 'competitiveAdvantage'. Event: TechConf 2025 - A premier technology conference showcasing the latest innovations in AI, blockchain, and cloud computing. Located in San Francisco on July 15, 2025.";
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an event analytics expert. You provide insights about events in structured JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2048,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Error: ${errorData}`);
    }
    
    const data = await response.json();
    console.log("Raw API Response:", JSON.stringify(data, null, 2));
    
    // Extract the assistant's message content
    const content = data.choices[0].message.content;
    console.log("\nAssistant's Response Content:");
    console.log(content);
    
    // Test the JSON extraction on the content
    console.log("\nTesting JSON extraction:");
    const extractedJson = extractJsonFromMarkdown(content);
    
    if (extractedJson) {
      console.log("✅ Successfully extracted JSON from response:");
      console.log(JSON.stringify(extractedJson, null, 2));
    } else {
      console.log("❌ Failed to extract JSON from response");
    }
    
    return {
      rawResponse: data,
      extractedJson: extractedJson
    };
  } catch (error) {
    console.error("Error testing Perplexity API:", error);
    return null;
  }
}

// Run the test
testPerplexityAPI()
  .then(() => console.log("Direct API test completed"))
  .catch(error => console.error("Test failed:", error));