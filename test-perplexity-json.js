/**
 * Perplexity API JSON Parsing Test
 * 
 * This script tests the JSON extraction from Markdown code blocks in Perplexity responses
 */

// Sample responses with JSON embedded in markdown code blocks (common Perplexity response format)
const sampleResponses = [
  // Sample 1: JSON in triple backtick code block
  `Here's the event planning advice:

\`\`\`json
{
  "checklist": ["Secure venue at least 6 months in advance", "Book headlining acts 4-5 months ahead", "Arrange sound and lighting equipment"],
  "budgetTips": ["Allocate 40-50% for artist fees", "Save on venue costs by booking during off-peak seasons"],
  "venueAdvice": "Look for outdoor venues with natural amphitheater settings to reduce sound system costs",
  "timelineRecommendations": "Start planning 8-12 months in advance, with marketing ramping up 3 months before"
}
\`\`\`

I hope this helps with your planning!`,

  // Sample 2: JSON with single backticks
  `The analysis of your event insights:

\`{
  "attendeeDemographics": {
    "ageGroups": {
      "18-24": 35,
      "25-34": 45,
      "35-44": 15,
      "45+": 5
    },
    "topCities": ["New York", "Los Angeles", "Chicago"]
  },
  "popularFeatures": ["VIP access", "Early bird pricing", "Mobile ticketing"],
  "improvementAreas": ["Check-in process", "Venue signage", "Food vendor variety"]
}\`

These insights should help improve your next event.`,

  // Sample 3: Complex nested JSON with trailing text
  `Based on the research, here are the event trends:

\`\`\`json
{
  "risingTrends": {
    "technology": ["AR/VR experiences", "RFID wristbands", "AI-powered matchmaking"],
    "sustainability": ["Zero-waste initiatives", "Carbon offsetting", "Plant-based catering"],
    "formats": ["Hybrid events", "Micro-conferences", "Experiential marketing"]
  },
  "decliningTrends": ["Printed materials", "Generic networking events", "Single-use plastics"],
  "industryGrowth": {
    "sectors": {
      "tech": 12.5,
      "health": 8.3,
      "education": 5.7
    }
  }
}
\`\`\`

Let me know if you need more specific information about any of these trends!`
];

// Function to extract JSON from markdown response (simulates the fix)
function extractJsonFromMarkdown(markdownText) {
  // Try to extract JSON from triple backtick code blocks first
  const codeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n```/;
  const codeBlockMatch = markdownText.match(codeBlockRegex);
  
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      console.log("Failed to parse JSON from code block:", e.message);
    }
  }
  
  // Try to extract JSON from single backtick blocks
  const singleTickRegex = /`([^`]*)`/;
  const singleTickMatch = markdownText.match(singleTickRegex);
  
  if (singleTickMatch && singleTickMatch[1]) {
    try {
      return JSON.parse(singleTickMatch[1]);
    } catch (e) {
      console.log("Failed to parse JSON from single tick block:", e.message);
    }
  }
  
  // If no code blocks found or parsing failed, try to find JSON objects directly
  const jsonRegex = /(\{[\s\S]*\})/;
  const jsonMatch = markdownText.match(jsonRegex);
  
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.log("Failed to parse direct JSON:", e.message);
    }
  }
  
  // If all methods fail, return null
  return null;
}

// Test the extraction function on all sample responses
console.log("=== PERPLEXITY JSON EXTRACTION TEST ===\n");

sampleResponses.forEach((response, index) => {
  console.log(`SAMPLE RESPONSE ${index + 1}:`);
  console.log("-".repeat(50));
  console.log(response.substring(0, 100) + "...");
  console.log("-".repeat(50));
  
  try {
    const extractedJson = extractJsonFromMarkdown(response);
    
    if (extractedJson) {
      console.log("✅ SUCCESSFULLY EXTRACTED JSON:");
      console.log(JSON.stringify(extractedJson, null, 2));
      
      // Validate structure for specific JSON types
      if (extractedJson.checklist) {
        console.log("✓ Valid Planning Advice Format");
      } else if (extractedJson.attendeeDemographics) {
        console.log("✓ Valid Event Insights Format");
      } else if (extractedJson.risingTrends) {
        console.log("✓ Valid Event Trends Format");
      }
    } else {
      console.log("❌ FAILED TO EXTRACT JSON");
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
  
  console.log("\n");
});

console.log("=== SUMMARY ===");
console.log("This test validates the JSON extraction from Markdown code blocks in Perplexity responses.");
console.log("The same extraction logic should be used in the server/perplexity.ts file.");
console.log("Functions to update with this logic:");
console.log("- getEventPlanningAdvice");
console.log("- getEventInsights");
console.log("- researchEventTrends");