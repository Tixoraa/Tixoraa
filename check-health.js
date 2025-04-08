// Health Check Script
// This script verifies that important endpoints are working correctly

import fetch from 'node-fetch';
const url = process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
  : 'http://localhost:5000';

async function checkEndpoint(path, name) {
  try {
    console.log(`Checking ${name} (${url}${path})...`);
    const response = await fetch(`${url}${path}`);
    const status = response.status;
    let data = null;
    
    try {
      data = await response.json();
    } catch (e) {
      // Not JSON or empty response
    }
    
    console.log(`  Status: ${status} ${response.statusText}`);
    if (data) {
      console.log(`  Response: ${JSON.stringify(data, null, 2).substring(0, 200)}${JSON.stringify(data, null, 2).length > 200 ? '...' : ''}`);
    }
    
    return {
      success: response.ok,
      status,
      data
    };
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function runHealthChecks() {
  console.log('Running health checks...');
  console.log('======================');
  
  // Check health endpoint
  const healthCheck = await checkEndpoint('/api/health', 'Health endpoint');
  
  // Check categories endpoint
  const categoriesCheck = await checkEndpoint('/api/categories', 'Categories endpoint');
  
  // Check events endpoint
  const eventsCheck = await checkEndpoint('/api/events', 'Events endpoint');
  
  // Check featured events endpoint
  const featuredEventsCheck = await checkEndpoint('/api/events/featured', 'Featured events endpoint');
  
  // Check locations endpoint
  const locationsCheck = await checkEndpoint('/api/locations', 'Locations endpoint');
  
  // Summary
  console.log('\nHealth Check Summary:');
  console.log('===================');
  console.log(`Health endpoint: ${healthCheck.success ? '✅ OK' : '❌ Failed'}`);
  console.log(`Categories endpoint: ${categoriesCheck.success ? '✅ OK' : '❌ Failed'}`);
  console.log(`Events endpoint: ${eventsCheck.success ? '✅ OK' : '❌ Failed'}`);
  console.log(`Featured events endpoint: ${featuredEventsCheck.success ? '✅ OK' : '❌ Failed'}`);
  console.log(`Locations endpoint: ${locationsCheck.success ? '✅ OK' : '❌ Failed'}`);
  
  const overallStatus = 
    healthCheck.success && 
    categoriesCheck.success && 
    eventsCheck.success && 
    featuredEventsCheck.success &&
    locationsCheck.success;
  
  console.log(`\nOverall status: ${overallStatus ? '✅ All checks passed' : '❌ Some checks failed'}`);
  
  if (!overallStatus) {
    console.log('\nTroubleshooting tips:');
    console.log('- Make sure the server is running on port 5000');
    console.log('- Check server logs for errors');
    console.log('- Verify that the database is properly configured');
    console.log('- Ensure required environment variables are set');
  }
}

runHealthChecks().catch(error => {
  console.error('Error running health checks:', error);
  process.exit(1);
});