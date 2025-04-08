#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 * This script checks if all required environment variables are set
 */

// List of required environment variables grouped by feature
const requiredEnvVars = {
  // Firebase authentication
  firebase: [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ],
  
  // Stripe payments integration
  stripe: [
    'VITE_STRIPE_PUBLIC_KEY',
    'STRIPE_SECRET_KEY'
  ],
  
  // Twilio SMS integration
  twilio: [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER'
  ],
  
  // SendGrid email integration
  sendgrid: [
    'SENDGRID_API_KEY'
  ],
  
  // OpenAI integration for AI features
  openai: [
    'OPENAI_API_KEY'
  ],
  
  // External event API integrations
  externalEventAPIs: [
    'EVENTBRITE_API_KEY',
    'TICKETMASTER_API_KEY'
  ]
};

// Optional environment variables (not critical but logged if missing)
const optionalEnvVars = [
  'SESSION_SECRET',
  'PORT',
  'VITE_APP_URL'
];

// Count status
const status = {
  present: 0,
  missing: 0,
  total: 0
};

// Check if an environment variable is set
function checkEnvVar(name, required = true) {
  status.total++;
  
  if (process.env[name]) {
    console.log(`✅ ${name}: Found`);
    status.present++;
    return true;
  } else {
    const marker = required ? '❌' : '⚠️';
    const message = required ? 'Missing (Required)' : 'Missing (Optional)';
    console.log(`${marker} ${name}: ${message}`);
    
    if (required) {
      status.missing++;
    }
    
    return false;
  }
}

// Main verification function
function verifyEnvironment() {
  console.log('Environment Variable Verification\n');
  
  // Check each group of environment variables
  for (const [groupName, vars] of Object.entries(requiredEnvVars)) {
    console.log(`\n${groupName.toUpperCase()} CONFIGURATION:`);
    
    for (const envVar of vars) {
      checkEnvVar(envVar, true);
    }
  }
  
  // Check optional variables
  console.log('\nOPTIONAL CONFIGURATION:');
  for (const envVar of optionalEnvVars) {
    checkEnvVar(envVar, false);
  }
  
  // Print summary
  console.log('\n========= SUMMARY =========');
  console.log(`Total variables checked: ${status.total}`);
  console.log(`Variables present: ${status.present}`);
  console.log(`Required variables missing: ${status.missing}`);
  
  if (status.missing > 0) {
    console.log('\n❌ Some required environment variables are missing!');
    console.log('The application may not function correctly without these variables.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All required environment variables are present!\n');
    process.exit(0);
  }
}

// Run verification
verifyEnvironment();