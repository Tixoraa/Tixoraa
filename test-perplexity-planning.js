/**
 * Test script for Perplexity API planning advice feature
 * 
 * This script tests the Perplexity API functions directly without using HTTP
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Check if API key exists
if (!process.env.PERPLEXITY_API_KEY) {
  console.error("Error: PERPLEXITY_API_KEY environment variable is not set");
  process.exit(1);
}

// JSON extraction function
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

// Test the Planning Advice functionality
async function testPlanningAdvice() {
  console.log("Testing Event Planning Advice with Perplexity API...");
  
  const planningData = {
    eventType: "Music Festival",
    expectedAttendees: 5000,
    budget: "$250,000",
    location: "Austin, TX",
    duration: "3 days",
    targetAudience: "18-35 year olds, music enthusiasts, local residents"
  };
  
  const prompt = `
Create a detailed event planning guide in JSON format with these sections:
- checklist (array of tasks with timeframes)
- budgetBreakdown (object with budget categories and percentages)
- staffingRequirements (object with staff types and counts)
- venueConsiderations (array of venue requirements)
- riskManagement (array of potential risks and mitigation strategies)

Event Details:
Type: ${planningData.eventType}
Expected Attendees: ${planningData.expectedAttendees}
Budget: ${planningData.budget}
Location: ${planningData.location}
Duration: ${planningData.duration}
Target Audience: ${planningData.targetAudience}
`;

  try {
    console.log("Sending request to Perplexity API...");
    
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
            content: 'You are an expert event planner with extensive experience in music festivals and large-scale events. Provide detailed, actionable planning advice in a structured JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Error: ${errorData}`);
    }
    
    const data = await response.json();
    console.log("\nRaw API Response Content (first 500 chars):");
    console.log(data.choices[0].message.content.substring(0, 500) + "...");
    
    // Test JSON extraction
    console.log("\nAttempting to extract JSON from response...");
    const extractedJson = extractJsonFromMarkdown(data.choices[0].message.content);
    
    if (extractedJson) {
      console.log("✅ Successfully extracted JSON. Here's a summary of the planning guide:");
      
      // Print a summary of the extracted JSON rather than the full thing
      if (extractedJson.checklist) {
        console.log(`- Checklist: ${extractedJson.checklist.length} tasks`);
      }
      
      if (extractedJson.budgetBreakdown) {
        console.log("- Budget Breakdown:");
        Object.entries(extractedJson.budgetBreakdown).forEach(([category, percentage]) => {
          console.log(`  ${category}: ${percentage}`);
        });
      }
      
      if (extractedJson.staffingRequirements) {
        console.log("- Staffing Requirements:");
        Object.entries(extractedJson.staffingRequirements).forEach(([role, count]) => {
          console.log(`  ${role}: ${count}`);
        });
      }
      
      if (extractedJson.venueConsiderations) {
        console.log(`- Venue Considerations: ${extractedJson.venueConsiderations.length} items`);
      }
      
      if (extractedJson.riskManagement) {
        console.log(`- Risk Management: ${extractedJson.riskManagement.length} strategies`);
      }
      
      // Check if all required fields are present
      const requiredFields = [
        'checklist', 
        'budgetBreakdown', 
        'staffingRequirements', 
        'venueConsiderations', 
        'riskManagement'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in extractedJson));
      
      if (missingFields.length === 0) {
        console.log("\n✅ All required fields are present in the response");
      } else {
        console.log(`\n❌ Missing fields in response: ${missingFields.join(', ')}`);
      }
    } else {
      console.log("❌ Failed to extract JSON from response");
    }
    
    return {
      success: !!extractedJson,
      planningGuide: extractedJson
    };
  } catch (error) {
    console.error("Error getting planning advice:", error);
    return { success: false, error: error.message };
  }
}

// Run the test
testPlanningAdvice()
  .then(() => console.log("\nPlanning Advice test completed"))
  .catch(error => console.error("Test failed:", error));