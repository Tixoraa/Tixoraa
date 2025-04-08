import { readFileSync } from 'fs';

const schemaContent = readFileSync('./shared/schema.ts', 'utf-8');
console.log('Looking for insertUserSchema in schema.ts:');

const lines = schemaContent.split('\n');
const startIndex = lines.findIndex(line => line.includes('export const insertUserSchema'));
if (startIndex !== -1) {
  // Print 20 lines around insertUserSchema definition
  console.log(lines.slice(startIndex, startIndex + 20).join('\n'));
}

// Test firstName/lastName extraction
console.log('\nTesting firstName/lastName extraction:');
const test = { name: 'John Smith', firstName: null, lastName: null };
const extractedFirstName = test.firstName || (test.name ? test.name.split(' ')[0] : '');
const extractedLastName = test.lastName || (test.name && test.name.includes(' ') ? test.name.split(' ').slice(1).join(' ') : '');
console.log({ extractedFirstName, extractedLastName });
