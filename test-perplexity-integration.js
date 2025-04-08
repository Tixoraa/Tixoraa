/**
 * Test script for the Perplexity API integration
 * 
 * This script tests the improved JSON extraction functionality and Perplexity API endpoints.
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:5000';

// JSON extraction utility
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

// Test the event insights endpoint
async function testEventInsights() {
  console.log("Testing /api/ai/insights endpoint...");
  
  const eventData = {
    title: "TechConf 2025",
    description: "A premier technology conference showcasing the latest innovations in AI, blockchain, and cloud computing.",
    location: "San Francisco",
    date: "2025-07-15"
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ event: eventData })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Response received:", data);
    
    // Test JSON extraction on the response
    if (data && data.insights) {
      console.log("Testing JSON extraction on insights response...");
      const extractedJson = extractJsonFromMarkdown(data.insights);
      console.log("Extracted JSON:", extractedJson ? "Success" : "Failed");
      if (extractedJson) {
        console.log(JSON.stringify(extractedJson, null, 2));
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error testing event insights:", error);
    return null;
  }
}

// Test the event trends endpoint
async function testEventTrends() {
  console.log("\nTesting /api/ai/trends endpoint...");
  
  const params = {
    category: "technology",
    region: "California"
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/trends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Response received:", data);
    
    // Test JSON extraction on the response
    if (data && data.trends) {
      console.log("Testing JSON extraction on trends response...");
      const extractedJson = extractJsonFromMarkdown(data.trends);
      console.log("Extracted JSON:", extractedJson ? "Success" : "Failed");
      if (extractedJson) {
        console.log(JSON.stringify(extractedJson, null, 2));
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error testing event trends:", error);
    return null;
  }
}

// Test the event planning advice endpoint
async function testEventPlanningAdvice() {
  console.log("\nTesting /api/ai/planning-advice endpoint...");
  
  const params = {
    eventType: "conference",
    expectedAttendees: 500,
    budget: 50000,
    location: "Chicago",
    duration: "3 days"
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/planning-advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Response received:", data);
    
    // Test JSON extraction on the response
    if (data && data.advice) {
      console.log("Testing JSON extraction on planning advice response...");
      const extractedJson = extractJsonFromMarkdown(data.advice);
      console.log("Extracted JSON:", extractedJson ? "Success" : "Failed");
      if (extractedJson) {
        console.log(JSON.stringify(extractedJson, null, 2));
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error testing event planning advice:", error);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log("=== PERPLEXITY API INTEGRATION TESTS ===");
  console.log("Testing connectivity to server on port 5000...");
  
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    
    if (healthResponse.ok) {
      console.log("✅ Server is running and accessible");
      
      // Run the API endpoint tests
      await testEventInsights();
      await testEventTrends();
      await testEventPlanningAdvice();
      
      console.log("\n=== TEST SUMMARY ===");
      console.log("Integration tests completed. Check logs for details on JSON extraction performance.");
    } else {
      console.error("❌ Server is not accessible. Make sure it's running on port 5000.");
    }
  } catch (error) {
    console.error("❌ Could not connect to server:", error.message);
    console.log("Make sure the server is running with 'npm run dev' before running this test.");
  }
}

// Execute the tests
runTests();