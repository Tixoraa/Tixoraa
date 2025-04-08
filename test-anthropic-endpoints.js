/**
 * Test script for Anthropic API endpoints
 * 
 * This script tests the Anthropic API endpoints directly using fetch
 * with improved port scanning and diagnostics
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check Anthropic API key
const hasAnthropicApiKey = !!process.env.ANTHROPIC_API_KEY;
console.log('⚙️ ANTHROPIC_API_KEY present:', hasAnthropicApiKey ? 'Yes' : 'No');

// Possible ports to try - expanded to cover more common development server ports
const portsToTry = [3000, 5000, 8000, 4000, 5173, 5174, 3001, 8080, parseInt(process.env.PORT) || 3000];
let workingPort = null;

// Test health check endpoint on a specific port
async function testHealthEndpoint(port) {
  console.log(`\n--- Testing Health Check Endpoint on port ${port} ---`);
  const url = `http://localhost:${port}/api/ai/anthropic/health`;
  
  try {
    console.log(`Trying to connect to: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    
    // Use the enhanced logging utility for more structured output
    logEndpointStatus(port, 'Anthropic Health API', data.success, {
      status: response.status,
      message: data.message,
      apiKey: data.apiKeySet ? '✅ Present' : '❌ Missing'
    });
    
    return { success: data.success || true, data, port };
  } catch (error) {
    console.error(`Health check error (port ${port}):`, error.message);
    return { success: false, error: error.message, port };
  }
}

// Test event feedback endpoint
async function testEventFeedback(port) {
  console.log(`\n--- Testing Event Feedback Endpoint on port ${port} ---`);
  const testEvent = {
    title: "Tech Conference 2025",
    description: "Join us for the premier tech conference featuring top speakers from around the world. Learn about the latest trends in AI, blockchain, and cloud computing.",
    eventType: "Conference",
    location: "San Francisco, CA",
    startDate: "2025-06-15T09:00:00Z",
    endDate: "2025-06-17T18:00:00Z",
    ticketTiers: [
      { name: "Early Bird", price: 299 },
      { name: "Regular", price: 399 },
      { name: "VIP", price: 699 }
    ],
    category: "Technology",
    tags: ["AI", "Blockchain", "Cloud", "Technology", "Professional"]
  };

  try {
    const url = `http://localhost:${port}/api/ai/event-feedback`;
    console.log(`Trying to connect to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent),
    });
    
    const data = await response.json();
    // Use the enhanced logging utility for more structured output
    logEndpointStatus(port, 'Event Feedback API', data.success, {
      status: response.status,
      success: data.success,
      feedback: data.feedback ? {
        overallAssessment: data.feedback.overallAssessment.substring(0, 100) + '...',
        titleSuggestions: data.feedback.titleSuggestions ? data.feedback.titleSuggestions.slice(0, 3) : []
      } : 'No feedback data'
    });
    
    return { success: true, data, port };
  } catch (error) {
    console.error(`Event feedback error (port ${port}):`, error.message);
    return { success: false, error: error.message, port };
  }
}

// Test audience targeting endpoint
async function testAudienceTargeting(port) {
  console.log(`\n--- Testing Audience Targeting Endpoint on port ${port} ---`);
  const testAudience = {
    eventTitle: "Tech Conference 2025",
    eventDescription: "Join us for the premier tech conference featuring top speakers from around the world. Learn about the latest trends in AI, blockchain, and cloud computing.",
    eventType: "Conference",
    location: "San Francisco, CA",
    category: "Technology",
    targetAudience: "Technology professionals and enthusiasts",
    ticketPrices: [
      { tier: "Early Bird", price: 299 },
      { tier: "Regular", price: 399 },
      { tier: "VIP", price: 699 }
    ],
    previousEvents: [
      { 
        title: "Tech Conference 2024", 
        attendeeCount: 1200, 
        demographics: "65% male, 35% female, average age 32, 70% working in tech industry" 
      }
    ]
  };

  try {
    const url = `http://localhost:${port}/api/ai/audience-targeting`;
    console.log(`Trying to connect to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAudience),
    });
    
    const data = await response.json();
    // Use the enhanced logging utility for more structured output
    logEndpointStatus(port, 'Audience Targeting API', data.success, {
      status: response.status,
      success: data.success,
      audienceProfile: data.analysis && data.analysis.audienceProfile 
        ? 'Available' 
        : 'No audience analysis data'
    });
    
    return { success: true, data, port };
  } catch (error) {
    console.error(`Audience targeting error (port ${port}):`, error.message);
    return { success: false, error: error.message, port };
  }
}

// Enhanced logging utility function
function logEndpointStatus(port, endpoint, success, details = {}) {
  const status = success ? '✅ WORKING' : '❌ FAILED';
  console.log(`[Port ${port}] ${endpoint}: ${status}`);
  
  if (Object.keys(details).length > 0) {
    console.log('  Details:');
    Object.entries(details).forEach(([key, value]) => {
      // Handle nested objects or truncate long strings
      const displayValue = typeof value === 'object' && value !== null 
        ? 'object' 
        : typeof value === 'string' && value.length > 100 
          ? value.substring(0, 100) + '...' 
          : value;
      console.log(`    ${key}: ${displayValue}`);
    });
  }
}

// Run the tests on multiple ports
async function runTests() {
  console.log('Starting Anthropic API endpoint tests on multiple ports...');
  let successfulPort = null;
  
  // Try each port for the health endpoint
  for (const port of portsToTry) {
    console.log(`\nTrying port ${port}...`);
    const healthResult = await testHealthEndpoint(port);
    
    if (healthResult && healthResult.success) {
      console.log(`Health endpoint is working on port ${port}!`);
      successfulPort = port;
      break;
    } else {
      console.log(`Health endpoint failed on port ${port}, trying next port...`);
    }
  }
  
  // If a working port was found, test the other endpoints on that port
  if (successfulPort) {
    console.log(`\nUsing working port ${successfulPort} for all endpoint tests`);
    
    // Test event feedback and audience targeting endpoints
    await testEventFeedback(successfulPort);
    await testAudienceTargeting(successfulPort);
    
    console.log(`\nAll tests completed on port ${successfulPort}.`);
  } else {
    console.log('\nFailed to find a working port for Anthropic API endpoints.');
    console.log('Possible issues:');
    console.log(' - The server may not be running');
    console.log(' - Anthropic API endpoints might not be properly registered');
    console.log(' - ANTHROPIC_API_KEY might not be set or might be invalid');
    console.log(' - The server might be using a different port not in our test list');
  }
  
  console.log('\nTests completed.');
}

runTests();